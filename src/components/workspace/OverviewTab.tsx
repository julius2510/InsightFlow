'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { ColumnProfile } from '@/types/dataset';
import { ColumnDetailModal } from './ColumnDetailModal';
import {
  Rows,
  Columns,
  AlertCircle,
  Copy,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';

export function OverviewTab() {
  const { dataset } = useWorkspace();
  const [columnSearch, setColumnSearch] = useState('');
  const [inspectingColumn, setInspectingColumn] = useState<ColumnProfile | null>(null);

  if (!dataset) return null;

  const { overview, columnProfiles, columns, rawRows } = dataset;
  const { quality } = overview;

  const filteredColumns = columns.filter((col) =>
    col.toLowerCase().includes(columnSearch.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <Hash className="w-3.5 h-3.5 text-indigo-500" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-emerald-500" />;
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Type className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  const getQualityBadgeColor = () => {
    if (quality.overallScore >= 90) return 'text-emerald-500';
    if (quality.overallScore >= 75) return 'text-indigo-500';
    if (quality.overallScore >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Rows</span>
            <Rows className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {overview.rowCount.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Active records
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Columns</span>
            <Columns className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {overview.columnCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Feature attributes
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Missing Cells</span>
            <AlertCircle className={`w-4 h-4 ${overview.missingCells > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {overview.missingCells.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {overview.missingCellPercentage}% of data
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Duplicate Rows</span>
            <Copy className={`w-4 h-4 ${overview.duplicateRowCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {overview.duplicateRowCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {overview.duplicateRowCount === 0 ? 'Clean records' : 'Redundant'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Numeric Fields</span>
            <Hash className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {overview.numericColumnCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Quantitative
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Categorical</span>
            <Type className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {overview.categoricalColumnCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Qualitative/Labels
          </span>
        </div>
      </div>

      {/* Dataset Quality Indicator Heuristic Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Dataset Health & Hygiene Profile
              </h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                Heuristic Assessment
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rule-based heuristic calculated from cell completeness, row uniqueness, and type consistency. Not an authoritative domain audit.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400">Overall Rating</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className={`text-2xl font-black ${getQualityBadgeColor()}`}>
                  {quality.overallScore}
                </span>
                <span className="text-xs text-slate-400">/100</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  ({quality.rating})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Completeness</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{quality.completenessScore}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${quality.completenessScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Ratio of non-empty data cells across all rows.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Uniqueness</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{quality.uniquenessScore}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${quality.uniquenessScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Proportion of distinct rows without duplicate records.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Type Uniformity</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{quality.typeConsistencyScore}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all"
                style={{ width: `${quality.typeConsistencyScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Percentage of values matching inferred data types.
            </p>
          </div>
        </div>

        {/* Quality Highlights & Issues */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-xs">
          {quality.positiveHighlights.map((pos, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{pos}</span>
            </div>
          ))}
          {quality.issues.map((iss, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{iss}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Column Profiler Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Column Architecture & Data Profiling
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inferred types, missing rates, and value cardinality across all {columns.length} columns.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter columns..."
              value={columnSearch}
              onChange={(e) => setColumnSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">Inferred Type</th>
                <th className="py-3 px-4">Missing Values</th>
                <th className="py-3 px-4">Unique Values</th>
                <th className="py-3 px-4">Summary Metric</th>
                <th className="py-3 px-4">Sample Values</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredColumns.map((col) => {
                const p = columnProfiles[col];
                if (!p) return null;

                return (
                  <tr
                    key={col}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {col}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        {getTypeIcon(p.type)}
                        <span>{p.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.missingCount === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">0 (0%)</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          {p.missingCount} ({p.missingPercentage}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {p.uniqueCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {p.type === 'number' ? (
                        <span>
                          [{p.min ?? '?'}, {p.max ?? '?'}] (μ {p.mean ?? '?'})
                        </span>
                      ) : (
                        <span>
                          Top: &quot;{p.topValue ?? 'N/A'}&quot; ({p.topCount ?? 0})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {p.sampleValues.slice(0, 3).map((v) => String(v ?? 'null')).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectingColumn(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Column Detail Modal */}
      {inspectingColumn && (
        <ColumnDetailModal
          columnProfile={inspectingColumn}
          rows={rawRows}
          onClose={() => setInspectingColumn(null)}
        />
      )}
    </div>
  );
}
