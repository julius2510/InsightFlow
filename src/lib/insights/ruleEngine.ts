import { Dataset, ColumnProfile } from '@/types/dataset';
import { Insight } from '@/types/insights';
import { calculateNumericStats } from '../statistics/numeric';
import { calculateCategoricalStats } from '../statistics/categorical';
import { calculatePearsonCorrelation } from '../statistics/correlation';

export interface GeneratedInsightsResult {
  summary: string;
  insights: Insight[];
  followUpQuestions: string[];
}

export function generateRuleBasedInsights(dataset: Dataset): GeneratedInsightsResult {
  const { overview, columnProfiles, rawRows, columns } = dataset;
  const insights: Insight[] = [];
  const followUpQuestions: string[] = [];

  const numericCols = columns.filter((c) => columnProfiles[c]?.type === 'number');
  const categoricalCols = columns.filter((c) => columnProfiles[c]?.type === 'string');
  const dateCols = columns.filter((c) => columnProfiles[c]?.type === 'date');

  // 1. Data Quality & Completeness Insights (Factual)
  if (overview.duplicateRowCount > 0) {
    const dupPct = ((overview.duplicateRowCount / overview.rowCount) * 100).toFixed(1);
    insights.push({
      id: 'ins-dup',
      category: 'quality',
      title: 'Duplicate Records Detected',
      description: `Found ${overview.duplicateRowCount} identical row${overview.duplicateRowCount > 1 ? 's' : ''} (${dupPct}% of dataset). Consider using the Data Cleaning workspace to deduplicate.`,
      type: 'factual',
      severity: 'warning',
      relatedColumns: [],
      metricValue: overview.duplicateRowCount,
    });
    followUpQuestions.push('Are these duplicate rows caused by duplicate logging or legitimate repeated transactions?');
  } else {
    insights.push({
      id: 'ins-no-dup',
      category: 'quality',
      title: 'High Record Uniqueness',
      description: 'Zero duplicate rows were identified across all records in the active dataset.',
      type: 'factual',
      severity: 'positive',
      relatedColumns: [],
    });
  }

  if (overview.missingCells === 0) {
    insights.push({
      id: 'ins-no-missing',
      category: 'quality',
      title: 'Complete Data Integrity',
      description: `All ${overview.rowCount.toLocaleString()} rows and ${overview.columnCount} columns are 100% complete with no null or missing cells.`,
      type: 'factual',
      severity: 'positive',
      relatedColumns: [],
    });
  } else {
    const highMissingCols = Object.values(columnProfiles).filter((p) => p.missingPercentage > 5);
    for (const col of highMissingCols) {
      insights.push({
        id: `ins-missing-${col.name}`,
        category: 'quality',
        title: `Missing Data in "${col.name}"`,
        description: `Column "${col.name}" is missing ${col.missingCount} values (${col.missingPercentage}% missing). Imputation or filtering may be recommended.`,
        type: 'factual',
        severity: col.missingPercentage > 20 ? 'alert' : 'warning',
        relatedColumns: [col.name],
        metricValue: `${col.missingPercentage}%`,
      });
      followUpQuestions.push(`Why are values missing in "${col.name}", and should they be filled with mean/mode or omitted?`);
    }
  }

  // 2. Correlation Insights (Factual + Hypothesis)
  for (let i = 0; i < numericCols.length; i++) {
    for (let j = i + 1; j < numericCols.length; j++) {
      const colA = numericCols[i];
      const colB = numericCols[j];
      const { correlation } = calculatePearsonCorrelation(
        rawRows.map((r) => r[colA]),
        rawRows.map((r) => r[colB])
      );

      if (correlation !== null && Math.abs(correlation) >= 0.65) {
        const isPos = correlation > 0;
        const strength = Math.abs(correlation) >= 0.85 ? 'Very strong' : 'Strong';
        const direction = isPos ? 'positive' : 'inverse (negative)';

        insights.push({
          id: `ins-corr-${colA}-${colB}`,
          category: 'correlation',
          title: `${strength} ${direction} correlation: ${colA} & ${colB}`,
          description: `Pearson coefficient r = ${correlation}. When "${colA}" increases, "${colB}" tends to ${isPos ? 'increase' : 'decrease'} proportionally.`,
          type: 'factual',
          severity: 'positive',
          relatedColumns: [colA, colB],
          metricValue: correlation,
        });

        insights.push({
          id: `ins-corr-hyp-${colA}-${colB}`,
          category: 'correlation',
          title: `Potential Driver: ${colA} influencing ${colB}`,
          description: `Hypothesis: Shifts in ${colA} may be a key underlying driver of ${colB} variation in this population.`,
          type: 'hypothesis',
          severity: 'info',
          relatedColumns: [colA, colB],
        });

        followUpQuestions.push(`Does an intentional increase in "${colA}" directly improve or drive "${colB}"?`);
      }
    }
  }

  // 3. Outlier / Anomaly Detection (IQR Rule: Q1 - 1.5*IQR, Q3 + 1.5*IQR)
  for (const col of numericCols) {
    const vals = rawRows.map((r) => r[col]);
    const stats = calculateNumericStats(vals, col);
    if (stats && stats.iqr > 0 && stats.validCount >= 10) {
      const lowerBound = stats.q1 - 1.5 * stats.iqr;
      const upperBound = stats.q3 + 1.5 * stats.iqr;

      const outliers = vals.filter(
        (v) => typeof v === 'number' && (v < lowerBound || v > upperBound)
      );

      if (outliers.length > 0) {
        const pct = ((outliers.length / stats.validCount) * 100).toFixed(1);
        insights.push({
          id: `ins-outlier-${col}`,
          category: 'anomaly',
          title: `Statistical Outliers in "${col}"`,
          description: `Found ${outliers.length} point${outliers.length > 1 ? 's' : ''} (${pct}%) outside expected IQR boundaries [< ${lowerBound.toFixed(2)}, > ${upperBound.toFixed(2)}]. Min outlier: ${Math.min(...outliers)}, Max: ${Math.max(...outliers)}.`,
          type: 'factual',
          severity: 'info',
          relatedColumns: [col],
          metricValue: outliers.length,
        });
        followUpQuestions.push(`Are the extreme outliers in "${col}" high-value anomalies or potential entry errors?`);
      }
    }
  }

  // 4. Categorical Distribution & Dominance
  for (const col of categoricalCols) {
    const vals = rawRows.map((r) => r[col]);
    const catStats = calculateCategoricalStats(vals, col);

    if (catStats.uniqueCount === 1) {
      insights.push({
        id: `ins-cat-single-${col}`,
        category: 'distribution',
        title: `Zero Variance in "${col}"`,
        description: `All non-null records contain the single value "${catStats.mode}". This column provides no discriminatory information.`,
        type: 'factual',
        severity: 'warning',
        relatedColumns: [col],
      });
    } else if (catStats.frequencies.length > 0) {
      const topFreq = catStats.frequencies[0];
      if (topFreq.percentage >= 70) {
        insights.push({
          id: `ins-cat-imbalance-${col}`,
          category: 'distribution',
          title: `Class Concentration in "${col}"`,
          description: `Category "${topFreq.value}" accounts for ${topFreq.percentage}% of all records, indicating high skew.`,
          type: 'factual',
          severity: 'info',
          relatedColumns: [col],
          metricValue: `${topFreq.percentage}%`,
        });
        followUpQuestions.push(`Why is "${topFreq.value}" dominating ${col}, and does this reflect a real-world sample bias?`);
      }
    }
  }

  // 5. Trend Analysis (if date column exists and numeric column exists)
  if (dateCols.length > 0 && numericCols.length > 0) {
    const dateCol = dateCols[0];
    const targetNumeric = numericCols[0];

    // Sort rows by date
    const sortedByDate = [...rawRows]
      .filter((r) => r[dateCol] && r[targetNumeric] !== null)
      .sort((a, b) => new Date(a[dateCol]).getTime() - new Date(b[dateCol]).getTime());

    if (sortedByDate.length >= 6) {
      const firstQuarter = sortedByDate.slice(0, Math.floor(sortedByDate.length / 3));
      const lastQuarter = sortedByDate.slice(-Math.floor(sortedByDate.length / 3));

      const avgEarly =
        firstQuarter.reduce((acc, cur) => acc + Number(cur[targetNumeric] || 0), 0) / firstQuarter.length;
      const avgLate =
        lastQuarter.reduce((acc, cur) => acc + Number(cur[targetNumeric] || 0), 0) / lastQuarter.length;

      const diffPct = avgEarly !== 0 ? ((avgLate - avgEarly) / Math.abs(avgEarly)) * 100 : 0;

      if (Math.abs(diffPct) >= 15) {
        const isUp = diffPct > 0;
        insights.push({
          id: `ins-trend-${targetNumeric}`,
          category: 'trend',
          title: `Temporal Trend in "${targetNumeric}"`,
          description: `Over the timeline defined by "${dateCol}", average ${targetNumeric} shifted from ${avgEarly.toFixed(2)} to ${avgLate.toFixed(2)} (${isUp ? '+' : ''}${diffPct.toFixed(1)}%).`,
          type: 'factual',
          severity: isUp ? 'positive' : 'info',
          relatedColumns: [dateCol, targetNumeric],
          metricValue: `${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}%`,
        });
        followUpQuestions.push(`What events or initiatives explain the ${isUp ? 'growth' : 'contraction'} in "${targetNumeric}" over time?`);
      }
    }
  }

  // 6. Executive Summary Text
  const summary = `Dataset "${dataset.name}" comprises ${overview.rowCount.toLocaleString()} rows and ${overview.columnCount} columns (${overview.numericColumnCount} numeric, ${overview.categoricalColumnCount} categorical). Overall data quality is rated ${overview.quality.rating} (${overview.quality.overallScore}/100) with ${overview.missingCellPercentage}% missing cells and ${overview.duplicateRowCount} duplicate rows. Analysis identified ${insights.filter((i) => i.category === 'correlation').length} notable correlation signals and ${insights.filter((i) => i.category === 'anomaly').length} anomaly boundary clusters.`;

  // Default follow-up questions if few were produced
  if (followUpQuestions.length < 3) {
    if (numericCols.length > 0) {
      followUpQuestions.push(`What segmentation reveals the biggest spread in "${numericCols[0]}"?`);
    }
    if (categoricalCols.length > 0) {
      followUpQuestions.push(`How do the top groups in "${categoricalCols[0]}" compare against key outcomes?`);
    }
    followUpQuestions.push('Which external factors not present in this dataset might explain the variance?');
  }

  return {
    summary,
    insights,
    followUpQuestions: Array.from(new Set(followUpQuestions)).slice(0, 5),
  };
}
