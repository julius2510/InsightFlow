import { NumericStats } from '@/types/statistics';

/**
 * Statistical Conventions Used:
 * - Valid values: Finite numbers (NaN, null, undefined, empty strings are excluded from calculations).
 * - Mean: Arithmetic mean = sum(x) / n.
 * - Median: Sorted middle value. If n is even, average of the two middle elements.
 * - Sample Standard Deviation: s = sqrt( sum((x - mean)^2) / (n - 1) ) for n > 1. Returns 0 if n <= 1.
 * - Quartiles: Q1 = median of the lower half, Q2 = median, Q3 = median of the upper half.
 * - Interquartile Range (IQR): Q3 - Q1.
 */

export function isNumeric(val: any): boolean {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !Number.isNaN(num) && Number.isFinite(num);
}

export function parseNumber(val: any): number | null {
  if (!isNumeric(val)) return null;
  return Number(val);
}

export function calculateMedian(sortedArr: number[]): number {
  const n = sortedArr.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  if (n % 2 !== 0) {
    return sortedArr[mid];
  }
  return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
}

export function calculateQuartiles(sortedArr: number[]): { q1: number; q2: number; q3: number; iqr: number } {
  const n = sortedArr.length;
  if (n === 0) return { q1: 0, q2: 0, q3: 0, iqr: 0 };
  if (n === 1) return { q1: sortedArr[0], q2: sortedArr[0], q3: sortedArr[0], iqr: 0 };

  const q2 = calculateMedian(sortedArr);
  const mid = Math.floor(n / 2);

  const lowerHalf = sortedArr.slice(0, mid);
  const upperHalf = n % 2 === 0 ? sortedArr.slice(mid) : sortedArr.slice(mid + 1);

  const q1 = calculateMedian(lowerHalf);
  const q3 = calculateMedian(upperHalf);
  const iqr = Number((q3 - q1).toFixed(4));

  return { q1, q2, q3, iqr };
}

export function calculateNumericStats(rawValues: any[], columnName: string): NumericStats | null {
  const totalCount = rawValues.length;
  const validNumbers: number[] = [];
  let missingCount = 0;

  for (let i = 0; i < totalCount; i++) {
    const val = rawValues[i];
    if (val === null || val === undefined || val === '' || (typeof val === 'number' && Number.isNaN(val))) {
      missingCount++;
    } else {
      const num = Number(val);
      if (!Number.isNaN(num) && Number.isFinite(num)) {
        validNumbers.push(num);
      } else {
        missingCount++;
      }
    }
  }

  const validCount = validNumbers.length;
  if (validCount === 0) return null;

  validNumbers.sort((a, b) => a - b);

  let sum = 0;
  for (let i = 0; i < validCount; i++) {
    sum += validNumbers[i];
  }

  const mean = sum / validCount;
  const min = validNumbers[0];
  const max = validNumbers[validCount - 1];
  const range = max - min;

  // Sample standard deviation: s = sqrt(sum((x - mean)^2) / (n - 1))
  let sumSquaredDiff = 0;
  for (let i = 0; i < validCount; i++) {
    const diff = validNumbers[i] - mean;
    sumSquaredDiff += diff * diff;
  }

  const variance = validCount > 1 ? sumSquaredDiff / (validCount - 1) : 0;
  const stdDev = Math.sqrt(variance);

  const { q1, q2, q3, iqr } = calculateQuartiles(validNumbers);

  return {
    column: columnName,
    count: totalCount,
    validCount,
    missingCount,
    sum: Number(sum.toFixed(4)),
    mean: Number(mean.toFixed(4)),
    median: Number(q2.toFixed(4)),
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    range: Number(range.toFixed(4)),
    stdDev: Number(stdDev.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    q1: Number(q1.toFixed(4)),
    q2: Number(q2.toFixed(4)),
    q3: Number(q3.toFixed(4)),
    iqr: Number(iqr.toFixed(4)),
  };
}
