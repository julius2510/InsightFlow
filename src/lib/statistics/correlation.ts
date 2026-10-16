import { CorrelationCell, CorrelationMatrix } from '@/types/statistics';
import { isNumeric } from './numeric';

/**
 * Calculates Pearson Correlation Coefficient r between two numeric arrays.
 * Pairs with null/empty values are dropped (pairwise deletion).
 * Returns null if variance is zero, sample size < 3, or non-finite.
 */
export function calculatePearsonCorrelation(
  xVals: any[],
  yVals: any[]
): { correlation: number | null; sampleSize: number } {
  const n = Math.min(xVals.length, yVals.length);
  const validPairs: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    const x = xVals[i];
    const y = yVals[i];
    if (isNumeric(x) && isNumeric(y)) {
      validPairs.push([Number(x), Number(y)]);
    }
  }

  const sampleSize = validPairs.length;
  if (sampleSize < 3) {
    return { correlation: null, sampleSize };
  }

  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < sampleSize; i++) {
    sumX += validPairs[i][0];
    sumY += validPairs[i][1];
  }

  const meanX = sumX / sampleSize;
  const meanY = sumY / sampleSize;

  let sumDiffProduct = 0;
  let sumSquareDiffX = 0;
  let sumSquareDiffY = 0;

  for (let i = 0; i < sampleSize; i++) {
    const diffX = validPairs[i][0] - meanX;
    const diffY = validPairs[i][1] - meanY;
    sumDiffProduct += diffX * diffY;
    sumSquareDiffX += diffX * diffX;
    sumSquareDiffY += diffY * diffY;
  }

  const denominator = Math.sqrt(sumSquareDiffX * sumSquareDiffY);
  if (denominator === 0 || !Number.isFinite(denominator)) {
    return { correlation: null, sampleSize };
  }

  const r = sumDiffProduct / denominator;
  // Clamp between -1 and 1 to eliminate floating point rounding error
  const clampedR = Math.max(-1, Math.min(1, r));

  return {
    correlation: Number(clampedR.toFixed(4)),
    sampleSize,
  };
}

export function computeCorrelationMatrix(
  rows: Record<string, any>[],
  numericColumns: string[]
): CorrelationMatrix {
  const matrix: (number | null)[][] = [];
  const cells: CorrelationCell[] = [];

  for (let i = 0; i < numericColumns.length; i++) {
    matrix[i] = [];
    const col1 = numericColumns[i];
    const col1Vals = rows.map((r) => r[col1]);

    for (let j = 0; j < numericColumns.length; j++) {
      const col2 = numericColumns[j];
      if (i === j) {
        matrix[i][j] = 1;
        cells.push({ col1, col2, correlation: 1, sampleSize: rows.length });
      } else if (j < i) {
        // Symmetric matrix
        const existingVal = matrix[j][i];
        matrix[i][j] = existingVal;
        cells.push({ col1, col2, correlation: existingVal, sampleSize: rows.length });
      } else {
        const col2Vals = rows.map((r) => r[col2]);
        const { correlation, sampleSize } = calculatePearsonCorrelation(col1Vals, col2Vals);
        matrix[i][j] = correlation;
        cells.push({ col1, col2, correlation, sampleSize });
      }
    }
  }

  return {
    columns: numericColumns,
    cells,
    matrix,
  };
}
