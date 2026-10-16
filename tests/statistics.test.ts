import { describe, it, expect } from 'vitest';
import {
  calculateNumericStats,
  calculateMedian,
  calculateQuartiles,
  isNumeric,
} from '../src/lib/statistics/numeric';
import { calculateCategoricalStats } from '../src/lib/statistics/categorical';
import { calculatePearsonCorrelation } from '../src/lib/statistics/correlation';

describe('Numeric Statistics Calculations', () => {
  it('correctly identifies numeric values', () => {
    expect(isNumeric(42)).toBe(true);
    expect(isNumeric('42.5')).toBe(true);
    expect(isNumeric('-100')).toBe(true);
    expect(isNumeric(0)).toBe(true);
    expect(isNumeric('')).toBe(false);
    expect(isNumeric(null)).toBe(false);
    expect(isNumeric(undefined)).toBe(false);
    expect(isNumeric('abc')).toBe(false);
    expect(isNumeric(NaN)).toBe(false);
  });

  it('calculates median for odd and even length arrays', () => {
    expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3);
    expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    expect(calculateMedian([10])).toBe(10);
  });

  it('calculates quartiles and IQR accurately', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const { q1, q2, q3, iqr } = calculateQuartiles(data);
    expect(q2).toBe(5);
    expect(q1).toBe(2.5);
    expect(q3).toBe(7.5);
    expect(iqr).toBe(5);
  });

  it('calculates full numeric stats including sample standard deviation', () => {
    // Array: [2, 4, 4, 4, 5, 5, 7, 9]
    // sum = 40, count = 8, mean = 5
    // variance = sum((x - 5)^2) / 7 = (9 + 1 + 1 + 1 + 0 + 0 + 4 + 16) / 7 = 32 / 7 = 4.5714
    // stdDev = sqrt(4.5714) = 2.1381
    const raw = [2, 4, 4, 4, 5, 5, 7, 9, null, ''];
    const stats = calculateNumericStats(raw, 'testCol');

    expect(stats).not.toBeNull();
    expect(stats?.count).toBe(10);
    expect(stats?.validCount).toBe(8);
    expect(stats?.missingCount).toBe(2);
    expect(stats?.mean).toBe(5);
    expect(stats?.median).toBe(4.5);
    expect(stats?.min).toBe(2);
    expect(stats?.max).toBe(9);
    expect(stats?.range).toBe(7);
    expect(stats?.variance).toBeCloseTo(4.5714, 2);
    expect(stats?.stdDev).toBeCloseTo(2.1381, 2);
  });

  it('returns null when no valid numbers exist', () => {
    const stats = calculateNumericStats(['a', 'b', null], 'invalid');
    expect(stats).toBeNull();
  });
});

describe('Categorical Statistics Calculations', () => {
  it('calculates unique counts, mode, and frequencies', () => {
    const raw = ['Apple', 'Banana', 'Apple', 'Cherry', 'Apple', 'Banana', null];
    const stats = calculateCategoricalStats(raw, 'fruits');

    expect(stats.count).toBe(7);
    expect(stats.validCount).toBe(6);
    expect(stats.missingCount).toBe(1);
    expect(stats.uniqueCount).toBe(3);
    expect(stats.mode).toBe('Apple');
    expect(stats.modeFrequency).toBe(3);

    // Apple frequency: 3 / 6 = 50%
    const appleFreq = stats.frequencies.find((f) => f.value === 'Apple');
    expect(appleFreq?.count).toBe(3);
    expect(appleFreq?.percentage).toBe(50);
  });
});

describe('Correlation Calculations', () => {
  it('calculates perfect positive and negative Pearson correlations', () => {
    const x = [1, 2, 3, 4, 5];
    const yPos = [2, 4, 6, 8, 10];
    const yNeg = [10, 8, 6, 4, 2];

    const posRes = calculatePearsonCorrelation(x, yPos);
    expect(posRes.correlation).toBe(1);

    const negRes = calculatePearsonCorrelation(x, yNeg);
    expect(negRes.correlation).toBe(-1);
  });

  it('handles pairwise missing values', () => {
    const x = [1, 2, null, 4, 5];
    const y = [2, 4, 6, null, 10];
    const res = calculatePearsonCorrelation(x, y);

    expect(res.sampleSize).toBe(3); // only pairs [1,2], [2,4], [5,10]
    expect(res.correlation).toBe(1);
  });

  it('returns null if sample size is insufficient or variance is 0', () => {
    const x = [5, 5, 5, 5];
    const y = [1, 2, 3, 4];
    const res = calculatePearsonCorrelation(x, y);
    expect(res.correlation).toBeNull();
  });
});
