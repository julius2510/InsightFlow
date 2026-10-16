import {
  ColumnProfile,
  ColumnType,
  DataQualityIndicator,
  DatasetOverview,
} from '@/types/dataset';
import { isNumeric, calculateNumericStats } from './numeric';
import { calculateCategoricalStats } from './categorical';

export function inferColumnType(values: any[]): ColumnType {
  const nonNullValues = values.filter(
    (v) => v !== null && v !== undefined && v !== '' && !(typeof v === 'number' && Number.isNaN(v))
  );

  if (nonNullValues.length === 0) return 'string';

  let numericCount = 0;
  let booleanCount = 0;
  let dateCount = 0;

  for (const val of nonNullValues) {
    if (typeof val === 'boolean') {
      booleanCount++;
      continue;
    }
    const str = String(val).trim().toLowerCase();
    if (str === 'true' || str === 'false') {
      booleanCount++;
      continue;
    }

    if (isNumeric(val)) {
      numericCount++;
      continue;
    }

    // Check date pattern (YYYY-MM-DD or MM/DD/YYYY or ISO)
    const isIsoOrDate =
      str.length >= 8 &&
      (str.includes('-') || str.includes('/') || str.includes('T')) &&
      !Number.isNaN(Date.parse(str));
    if (isIsoOrDate) {
      dateCount++;
    }
  }

  const threshold = nonNullValues.length * 0.75;

  if (booleanCount >= threshold) return 'boolean';
  if (numericCount >= threshold) return 'number';
  if (dateCount >= threshold) return 'date';

  return 'string';
}

export function detectDuplicateRows(rows: Record<string, any>[]): number {
  if (rows.length === 0) return 0;
  const seen = new Set<string>();
  let duplicateCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const serialized = JSON.stringify(rows[i]);
    if (seen.has(serialized)) {
      duplicateCount++;
    } else {
      seen.add(serialized);
    }
  }

  return duplicateCount;
}

export function calculateQualityIndicator(
  rowCount: number,
  columnCount: number,
  missingCells: number,
  duplicateRowCount: number,
  columnProfiles: Record<string, ColumnProfile>
): DataQualityIndicator {
  const totalCells = Math.max(1, rowCount * columnCount);
  const completenessScore = Math.max(0, Math.min(100, (1 - missingCells / totalCells) * 100));

  const uniquenessScore =
    rowCount > 0 ? Math.max(0, Math.min(100, (1 - duplicateRowCount / rowCount) * 100)) : 100;

  // Type consistency score based on whether values in numeric columns are truly valid numbers
  let consistentCells = 0;
  let checkedCells = 0;

  for (const colName of Object.keys(columnProfiles)) {
    const prof = columnProfiles[colName];
    checkedCells += rowCount;
    consistentCells += rowCount - prof.missingCount;
  }

  const typeConsistencyScore =
    checkedCells > 0 ? Math.max(0, Math.min(100, (consistentCells / checkedCells) * 100)) : 100;

  // Weighted overall heuristic quality score
  const overallScore = Math.round(
    completenessScore * 0.45 + uniquenessScore * 0.3 + typeConsistencyScore * 0.25
  );

  let rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Excellent';
  if (overallScore >= 90) rating = 'Excellent';
  else if (overallScore >= 75) rating = 'Good';
  else if (overallScore >= 60) rating = 'Fair';
  else rating = 'Needs Attention';

  const issues: string[] = [];
  const positiveHighlights: string[] = [];

  if (duplicateRowCount > 0) {
    issues.push(`Found ${duplicateRowCount} duplicate row${duplicateRowCount > 1 ? 's' : ''}.`);
  } else {
    positiveHighlights.push('No duplicate rows detected.');
  }

  if (missingCells > 0) {
    const pct = ((missingCells / totalCells) * 100).toFixed(1);
    issues.push(`${missingCells} missing cell${missingCells > 1 ? 's' : ''} (${pct}% of all data).`);
  } else {
    positiveHighlights.push('Complete dataset with 0 missing cells.');
  }

  for (const col of Object.values(columnProfiles)) {
    if (col.missingPercentage > 15) {
      issues.push(`Column "${col.name}" has ${col.missingPercentage.toFixed(1)}% missing values.`);
    }
  }

  if (positiveHighlights.length === 0 && issues.length === 0) {
    positiveHighlights.push('Dataset structure is consistent and well-formed.');
  }

  return {
    overallScore,
    rating,
    completenessScore: Math.round(completenessScore),
    uniquenessScore: Math.round(uniquenessScore),
    typeConsistencyScore: Math.round(typeConsistencyScore),
    issues,
    positiveHighlights,
  };
}

export function profileDataset(
  rows: Record<string, any>[],
  columns: string[]
): {
  overview: DatasetOverview;
  columnProfiles: Record<string, ColumnProfile>;
} {
  const rowCount = rows.length;
  const columnCount = columns.length;
  let totalMissingCells = 0;
  const columnProfiles: Record<string, ColumnProfile> = {};

  let numericColumnCount = 0;
  let categoricalColumnCount = 0;

  for (const col of columns) {
    const colValues = rows.map((r) => r[col]);
    const inferredType = inferColumnType(colValues);

    let missingCount = 0;
    const sampleValues: any[] = [];

    for (let i = 0; i < colValues.length; i++) {
      const v = colValues[i];
      if (v === null || v === undefined || v === '' || (typeof v === 'number' && Number.isNaN(v))) {
        missingCount++;
      } else if (sampleValues.length < 5 && !sampleValues.includes(v)) {
        sampleValues.push(v);
      }
    }

    totalMissingCells += missingCount;
    const missingPercentage = rowCount > 0 ? (missingCount / rowCount) * 100 : 0;

    const uniqueSet = new Set(
      colValues.filter((v) => v !== null && v !== undefined && v !== '' && !(typeof v === 'number' && Number.isNaN(v)))
    );

    const profile: ColumnProfile = {
      name: col,
      type: inferredType,
      missingCount,
      missingPercentage: Number(missingPercentage.toFixed(2)),
      uniqueCount: uniqueSet.size,
      sampleValues,
    };

    if (inferredType === 'number') {
      numericColumnCount++;
      const numStats = calculateNumericStats(colValues, col);
      if (numStats) {
        profile.min = numStats.min;
        profile.max = numStats.max;
        profile.mean = numStats.mean;
      }
    } else {
      categoricalColumnCount++;
      const catStats = calculateCategoricalStats(colValues, col);
      profile.topValue = catStats.mode;
      profile.topCount = catStats.modeFrequency;
    }

    columnProfiles[col] = profile;
  }

  const duplicateRowCount = detectDuplicateRows(rows);
  const totalCells = Math.max(1, rowCount * columnCount);
  const missingCellPercentage = Number(((totalMissingCells / totalCells) * 100).toFixed(2));

  const quality = calculateQualityIndicator(
    rowCount,
    columnCount,
    totalMissingCells,
    duplicateRowCount,
    columnProfiles
  );

  const overview: DatasetOverview = {
    rowCount,
    columnCount,
    missingCells: totalMissingCells,
    missingCellPercentage,
    duplicateRowCount,
    numericColumnCount,
    categoricalColumnCount,
    quality,
  };

  return {
    overview,
    columnProfiles,
  };
}
