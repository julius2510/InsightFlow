import { describe, it, expect } from 'vitest';
import { parseCSVString, deduplicateColumnNames } from '../src/lib/parsers/csvParser';
import Papa from 'papaparse';

describe('CSV Parser and Export', () => {
  it('deduplicates duplicate and empty column names', () => {
    const raw = ['age', 'name', 'age', '', 'name'];
    const deduplicated = deduplicateColumnNames(raw);
    expect(deduplicated).toEqual(['age', 'name', 'age_1', 'Column_4', 'name_1']);
  });

  it('parses CSV with auto-detected delimiter and cleans types', () => {
    const csv = `Category,Sales,Quantity\nElectronics,299.99,2\nFurniture,150.00,1\n`;
    const result = parseCSVString(csv);

    expect(result.columns).toEqual(['Category', 'Sales', 'Quantity']);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0].Category).toBe('Electronics');
    expect(result.rows[0].Sales).toBe(299.99);
    expect(result.rows[0].Quantity).toBe(2);
  });

  it('parses semicolon delimited CSV', () => {
    const csv = `Name;Age;City\nAlice;30;Paris\nBob;25;London\n`;
    const result = parseCSVString(csv, { delimiter: ';' });

    expect(result.columns).toEqual(['Name', 'Age', 'City']);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0].City).toBe('Paris');
  });

  it('unparses back to valid CSV string for export', () => {
    const rows = [
      { product: 'Desk', price: 120 },
      { product: 'Chair', price: 85 },
    ];
    const csvOut = Papa.unparse(rows);
    expect(csvOut).toContain('Desk');
    expect(csvOut).toContain('120');
  });
});
