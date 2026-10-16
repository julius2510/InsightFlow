export type InsightCategory =
  | 'quality'
  | 'distribution'
  | 'correlation'
  | 'anomaly'
  | 'trend'
  | 'recommendation';

export type InsightSeverity = 'info' | 'positive' | 'warning' | 'alert';

export interface Insight {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  type: 'factual' | 'hypothesis';
  severity: InsightSeverity;
  relatedColumns: string[];
  metricValue?: string | number;
}

export interface AISummaryResponse {
  executiveSummary: string;
  keyFindings: string[];
  hypotheses: string[];
  dataQualityObservations: string[];
  suggestedActions: string[];
  isRealAI: boolean;
  modelUsed?: string;
  error?: string;
}
