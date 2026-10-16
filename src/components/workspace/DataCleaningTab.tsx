'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import {
  removeDuplicateRows,
  dropColumns,
  dropRowsWithMissingValues,
  fillMissingNumeric,
  fillMissingCategorical,
  renameColumn,
  filterRows,
} from '@/lib/data-cleaning/cleaner';
import {
  Wand2,
  Trash2,
  RotateCcw,
  Undo2,
  Redo2,
  History,
  Copy,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Split,
  Edit3,
} from 'lucide-react';

export function DataCleaningTab() {
  const {
    dataset,
    applyCleaning,
    undo,
    redo,
    resetToOriginal,
    historyPast,
    historyFuture,
  } = useWorkspace();

  // Tool Selection
  const [activeTool, setActiveTool] = useState<
    | 'duplicates'
    | 'drop_cols'
    | 'drop_missing'
    | 'fill_numeric'
    | 'fill_cat'
    | 'rename_col'
    | 'filter_rows'
  >('duplicates');

  // Tool Parameters State
  const [duplicateStrategy, setDuplicateStrategy] = useState<'bfill' | 'drop'>('bfill');
  const [selectedColumnsToDrop, setSelectedColumnsToDrop] = useState<string[]>([]);
  const [selectedMissingCols, setSelectedMissingCols] = useState<string[]>([]);
  const [numFillCol, setNumFillCol] = useState<string>('');
  const [numFillStrategy, setNumFillStrategy] = useState<'mean' | 'median' | 'zero' | 'custom'>('mean');
  const [numCustomVal, setNumCustomVal] = useState<string>('0');
  const [catFillCol, setCatFillCol] = useState<string>('');
  const [catFillStrategy, setCatFillStrategy] = useState<'mode' | 'custom'>('mode');
  const [catCustomVal, setCatCustomVal] = useState<string>('Unknown');
  const [renameOld, setRenameOld] = useState<string>('');
  const [renameNew, setRenameNew] = useState<string>('');
  const [filterCol, setFilterCol] = useState<string>('');
  const [filterCondition, setFilterCondition] = useState<'equals' | 'notEquals' | 'contains' | 'greater' | 'less'>('equals');
  const [filterTargetVal, setFilterTargetVal] = useState<string>('');

  if (!dataset) return null;

  const { rawRows, columns, columnProfiles, overview } = dataset;
  const numericCols = columns.filter((c) => columnProfiles[c]?.type === 'number');
  const categoricalCols = columns.filter((c) => columnProfiles[c]?.type !== 'number');

  // Handle Remove Duplicates
  const handleRemoveDuplicates = () => {
    const { cleanedRows, operation } = removeDuplicateRows(rawRows, duplicateStrategy);
    applyCleaning(cleanedRows, operation);
  };

  // Handle Drop Columns
  const handleDropColumns = () => {
    if (selectedColumnsToDrop.length === 0) return;
    const { cleanedRows, operation } = dropColumns(rawRows, selectedColumnsToDrop);
    applyCleaning(cleanedRows, operation);
    setSelectedColumnsToDrop([]);
  };

  // Handle Drop Rows with Missing Values
  const handleDropMissingRows = () => {
    const { cleanedRows, operation } = dropRowsWithMissingValues(
      rawRows,
      selectedMissingCols.length > 0 ? selectedMissingCols : undefined
    );
    applyCleaning(cleanedRows, operation);
    setSelectedMissingCols([]);
  };

  // Handle Fill Numeric Missing
  const handleFillNumeric = () => {
    const targetCol = numFillCol || numericCols[0];
    if (!targetCol) return;
    const { cleanedRows, operation } = fillMissingNumeric(
      rawRows,
      targetCol,
      numFillStrategy,
      Number(numCustomVal) || 0
    );
    applyCleaning(cleanedRows, operation);
  };

  // Handle Fill Categorical Missing
  const handleFillCategorical = () => {
    const targetCol = catFillCol || categoricalCols[0];
    if (!targetCol) return;
    const { cleanedRows, operation } = fillMissingCategorical(
      rawRows,
      targetCol,
      catFillStrategy,
      catCustomVal
    );
    applyCleaning(cleanedRows, operation);
  };

  // Handle Rename Column
  const handleRenameColumn = () => {
    const oldName = renameOld || columns[0];
    if (!oldName || !renameNew.trim()) return;
    const { cleanedRows, operation } = renameColumn(rawRows, oldName, renameNew.trim());
    applyCleaning(cleanedRows, operation);
    setRenameNew('');
  };

  // Handle Filter Rows
  const handleFilterRows = () => {
    const targetCol = filterCol || columns[0];
    if (!targetCol) return;
    const { cleanedRows, operation } = filterRows(
      rawRows,
      targetCol,
      filterCondition,
      filterTargetVal
    );
    applyCleaning(cleanedRows, operation);
    setFilterTargetVal('');
  };

  return (
    <div className="space-y-6">
      {/* Undo / Redo / Reset Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyPast.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo ({historyPast.length})</span>
          </button>

          <button
            onClick={redo}
            disabled={historyFuture.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span>Redo ({historyFuture.length})</span>
          </button>

          <button
            onClick={resetToOriginal}
            disabled={historyPast.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed ml-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Original</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Active Dataset:</span>
          <strong className="text-slate-900 dark:text-white">
            {overview.rowCount.toLocaleString()} rows
          </strong>
          <span>•</span>
          <strong className="text-slate-900 dark:text-white">
            {overview.columnCount} columns
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Cleaning Tools Menu */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Cleaning Operations
          </h3>

          <button
            onClick={() => setActiveTool('duplicates')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTool === 'duplicates'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4 text-indigo-500" />
              <span>Deduplicate Rows</span>
            </div>
            {overview.duplicateRowCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 text-[10px] font-bold">
                {overview.duplicateRowCount} found
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTool('drop_missing')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTool === 'drop_missing'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-amber-500" />
              <span>Drop Incomplete Rows</span>
            </div>
            {overview.missingCells > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 text-[10px] font-bold">
                {overview.missingCells} cells
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTool('fill_numeric')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTool === 'fill_numeric'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-violet-500" />
              <span>Impute Numeric Missing</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTool('fill_cat')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTool === 'fill_cat'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-sky-500" />
              <span>Impute Categorical Missing</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTool('drop_cols')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTool === 'drop_cols'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Split className="w-4 h-4 text-rose-500" />
              <span>Drop Selected Columns</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTool('rename_col')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTool === 'rename_col'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-500" />
              <span>Rename Column</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTool('filter_rows')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-left transition-all ${
              activeTool === 'filter_rows'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Filter & Delete Rows</span>
            </div>
          </button>
        </div>

        {/* Selected Tool Configuration Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          {/* 1. Deduplicate */}
          {activeTool === 'duplicates' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove Exact Duplicate Rows
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose how to handle duplicate records: replace them using backward fill (bfill) to keep your total sample count unchanged, or drop the rows.
                </p>
              </div>

              {/* Strategy Selector */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Deduplication Strategy:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy('bfill')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      duplicateStrategy === 'bfill'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <Wand2 className="w-3.5 h-3.5" /> Backward Fill (bfill)
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                        Preserves N
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Replaces duplicate records with values from subsequent rows so the total sample size doesn&apos;t get reduced.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy('drop')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      duplicateStrategy === 'drop'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Drop Rows
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Reduces N
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Completely removes duplicate rows from the dataset, decreasing the total row count.
                    </p>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Duplicates Detected:</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {overview.duplicateRowCount} rows
                  </strong>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Resulting Sample Count:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                    {duplicateStrategy === 'bfill'
                      ? `${overview.rowCount} rows (100% sample count preserved)`
                      : `${overview.rowCount - overview.duplicateRowCount} rows`}
                  </strong>
                </div>
              </div>

              <button
                onClick={handleRemoveDuplicates}
                disabled={overview.duplicateRowCount === 0}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-40"
              >
                {duplicateStrategy === 'bfill'
                  ? `Execute Deduplication (Apply bfill & Keep ${overview.rowCount} Samples)`
                  : `Execute Deduplication (Drop ${overview.duplicateRowCount} Rows)`}
              </button>
            </div>
          )}

          {/* 2. Drop Missing Rows */}
          {activeTool === 'drop_missing' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove Rows Containing Missing Values
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Purge records where either any column or specifically selected columns contain empty/null values.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Columns (leave empty to check all columns):
                </span>
                <div className="max-h-44 overflow-y-auto p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  {columns.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-xs cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={selectedMissingCols.includes(c)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedMissingCols((prev) => [...prev, c]);
                          else setSelectedMissingCols((prev) => prev.filter((col) => col !== c));
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{c}</span>
                      <span className="text-[11px] text-slate-400 ml-auto">
                        {columnProfiles[c]?.missingCount} nulls
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDropMissingRows}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
              >
                Drop Affected Rows
              </button>
            </div>
          )}

          {/* 3. Impute Numeric Missing */}
          {activeTool === 'fill_numeric' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Impute Numerical Missing Values
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Replace blank or invalid numbers with mathematical mean, median, zero, or a fixed constant.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Numerical Column
                  </label>
                  <select
                    value={numFillCol || numericCols[0] || ''}
                    onChange={(e) => setNumFillCol(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {numericCols.map((c) => (
                      <option key={c} value={c}>
                        {c} ({columnProfiles[c]?.missingCount} nulls)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Imputation Strategy
                  </label>
                  <select
                    value={numFillStrategy}
                    onChange={(e) => setNumFillStrategy(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="mean">Mean (Average of valid values)</option>
                    <option value="median">Median (Middle value)</option>
                    <option value="zero">Zero (0)</option>
                    <option value="custom">Custom Constant</option>
                  </select>
                </div>

                {numFillStrategy === 'custom' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Custom Number
                    </label>
                    <input
                      type="number"
                      value={numCustomVal}
                      onChange={(e) => setNumCustomVal(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleFillNumeric}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Apply Imputation
              </button>
            </div>
          )}

          {/* 4. Impute Categorical Missing */}
          {activeTool === 'fill_cat' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Impute Categorical Missing Values
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Replace blank strings with the statistical mode (most frequent category) or a placeholder.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Categorical Column
                  </label>
                  <select
                    value={catFillCol || categoricalCols[0] || ''}
                    onChange={(e) => setCatFillCol(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {categoricalCols.map((c) => (
                      <option key={c} value={c}>
                        {c} ({columnProfiles[c]?.missingCount} nulls)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Strategy
                  </label>
                  <select
                    value={catFillStrategy}
                    onChange={(e) => setCatFillStrategy(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="mode">Mode (Most frequent category)</option>
                    <option value="custom">Custom string (e.g. Unknown)</option>
                  </select>
                </div>

                {catFillStrategy === 'custom' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Replacement String
                    </label>
                    <input
                      type="text"
                      value={catCustomVal}
                      onChange={(e) => setCatCustomVal(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleFillCategorical}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Apply Imputation
              </button>
            </div>
          )}

          {/* 5. Drop Columns */}
          {activeTool === 'drop_cols' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Drop Selected Columns
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Permanently remove unwanted columns from the active working dataset.
                </p>
              </div>

              <div className="max-h-52 overflow-y-auto p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                {columns.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-xs cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={selectedColumnsToDrop.includes(c)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedColumnsToDrop((prev) => [...prev, c]);
                        else setSelectedColumnsToDrop((prev) => prev.filter((col) => col !== c));
                      }}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleDropColumns}
                disabled={selectedColumnsToDrop.length === 0}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm disabled:opacity-40"
              >
                Drop {selectedColumnsToDrop.length} Selected Column(s)
              </button>
            </div>
          )}

          {/* 6. Rename Column */}
          {activeTool === 'rename_col' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Rename Column
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Change the header label of any column in the dataset.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Existing Column
                  </label>
                  <select
                    value={renameOld || columns[0] || ''}
                    onChange={(e) => setRenameOld(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    New Column Name
                  </label>
                  <input
                    type="text"
                    placeholder="New header name..."
                    value={renameNew}
                    onChange={(e) => setRenameNew(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleRenameColumn}
                disabled={!renameNew.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-40"
              >
                Apply Rename
              </button>
            </div>
          )}

          {/* 7. Filter & Delete Rows */}
          {activeTool === 'filter_rows' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Filter &amp; Delete Specific Rows
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Remove all records meeting a specific criterion.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={filterCol || columns[0] || ''}
                  onChange={(e) => setFilterCol(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {columns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value as any)}
                  className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="equals">equals</option>
                  <option value="notEquals">does not equal</option>
                  <option value="contains">contains</option>
                  <option value="greater">greater than (&gt;)</option>
                  <option value="less">less than (&lt;)</option>
                </select>

                <input
                  type="text"
                  placeholder="Target value..."
                  value={filterTargetVal}
                  onChange={(e) => setFilterTargetVal(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleFilterRows}
                disabled={!filterTargetVal}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm disabled:opacity-40"
              >
                Execute Row Filter
              </button>
            </div>
          )}

          {/* Transformation History Log */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
              <History className="w-3.5 h-3.5" />
              <span>Session Transformation History ({historyPast.length} operations)</span>
            </h4>

            {historyPast.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No transformations applied yet. Dataset is in original state.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {historyPast.map((step, idx) => (
                  <div
                    key={step.operation.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {step.operation.description}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {step.operation.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
