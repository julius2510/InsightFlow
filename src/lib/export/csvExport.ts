import Papa from 'papaparse';

export function exportToCSV(
  rows: Record<string, any>[],
  filename: string = 'dataset_export.csv'
): void {
  if (!rows || rows.length === 0) {
    throw new Error('No data available to export.');
  }

  const csvString = Papa.unparse(rows, {
    quotes: true,
  });

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
