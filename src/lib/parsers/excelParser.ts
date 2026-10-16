import * as XLSX from 'xlsx';
import { deduplicateColumnNames } from './csvParser';

export interface ExcelWorkbookInfo {
  sheetNames: string[];
  workbook: XLSX.WorkBook;
}

export interface ExcelParseResult {
  rows: Record<string, any>[];
  columns: string[];
  sheetNames: string[];
  selectedSheet: string;
  totalParsedRows: number;
  warnings: string[];
  truncated: boolean;
}

export function inspectExcelWorkbook(arrayBuffer: ArrayBuffer): ExcelWorkbookInfo {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  return {
    sheetNames: workbook.SheetNames,
    workbook,
  };
}

export function parseExcelSheet(
  workbook: XLSX.WorkBook,
  sheetName?: string,
  maxRows: number = 50000
): ExcelParseResult {
  const targetSheet = sheetName || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[targetSheet];

  if (!worksheet) {
    throw new Error(`Sheet "${targetSheet}" not found in Excel workbook.`);
  }

  // Parse to raw 2D array of cells
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false,
    defval: null,
  });

  if (!rawData || rawData.length === 0) {
    throw new Error(`Sheet "${targetSheet}" is empty.`);
  }

  const rawHeaders = rawData[0] as string[];
  if (!rawHeaders || rawHeaders.length === 0) {
    throw new Error('Unable to extract column headers from worksheet.');
  }

  const columns = deduplicateColumnNames(rawHeaders.map((h) => String(h ?? '')));
  const rawRows = rawData.slice(1);

  const warnings: string[] = [];
  let truncated = false;
  let rowsToProcess = rawRows;

  if (rawRows.length > maxRows) {
    truncated = true;
    rowsToProcess = rawRows.slice(0, maxRows);
    warnings.push(
      `Sheet contains ${rawRows.length.toLocaleString()} rows. Loaded the first ${maxRows.toLocaleString()} rows for responsive in-browser performance.`
    );
  }

  const rows: Record<string, any>[] = [];

  for (let r = 0; r < rowsToProcess.length; r++) {
    const rawRow = rowsToProcess[r] || [];
    const rowObj: Record<string, any> = {};

    for (let c = 0; c < columns.length; c++) {
      const colName = columns[c];
      const val = rawRow[c];

      if (val === undefined || val === null || val === '') {
        rowObj[colName] = null;
      } else if (typeof val === 'number') {
        rowObj[colName] = Number.isFinite(val) ? val : null;
      } else {
        const trimmed = String(val).trim();
        if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'na' || trimmed.toLowerCase() === 'n/a') {
          rowObj[colName] = null;
        } else {
          const num = Number(trimmed);
          if (!Number.isNaN(num) && Number.isFinite(num) && !/^0\d+$/.test(trimmed)) {
            rowObj[colName] = num;
          } else {
            rowObj[colName] = trimmed;
          }
        }
      }
    }
    rows.push(rowObj);
  }

  return {
    rows,
    columns,
    sheetNames: workbook.SheetNames,
    selectedSheet: targetSheet,
    totalParsedRows: rawRows.length,
    warnings,
    truncated,
  };
}
