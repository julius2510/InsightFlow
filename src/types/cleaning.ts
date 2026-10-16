export type CleaningActionType =
  | 'remove_duplicates'
  | 'drop_columns'
  | 'filter_rows'
  | 'fill_missing_numeric'
  | 'fill_missing_categorical'
  | 'drop_missing_rows'
  | 'rename_column'
  | 'convert_type';

export interface CleaningOperation {
  id: string;
  type: CleaningActionType;
  description: string;
  params: Record<string, any>;
  timestamp: string;
  affectedRows: number;
  affectedCells: number;
}

export interface CleaningHistoryStep {
  data: Record<string, any>[];
  operation: CleaningOperation;
}

export interface CleaningHistory {
  past: CleaningHistoryStep[];
  future: CleaningHistoryStep[];
}
