export interface NumericStats {
  column: string;
  count: number;
  validCount: number;
  missingCount: number;
  sum: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  range: number;
  stdDev: number; // Sample standard deviation: s = sqrt(sum((x - mean)^2) / (n - 1))
  variance: number;
  q1: number;
  q2: number; // Median
  q3: number;
  iqr: number;
}

export interface CategoryFrequency {
  value: string;
  count: number;
  percentage: number;
}

export interface CategoricalStats {
  column: string;
  count: number;
  validCount: number;
  missingCount: number;
  uniqueCount: number;
  mode: string;
  modeFrequency: number;
  frequencies: CategoryFrequency[];
}

export interface CorrelationCell {
  col1: string;
  col2: string;
  correlation: number | null; // Pearson r (-1 to 1, or null if insufficient variance)
  sampleSize: number;
}

export interface CorrelationMatrix {
  columns: string[];
  cells: CorrelationCell[];
  matrix: (number | null)[][];
}
