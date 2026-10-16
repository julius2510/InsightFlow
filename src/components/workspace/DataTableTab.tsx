'use client';

import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { FilterOperator, TableFilter } from '@/types/dataset';
import { isNumeric } from '@/lib/statistics/numeric';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';

export function DataTableTab() {
  const {
    dataset,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    hiddenColumns,
    toggleColumnVisibility,
    setAllColumnsVisible,
  } = useWorkspace();

  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);

  // New filter form state
  const [filterCol, setFilterCol] = useState<string>('');
  const [filterOp, setFilterOp] = useState<FilterOperator>('contains');
  const [filterVal, setFilterVal] = useState<string>('');

  if (!dataset) return null;

  const { rawRows, columns, columnProfiles } = dataset;

  // Visible columns
  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.has(c)),
    [columns, hiddenColumns]
  );

  // Filtered & Searched rows
  const filteredRows = useMemo(() => {
    let result = rawRows;

    // 1. Search across all visible values
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((row) =>
        visibleColumns.some((col) => {
          const val = row[col];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        })
      );
    }

    // 2. Apply Column Filters
    if (filters.length > 0) {
      result = result.filter((row) => {
        return filters.every((f) => {
          const val = row[f.column];
          if (f.operator === 'isNull') {
            return val === null || val === undefined || val === '';
          }
          if (f.operator === 'isNotNull') {
            return val !== null && val !== undefined && val !== '';
          }
          if (val === null || val === undefined || val === '') {
            return false;
          }

          if (f.operator === 'contains') {
            return String(val).toLowerCase().includes(String(f.value).toLowerCase());
          }
          if (f.operator === 'equals') {
            return String(val).toLowerCase() === String(f.value).toLowerCase();
          }
          if (f.operator === 'greater') {
            return isNumeric(val) && Number(val) > Number(f.value);
          }
          if (f.operator === 'less') {
            return isNumeric(val) && Number(val) < Number(f.value);
          }
          return true;
        });
      });
    }

    // 3. Sorting
    if (sortConfig) {
      const { column, direction } = sortConfig;
      const isNum = columnProfiles[column]?.type === 'number';

      result = [...result].sort((a, b) => {
        const valA = a[column];
        const valB = b[column];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (isNum) {
          const numA = Number(valA);
          const numB = Number(valB);
          return direction === 'asc' ? numA - numB : numB - numA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return direction === 'asc' ? -1 : 1;
        if (strA > strB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rawRows, searchQuery, visibleColumns, filters, sortConfig, columnProfiles]);

  // Pagination calculation
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize);

  const handleSort = (column: string) => {
    if (!sortConfig || sortConfig.column !== column) {
      setSortConfig({ column, direction: 'asc' });
    } else if (sortConfig.direction === 'asc') {
      setSortConfig({ column, direction: 'desc' });
    } else {
      setSortConfig(null);
    }
  };

  const handleAddFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterCol) return;
    addFilter({
      column: filterCol,
      operator: filterOp,
      value: filterVal,
    });
    setFilterVal('');
    setShowFilterBuilder(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <Hash className="w-3 h-3 text-indigo-500" />;
      case 'date':
        return <Calendar className="w-3 h-3 text-emerald-500" />;
      case 'boolean':
        return <ToggleLeft className="w-3 h-3 text-amber-500" />;
      default:
        return <Type className="w-3 h-3 text-sky-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search across all records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter and Visibility Actions */}
        <div className="flex items-center gap-2">
          {/* Add Filter Button */}
          <button
            onClick={() => {
              setShowFilterBuilder(!showFilterBuilder);
              if (!filterCol && columns.length > 0) setFilterCol(columns[0]);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filters.length > 0
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {filters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {filters.length}
              </span>
            )}
          </button>

          {/* Column Visibility Menu */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Columns ({visibleColumns.length}/{columns.length})</span>
            </button>

            {showVisibilityMenu && (
              <div className="absolute right-0 top-full mt-2 z-40 w-56 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">Toggle Columns</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAllColumnsVisible(true)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setAllColumnsVisible(false)}
                      className="text-slate-500 hover:underline text-[11px]"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {columns.map((col) => (
                    <label
                      key={col}
                      className="flex items-center gap-2 px-1.5 py-1 rounded text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(col)}
                        onChange={() => toggleColumnVisibility(col)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="truncate">{col}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Builder Panel */}
      {showFilterBuilder && (
        <form
          onSubmit={handleAddFilterSubmit}
          className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-wrap items-center gap-3 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Where</span>
            <select
              value={filterCol}
              onChange={(e) => setFilterCol(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterOp}
            onChange={(e) => setFilterOp(e.target.value as FilterOperator)}
            className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="contains">contains</option>
            <option value="equals">equals</option>
            <option value="greater">is greater than (&gt;)</option>
            <option value="less">is less than (&lt;)</option>
            <option value="isNull">is missing / null</option>
            <option value="isNotNull">is not missing</option>
          </select>

          {filterOp !== 'isNull' && filterOp !== 'isNotNull' && (
            <input
              type="text"
              placeholder="Value to match..."
              value={filterVal}
              onChange={(e) => setFilterVal(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-48"
            />
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply Filter</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFilterBuilder(false)}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Active Filter Badges */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Active filters:</span>
          {filters.map((f) => (
            <span
              key={f.column}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800"
            >
              <strong>{f.column}</strong> {f.operator} {f.value !== undefined ? `"${f.value}"` : ''}
              <button
                onClick={() => removeFilter(f.column)}
                className="text-indigo-500 hover:text-indigo-800 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearFilters}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
              <tr>
                <th className="py-3 px-3 w-12 text-center text-slate-400">#</th>
                {visibleColumns.map((col) => {
                  const isSorted = sortConfig?.column === col;
                  const sortDir = sortConfig?.direction;
                  const p = columnProfiles[col];

                  return (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="py-3 px-4 select-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="p-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60">
                          {getTypeIcon(p?.type || 'string')}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{col}</span>
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 1}
                    className="py-16 text-center text-slate-500 dark:text-slate-400"
                  >
                    No matching records found for the current search or filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const rowIndex = startIndex + idx + 1;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {rowIndex}
                      </td>
                      {visibleColumns.map((col) => {
                        const val = row[col];
                        const isMissing =
                          val === null ||
                          val === undefined ||
                          val === '' ||
                          (typeof val === 'number' && Number.isNaN(val));

                        return (
                          <td
                            key={col}
                            className={`py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300 max-w-xs truncate ${
                              isMissing ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''
                            }`}
                          >
                            {isMissing ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-sans font-bold uppercase bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                                null
                              </span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong>{Math.min(totalRows, startIndex + 1)}</strong> to{' '}
              <strong>{Math.min(totalRows, startIndex + pageSize)}</strong> of{' '}
              <strong>{totalRows.toLocaleString()}</strong> rows
            </span>
            {totalRows !== rawRows.length && (
              <span className="text-slate-400">
                (filtered from {rawRows.length.toLocaleString()})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Page size:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={validPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2">
                {validPage} / {totalPages}
              </span>
              <button
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
