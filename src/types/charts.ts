export type ChartType =
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'histogram'
  | 'scatter'
  | 'heatmap';

export type AggregationMethod = 'none' | 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  aggregation: AggregationMethod;
  bins?: number; // for histogram
  showGrid: boolean;
  showLegend: boolean;
  colorTheme: string;
}

export interface ChartTheme {
  id: string;
  name: string;
  colors: string[];
}
