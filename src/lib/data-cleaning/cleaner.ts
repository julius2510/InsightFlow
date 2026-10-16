import { CleaningOperation } from '@/types/cleaning';
import { calculateNumericStats, isNumeric } from '../statistics/numeric';
import { calculateCategoricalStats } from '../statistics/categorical';

export type DuplicateHandlingStrategy = 'drop' | 'bfill';

export function removeDuplicateRows(
  rows: Record<string, any>[],
  strategy: DuplicateHandlingStrategy = 'drop'
): { cleanedRows: Record<string, any>[]; operation: CleaningOperation } {
  const seen = new Set<string>();
  const isDuplicate: boolean[] = new Array(rows.length).fill(false);
  let duplicateCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const serialized = JSON.stringify(rows[i]);
    if (seen.has(serialized)) {
      isDuplicate[i] = true;
      duplicateCount++;
    } else {
      seen.add(serialized);
    }
  }

  let cleanedRows: Record<string, any>[] = [];

  if (strategy === 'bfill') {
    // Preserve total samples by replacing duplicate row values with backward fill (bfill) from subsequent rows
    cleanedRows = rows.map((r) => ({ ...r }));

    // Traverse backwards from N-1 down to 0 to propagate the next valid row backwards
    for (let i = rows.length - 1; i >= 0; i--) {
      if (isDuplicate[i]) {
        if (i < rows.length - 1) {
          cleanedRows[i] = { ...cleanedRows[i + 1] };
        } else if (i > 0) {
          // If duplicate is at the very tail, forward fill from the previous row
          cleanedRows[i] = { ...cleanedRows[i - 1] };
        }
      }
    }
  } else {
    // Default 'drop' strategy: filter out duplicate rows
    for (let i = 0; i < rows.length; i++) {
      if (!isDuplicate[i]) {
        cleanedRows.push({ ...rows[i] });
      }
    }
  }

  const description =
    strategy === 'bfill'
      ? `Replaced ${duplicateCount} duplicate row${duplicateCount === 1 ? '' : 's'} using backward fill (bfill) — preserved all ${rows.length} sample rows`
      : `Removed ${duplicateCount} duplicate row${duplicateCount === 1 ? '' : 's'} (dataset reduced to ${cleanedRows.length} rows)`;

  const operation: CleaningOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'remove_duplicates',
    description,
    params: { strategy },
    timestamp: new Date().toLocaleTimeString(),
    affectedRows: duplicateCount,
    affectedCells: duplicateCount * (rows[0] ? Object.keys(rows[0]).length : 0),
  };

  return { cleanedRows, operation };
}

export function dropColumns(
  rows: Record<string, any>[],
  columnsToDrop: string[]
): { cleanedRows: Record<string, any>[]; operation: CleaningOperation } {
  const dropSet = new Set(columnsToDrop);
  const cleanedRows = rows.map((r) => {
    const newRow: Record<string, any> = {};
    for (const key of Object.keys(r)) {
      if (!dropSet.has(key)) {
        newRow[key] = r[key];
      }
    }
    return newRow;
  });

  const operation: CleaningOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'drop_columns',
    description: `Dropped column${columnsToDrop.length > 1 ? 's' : ''}: ${columnsToDrop.join(', ')}`,
    params: { columns: columnsToDrop },
    timestamp: new Date().toLocaleTimeString(),
    affectedRows: rows.length,
    affectedCells: rows.length * columnsToDrop.length,
  };

  return { cleanedRows, operation };
}

export function dropRowsWithMissingValues(
  rows: Record<string, any>[],
  targetColumns?: string[] // if undefined, check all columns
): { cleanedRows: Record<string, any>[]; operation: CleaningOperation } {
  const checkCols = targetColumns && targetColumns.length > 0 ? targetColumns : null;
  const cleanedRows: Record<string, any>[] = [];
  let droppedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cols = checkCols || Object.keys(row);
    let hasMissing = false;

    for (const col of cols) {
      const val = row[col];
      if (val === null || val === undefined || val === '' || (typeof val === 'number' && Number.isNaN(val))) {
        hasMissing = true;
        break;
      }
    }

    if (hasMissing) {
      droppedCount++;
    } else {
      cleanedRows.push({ ...row });
    }
  }

  const colDesc = checkCols ? `in column(s): ${checkCols.join(', ')}` : 'across all columns';
  const operation: CleaningOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'drop_missing_rows',
    description: `Dropped ${droppedCount} row${droppedCount === 1 ? '' : 's'} with missing values ${colDesc}`,
    params: { targetColumns },
    timestamp: new Date().toLocaleTimeString(),
    affectedRows: droppedCount,
    affectedCells: droppedCount * (rows[0] ? Object.keys(rows[0]).length : 0),
  };

  return { cleanedRows, operation };
}

