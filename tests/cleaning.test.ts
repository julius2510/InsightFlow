import { describe, it, expect } from 'vitest';
import {
  removeDuplicateRows,
  dropColumns,
  dropRowsWithMissingValues,
  fillMissingNumeric,
  fillMissingCategorical,
  renameColumn,
  filterRows,
} from '../src/lib/data-cleaning/cleaner';

describe('Data Cleaning Transformations', () => {
  const sampleData = [
    { id: 1, name: 'Alice', age: 25, score: 90 },
    { id: 2, name: 'Bob', age: 30, score: null },
    { id: 1, name: 'Alice', age: 25, score: 90 }, // duplicate
    { id: 3, name: null, age: 35, score: 80 },
  ];

  it('removes duplicate rows and reports affected count with drop strategy', () => {
    const { cleanedRows, operation } = removeDuplicateRows(sampleData, 'drop');
    expect(cleanedRows.length).toBe(3);
    expect(operation.affectedRows).toBe(1);
    expect(operation.params.strategy).toBe('drop');
  });

  it('removes duplicate rows using bfill and preserves total sample size', () => {
    const { cleanedRows, operation } = removeDuplicateRows(sampleData, 'bfill');
    // Total sample count is preserved (4 rows before, 4 rows after!)
    expect(cleanedRows.length).toBe(sampleData.length);
    expect(cleanedRows.length).toBe(4);
    expect(operation.affectedRows).toBe(1);
    expect(operation.params.strategy).toBe('bfill');
    // Duplicate row at index 2 is replaced with bfilled values from index 3
    expect(cleanedRows[2].id).toBe(3);
    expect(cleanedRows[2].age).toBe(35);
  });

  it('drops selected columns without mutating original', () => {
    const { cleanedRows, operation } = dropColumns(sampleData, ['score']);
    expect(cleanedRows[0]).not.toHaveProperty('score');
    expect(cleanedRows[0]).toHaveProperty('name');
    expect(operation.affectedRows).toBe(4);
    // original still has score
    expect(sampleData[0]).toHaveProperty('score');
  });

  it('drops rows with missing values', () => {
    const { cleanedRows, operation } = dropRowsWithMissingValues(sampleData);
    // Row 2 has null score, row 4 has null name => 2 rows dropped
    expect(cleanedRows.length).toBe(2);
    expect(operation.affectedRows).toBe(2);
  });

  it('fills missing numeric values with mean or custom value', () => {
    // Valid scores: 90, 90, 80 => mean = 86.6667
    const { cleanedRows, operation } = fillMissingNumeric(sampleData, 'score', 'custom', 99);
    expect(cleanedRows[1].score).toBe(99);
    expect(operation.affectedRows).toBe(1);
  });

  it('fills missing categorical values with custom string', () => {
    const { cleanedRows, operation } = fillMissingCategorical(sampleData, 'name', 'custom', 'Guest');
    expect(cleanedRows[3].name).toBe('Guest');
    expect(operation.affectedRows).toBe(1);
  });

  it('renames a column cleanly', () => {
    const { cleanedRows, operation } = renameColumn(sampleData, 'age', 'years_old');
    expect(cleanedRows[0]).toHaveProperty('years_old', 25);
    expect(cleanedRows[0]).not.toHaveProperty('age');
    expect(operation.affectedRows).toBe(4);
  });

  it('filters rows based on condition', () => {
    const { cleanedRows, operation } = filterRows(sampleData, 'age', 'greater', 28);
    // Only rows with age > 28: Bob (30) and Row 4 (35)
    expect(cleanedRows.length).toBe(2);
    expect(operation.affectedRows).toBe(2);
  });
});
