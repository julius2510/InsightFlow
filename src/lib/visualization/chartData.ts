import { ChartConfig, ChartType } from '@/types/charts';
import { ColumnProfile } from '@/types/dataset';
import { isNumeric } from '../statistics/numeric';

export interface ChartValidationResult {
  valid: boolean;
  error?: string;
}

export const CHART_PALETTES: { id: string; name: string; colors: string[] }[] = [
  {
    id: 'violet-indigo',
    name: 'Electric Indigo',
    colors: ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6', '#f59e0b', '#10b981'],
  },
  {
    id: 'ocean-cyan',
    name: 'Ocean Breeze',
    colors: ['#0284c7', '#06b6d4', '#0d9488', '#3b82f6', '#6366f1', '#2dd4bf', '#38bdf8'],
  },
  {
    id: 'emerald-teal',
    name: 'Forest Emerald',
    colors: ['#059669', '#10b981', '#14b8a6', '#84cc16', '#22c55e', '#65a30d', '#047857'],
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Glow',
    colors: ['#f97316', '#f59e0b', '#ef4444', '#ec4899', '#d97706', '#ea580c', '#e11d48'],
  },
];

export function validateChartConfig(
  config: ChartConfig,
  columnProfiles: Record<string, ColumnProfile>
): ChartValidationResult {
  const { type, xAxis, yAxis } = config;

  if (type === 'heatmap') {
    return { valid: true };
  }

  if (!xAxis) {
    return { valid: false, error: 'Please select an X-Axis field.' };
  }

  const xProfile = columnProfiles[xAxis];
  const yProfile = yAxis ? columnProfiles[yAxis] : undefined;

  if (type === 'histogram') {
    if (xProfile && xProfile.type !== 'number') {
      return {
        valid: false,
        error: `Histogram requires a numerical field for the X-Axis. "${xAxis}" is inferred as ${xProfile.type}.`,
      };
    }
    return { valid: true };
  }

  if (type === 'scatter') {
    if (!yAxis) {
      return { valid: false, error: 'Scatter plot requires both X-Axis and Y-Axis fields.' };
    }
    if (xProfile && xProfile.type !== 'number') {
      return {
        valid: false,
        error: `Scatter plot requires numerical X-Axis. "${xAxis}" is ${xProfile.type}.`,
      };
    }
    if (yProfile && yProfile.type !== 'number') {
      return {
        valid: false,
        error: `Scatter plot requires numerical Y-Axis. "${yAxis}" is ${yProfile.type}.`,
      };
    }
    return { valid: true };
  }

  if (config.aggregation !== 'count' && !yAxis) {
    return {
      valid: false,
      error: `Please select a Y-Axis numerical field to calculate ${config.aggregation}.`,
    };
  }

  if (yProfile && yProfile.type !== 'number' && config.aggregation !== 'count') {
    return {
      valid: false,
      error: `Aggregation "${config.aggregation}" requires a numerical Y-Axis. "${yAxis}" is ${yProfile.type}.`,
    };
  }

  return { valid: true };
}

export function generateHistogramData(
  rows: Record<string, any>[],
  column: string,
  binCount: number = 8
): { bin: string; count: number; rangeMin: number; rangeMax: number }[] {
  const numericValues = rows
    .map((r) => r[column])
    .filter((v) => isNumeric(v))
    .map(Number);

  if (numericValues.length === 0) return [];

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  if (min === max) {
    return [{ bin: `${min}`, count: numericValues.length, rangeMin: min, rangeMax: max }];
  }

  const step = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => {
    const rangeMin = min + i * step;
    const rangeMax = i === binCount - 1 ? max : rangeMin + step;
    return {
      rangeMin: Number(rangeMin.toFixed(2)),
      rangeMax: Number(rangeMax.toFixed(2)),
      bin: `${rangeMin.toFixed(1)} - ${rangeMax.toFixed(1)}`,
      count: 0,
    };
  });

  for (const val of numericValues) {
    for (let i = 0; i < bins.length; i++) {
      if (i === bins.length - 1) {
        if (val >= bins[i].rangeMin && val <= bins[i].rangeMax) {
          bins[i].count++;
          break;
        }
      } else {
        if (val >= bins[i].rangeMin && val < bins[i].rangeMax) {
          bins[i].count++;
          break;
        }
      }
    }
  }

  return bins;
}

