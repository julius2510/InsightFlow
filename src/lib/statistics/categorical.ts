import { CategoricalStats, CategoryFrequency } from '@/types/statistics';

export function calculateCategoricalStats(
  rawValues: any[],
  columnName: string
): CategoricalStats {
  const totalCount = rawValues.length;
  const countsMap = new Map<string, number>();
  let missingCount = 0;
  let validCount = 0;

  for (let i = 0; i < totalCount; i++) {
    const val = rawValues[i];
    if (val === null || val === undefined || val === '' || (typeof val === 'number' && Number.isNaN(val))) {
      missingCount++;
    } else {
      validCount++;
      const strVal = String(val).trim();
      countsMap.set(strVal, (countsMap.get(strVal) || 0) + 1);
    }
  }

  const frequencies: CategoryFrequency[] = [];
  let mode = 'N/A';
  let modeFrequency = 0;

  const sortedEntries = Array.from(countsMap.entries()).sort((a, b) => b[1] - a[1]);

  for (const [key, cnt] of sortedEntries) {
    if (cnt > modeFrequency) {
      modeFrequency = cnt;
      mode = key;
    }
    frequencies.push({
      value: key,
      count: cnt,
      percentage: validCount > 0 ? Number(((cnt / validCount) * 100).toFixed(2)) : 0,
    });
  }

  return {
    column: columnName,
    count: totalCount,
    validCount,
    missingCount,
    uniqueCount: countsMap.size,
    mode,
    modeFrequency,
    frequencies,
  };
}
