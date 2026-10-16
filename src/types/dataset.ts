export type ColumnType = 'number' | 'string' | 'date' | 'boolean';

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  sampleValues: (string | number | boolean | null)[];
  min?: number;
  max?: number;
  mean?: number;
  topValue?: string;
  topCount?: number;
}

export interface DataQualityIndicator {
  overallScore: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  completenessScore: number; // 0 - 100
  uniquenessScore: number; // 0 - 100
  typeConsistencyScore: number; // 0 - 100
  issues: string[];
  positiveHighlights: string[];
}

export interface DatasetOverview {
  rowCount: number;
  columnCount: number;
  missingCells: number;
  missingCellPercentage: number;
  duplicateRowCount: number;
  numericColumnCount: number;
  categoricalColumnCount: number;
  quality: DataQualityIndicator;
}

export interface Dataset {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  rawRows: Record<string, any>[];
  columns: string[];
  columnProfiles: Record<string, ColumnProfile>;
  overview: DatasetOverview;
  loadedAt: string;
}

export type FilterOperator =
  | 'equals'
  | 'contains'
  | 'greater'
  | 'less'
  | 'between'
  | 'isNull'
  | 'isNotNull';

export interface TableFilter {
  column: string;
  operator: FilterOperator;
  value: any;
  value2?: any;
}

export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}
