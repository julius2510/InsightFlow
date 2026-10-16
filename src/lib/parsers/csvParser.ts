import Papa from 'papaparse';

export interface ParseCSVOptions {
  delimiter?: string;
  previewRows?: number;
  maxRows?: number;
}

export interface CSVParseResult {
  rows: Record<string, any>[];
  columns: string[];
  delimiterUsed: string;
  totalParsedRows: number;
  warnings: string[];
  truncated: boolean;
}

export function deduplicateColumnNames(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((header, idx) => {
    let cleanHeader = (header || '').trim();
    if (!cleanHeader) {
      cleanHeader = `Column_${idx + 1}`;
    }
    const count = seen.get(cleanHeader) || 0;
    seen.set(cleanHeader, count + 1);
    if (count > 0) {
      return `${cleanHeader}_${count}`;
    }
    return cleanHeader;
  });
}

export function parseCSVString(csvContent: string, options: ParseCSVOptions = {}): CSVParseResult {
  const maxRows = options.maxRows || 50000;
  const warnings: string[] = [];

  // Remove potential UTF-8 BOM
  let cleanedContent = csvContent;
  if (cleanedContent.charCodeAt(0) === 0xfeff) {
    cleanedContent = cleanedContent.substring(1);
  }

  const parsed = Papa.parse<any[]>(cleanedContent, {
    header: false,
    skipEmptyLines: 'greedy',
    delimiter: options.delimiter || '', // empty string tells Papa to auto-detect
  });

  if (!parsed.data || parsed.data.length === 0) {
    throw new Error('The CSV file appears to be empty or contains no readable lines.');
  }

  const rawHeaders = parsed.data[0] as string[];
  if (!rawHeaders || rawHeaders.length === 0) {
    throw new Error('Unable to extract column headers from CSV.');
  }

  const columns = deduplicateColumnNames(rawHeaders.map((h) => String(h ?? '')));
  const rawRows = parsed.data.slice(1);

  let truncated = false;
  let rowsToProcess = rawRows;

  if (rawRows.length > maxRows) {
    truncated = true;
    rowsToProcess = rawRows.slice(0, maxRows);
    warnings.push(
      `Dataset exceeds ${maxRows.toLocaleString()} rows. Loaded the first ${maxRows.toLocaleString()} rows for responsive in-browser performance.`
    );
  }

  const rows: Record<string, any>[] = [];

  for (let r = 0; r < rowsToProcess.length; r++) {
    const rawRow = rowsToProcess[r];
    const rowObj: Record<string, any> = {};

    for (let c = 0; c < columns.length; c++) {
      const colName = columns[c];
      const rawVal = rawRow[c];

      if (rawVal === undefined || rawVal === null || rawVal === '') {
        rowObj[colName] = null;
      } else {
        const trimmed = String(rawVal).trim();
        if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'na' || trimmed.toLowerCase() === 'n/a') {
          rowObj[colName] = null;
        } else {
          // Attempt numeric conversion if cleanly matches number
          const num = Number(trimmed);
          if (!Number.isNaN(num) && Number.isFinite(num) && trimmed !== '' && !/^0\d+$/.test(trimmed)) {
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
    delimiterUsed: parsed.meta.delimiter || ',',
    totalParsedRows: rawRows.length,
    warnings,
    truncated,
  };
}
