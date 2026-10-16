import { describe, it, expect } from 'vitest';
import {
  inferColumnType,
  detectDuplicateRows,
  calculateQualityIndicator,
  profileDataset,
} from '../src/lib/statistics/profiler';

describe('Dataset Profiler and Quality Heuristics', () => {
  it('accurately infers column types', () => {
    expect(inferColumnType([10, 20.5, '30', -4])).toBe('number');
    expect(inferColumnType(['2024-01-01', '2024-02-15', '2024-03-30'])).toBe('date');
    expect(inferColumnType([true, false, 'true', false])).toBe('boolean');
    expect(inferColumnType(['Consumer', 'Corporate', 'Home Office'])).toBe('string');
  });

  it('detects duplicate rows correctly', () => {
    const rows = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' }, // duplicate
      { id: 3, name: 'Charlie' },
      { id: 2, name: 'Bob' }, // duplicate
    ];
    expect(detectDuplicateRows(rows)).toBe(2);
  });

  it('calculates heuristic data quality score', () => {
    const rows = [
      { id: 1, score: 90, grade: 'A' },
      { id: 2, score: 85, grade: 'B' },
      { id: 3, score: null, grade: 'C' },
    ];
    const { overview } = profileDataset(rows, ['id', 'score', 'grade']);

    expect(overview.rowCount).toBe(3);
    expect(overview.columnCount).toBe(3);
    expect(overview.missingCells).toBe(1);
    expect(overview.duplicateRowCount).toBe(0);
    expect(overview.quality.overallScore).toBeGreaterThanOrEqual(70);
  });
});