export function prepareChartData(
  rows: Record<string, any>[],
  config: ChartConfig,
  columnProfiles: Record<string, ColumnProfile>
): {
  data: any[];
  keys: string[];
} {
  const validation = validateChartConfig(config, columnProfiles);
  if (!validation.valid) {
    return { data: [], keys: [] };
  }

  const { type, xAxis, yAxis, groupBy, aggregation } = config;

  // 1. Histogram
  if (type === 'histogram') {
    const bins = generateHistogramData(rows, xAxis, config.bins || 8);
    return {
      data: bins,
      keys: ['count'],
    };
  }

  // 2. Scatter Plot
  if (type === 'scatter') {
    const points: any[] = [];
    for (const r of rows) {
      if (isNumeric(r[xAxis]) && isNumeric(r[yAxis])) {
        points.push({
          x: Number(r[xAxis]),
          y: Number(r[yAxis]),
          [xAxis]: Number(r[xAxis]),
          [yAxis]: Number(r[yAxis]),
          label: groupBy ? r[groupBy] : undefined,
        });
      }
    }
    return {
      data: points,
      keys: [yAxis],
    };
  }

  // 3. Raw mode (no aggregation)
  if (aggregation === 'none') {
    const formatted = rows.slice(0, 50).map((r, idx) => ({
      name: r[xAxis] ? String(r[xAxis]) : `Row ${idx + 1}`,
      [yAxis]: isNumeric(r[yAxis]) ? Number(r[yAxis]) : 0,
    }));
    return {
      data: formatted,
      keys: [yAxis],
    };
  }

  // 4. Aggregated Bar / Line / Area / Pie
  // Grouping by X-Axis (and optional second dimension GroupBy)
  const groupMap = new Map<string, { count: number; sum: number; min: number; max: number; subGroups?: Record<string, number> }>();

  for (const r of rows) {
    const xKey = r[xAxis] !== null && r[xAxis] !== undefined ? String(r[xAxis]).trim() : 'Null';
    const yVal = isNumeric(r[yAxis]) ? Number(r[yAxis]) : 0;
    const subGroupKey = groupBy ? String(r[groupBy] ?? 'Other').trim() : null;

    if (!groupMap.has(xKey)) {
      groupMap.set(xKey, {
        count: 0,
        sum: 0,
        min: yVal,
        max: yVal,
        subGroups: subGroupKey ? {} : undefined,
      });
    }

    const entry = groupMap.get(xKey)!;
    entry.count++;
    entry.sum += yVal;
    entry.min = Math.min(entry.min, yVal);
    entry.max = Math.max(entry.max, yVal);

    if (subGroupKey && entry.subGroups) {
      entry.subGroups[subGroupKey] = (entry.subGroups[subGroupKey] || 0) + (aggregation === 'count' ? 1 : yVal);
    }
  }

  const allSubKeys = new Set<string>();
  const chartPoints: any[] = [];

  for (const [key, stats] of groupMap.entries()) {
    let finalVal = 0;
    if (aggregation === 'count') {
      finalVal = stats.count;
    } else if (aggregation === 'sum') {
      finalVal = Number(stats.sum.toFixed(2));
    } else if (aggregation === 'avg') {
      finalVal = Number((stats.sum / (stats.count || 1)).toFixed(2));
    } else if (aggregation === 'min') {
      finalVal = Number(stats.min.toFixed(2));
    } else if (aggregation === 'max') {
      finalVal = Number(stats.max.toFixed(2));
    }

    const point: Record<string, any> = {
      [xAxis]: key,
      value: finalVal,
      [yAxis || 'value']: finalVal,
    };

    if (stats.subGroups) {
      for (const [subK, subV] of Object.entries(stats.subGroups)) {
        point[subK] = Number(subV.toFixed(2));
        allSubKeys.add(subK);
      }
    }

    chartPoints.push(point);
  }

  // Sort by final value descending for clean visual hierarchy (limit top 25 categories)
  chartPoints.sort((a, b) => (b.value || 0) - (a.value || 0));
  const limitedPoints = chartPoints.slice(0, 25);

  const keys = allSubKeys.size > 0 ? Array.from(allSubKeys) : [yAxis || 'value'];

  return {
    data: limitedPoints,
    keys,
  };
}

export function getSensibleChartConfig(
  columns: string[],
  columnProfiles: Record<string, ColumnProfile>
): ChartConfig {
  const numericCols = columns.filter((c) => columnProfiles[c]?.type === 'number');
  const categoricalCols = columns.filter(
    (c) => columnProfiles[c]?.type === 'string' && (columnProfiles[c]?.uniqueCount || 0) <= 25
  );

  let xAxis = categoricalCols[0] || columns[0] || '';
  let yAxis = numericCols[0] || '';

  return {
    type: 'bar',
    title: `${yAxis ? yAxis : 'Count'} by ${xAxis}`,
    xAxis,
    yAxis,
    aggregation: yAxis ? 'sum' : 'count',
    showGrid: true,
    showLegend: true,
    colorTheme: 'violet-indigo',
  };
}