export function fillMissingNumeric(
  rows: Record<string, any>[],
  column: string,
  strategy: 'mean' | 'median' | 'zero' | 'custom',
  customValue?: number
): { cleanedRows: Record<string, any>[]; operation: CleaningOperation } {
  const colVals = rows.map((r) => r[column]);
  const stats = calculateNumericStats(colVals, column);

  let fillVal = 0;
  if (strategy === 'mean') {
    fillVal = stats ? stats.mean : 0;
  } else if (strategy === 'median') {
    fillVal = stats ? stats.median : 0;
  } else if (strategy === 'zero') {
    fillVal = 0;
  } else if (strategy === 'custom') {
    fillVal = customValue !== undefined ? customValue : 0;
  }

  let filledCells = 0;
  const cleanedRows = rows.map((r) => {
    const val = r[column];
    if (val === null || val === undefined || val === '' || (typeof val === 'number' && Number.isNaN(val))) {
      filledCells++;
      return { ...r, [column]: fillVal };
    }
    return { ...r };
  });

  const operation: CleaningOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'fill_missing_numeric',
    description: `Filled ${filledCells} missing value${filledCells === 1 ? '' : 's'} in "${column}" with ${strategy} (${fillVal})`,
    params: { column, strategy, fillVal },
    timestamp: new Date().toLocaleTimeString(),
    affectedRows: filledCells,
    affectedCells: filledCells,
  };

  return { cleanedRows, operation };
}

export function fillMissingCategorical(
  rows: Record<string, any>[],
  column: string,
  strategy: 'mode' | 'custom',
  customValue?: string
): { cleanedRows: Record<string, any>[]; operation: CleaningOperation } {
  let fillVal = 'Unknown';
  if (strategy === 'mode') {
    const stats = calculateCategoricalStats(rows.map((r) => r[column]), column);
    fillVal = stats.mode !== 'N/A' ? stats.mode : 'Unknown';
  } else if (strategy === 'custom' && customValue !== undefined) {
    fillVal = customValue;
  }

  let filledCells = 0;
  const cleanedRows = rows.map((r) => {
    const val = r[column];
    if (val === null || val === undefined || val === '' || (typeof val === 'number' && Number.isNaN(val))) {
      filledCells++;
      return { ...r, [column]: fillVal };
    }
    return { ...r };
  });

  const operation: CleaningOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'fill_missing_categorical',
    description: `Filled ${filledCells} missing value${filledCells === 1 ? '' : 's'} in "${column}" with "${fillVal}"`,
    params: { column, strategy, fillVal },
    timestamp: new Date().toLocaleTimeString(),
    affectedRows: filledCells,
    affectedCells: filledCells,
  };

  return { cleanedRows, operation };
}

export function renameColumn(
  rows: Record<string, any>[],
  oldName: string,
  newName: string
): { cleanedRows: Record<string, any>[]; operation: CleaningOperation } {
  const trimmedNew = newName.trim();
  if (!trimmedNew || trimmedNew === oldName) {
    return {
      cleanedRows: rows.map((r) => ({ ...r })),
      operation: {
        id: `op-noop`,
        type: 'rename_column',
        description: 'No changes made',
        params: {},
        timestamp: new Date().toLocaleTimeString(),
        affectedRows: 0,
        affectedCells: 0,
      },
    };
  }

  const cleanedRows = rows.map((r) => {
    const newRow: Record<string, any> = {};
    for (const key of Object.keys(r)) {
      if (key === oldName) {
        newRow[trimmedNew] = r[key];
      } else {
        newRow[key] = r[key];
      }
    }
    return newRow;
  });

  const operation: CleaningOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'rename_column',
    description: `Renamed column "${oldName}" to "${trimmedNew}"`,
    params: { oldName, newName: trimmedNew },
    timestamp: new Date().toLocaleTimeString(),
    affectedRows: rows.length,
    affectedCells: rows.length,
  };

  return { cleanedRows, operation };
}

export function filterRows(
  rows: Record<string, any>[],
  column: string,
  condition: 'equals' | 'notEquals' | 'contains' | 'greater' | 'less',
  targetValue: any
): { cleanedRows: Record<string, any>[]; operation: CleaningOperation } {
  const initialCount = rows.length;
  const cleanedRows = rows.filter((r) => {
    const val = r[column];
    if (condition === 'equals') {
      return String(val).toLowerCase() === String(targetValue).toLowerCase();
    }
    if (condition === 'notEquals') {
      return String(val).toLowerCase() !== String(targetValue).toLowerCase();
    }
    if (condition === 'contains') {
      return String(val).toLowerCase().includes(String(targetValue).toLowerCase());
    }
    if (condition === 'greater') {
      return isNumeric(val) && Number(val) > Number(targetValue);
    }
    if (condition === 'less') {
      return isNumeric(val) && Number(val) < Number(targetValue);
    }
    return true;
  });

  const removedCount = initialCount - cleanedRows.length;
  const operation: CleaningOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'filter_rows',
    description: `Filtered rows where "${column}" ${condition} "${targetValue}" (removed ${removedCount} rows)`,
    params: { column, condition, targetValue },
    timestamp: new Date().toLocaleTimeString(),
    affectedRows: removedCount,
    affectedCells: removedCount * (rows[0] ? Object.keys(rows[0]).length : 0),
  };

  return { cleanedRows: cleanedRows.map((r) => ({ ...r })), operation };
}
