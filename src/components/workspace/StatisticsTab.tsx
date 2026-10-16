'use client';

import React, { useMemo, useState } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { calculateNumericStats } from '@/lib/statistics/numeric';
import { calculateCategoricalStats } from '@/lib/statistics/categorical';
import { computeCorrelationMatrix } from '@/lib/statistics/correlation';
import {
  Calculator,
  Grid,
  Info,
  TrendingUp,
  BarChart2,
  Table as TableIcon,
} from 'lucide-react';

export function StatisticsTab() {
  const { dataset } = useWorkspace();
  const [activeSubTab, setActiveSubTab] = useState<'numeric' | 'categorical' | 'correlations'>('numeric');

  if (!dataset) return null;

  const { rawRows, columns, columnProfiles } = dataset;

  const numericCols = useMemo(
    () => columns.filter((c) => columnProfiles[c]?.type === 'number'),
    [columns, columnProfiles]
  );

  const categoricalCols = useMemo(
    () => columns.filter((c) => columnProfiles[c]?.type !== 'number'),
    [columns, columnProfiles]
  );

  // Compute all numeric stats
  const numericStatsList = useMemo(() => {
    return numericCols
      .map((col) => {
        const vals = rawRows.map((r) => r[col]);
        return calculateNumericStats(vals, col);
      })
      .filter(Boolean);
  }, [numericCols, rawRows]);

  // Compute categorical stats
  const categoricalStatsList = useMemo(() => {
    return categoricalCols.map((col) => {
      const vals = rawRows.map((r) => r[col]);
      return calculateCategoricalStats(vals, col);
    });
  }, [categoricalCols, rawRows]);

  // Compute correlation matrix
  const correlationMatrix = useMemo(() => {
    if (numericCols.length < 2) return null;
    return computeCorrelationMatrix(rawRows, numericCols);
  }, [numericCols, rawRows]);

  // Color generator for correlation cell (-1 to +1)
  const getCorrelationColor = (r: number | null) => {
    if (r === null) return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
    if (r === 1) return 'bg-indigo-600 text-white font-bold';
    if (r > 0.7) return 'bg-indigo-500/80 text-white font-bold';
    if (r > 0.4) return 'bg-indigo-400/50 text-indigo-950 dark:text-white font-medium';
    if (r > 0.1) return 'bg-indigo-100/50 dark:bg-indigo-950/40 text-slate-800 dark:text-slate-200';
    if (r >= -0.1 && r <= 0.1) return 'bg-slate-50 dark:bg-slate-900 text-slate-500';
    if (r > -0.4) return 'bg-rose-100/50 dark:bg-rose-950/40 text-slate-800 dark:text-slate-200';
    if (r > -0.7) return 'bg-rose-400/50 text-rose-950 dark:text-white font-medium';
    return 'bg-rose-600 text-white font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('numeric')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'numeric'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Numerical Metrics ({numericCols.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('categorical')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'categorical'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Categorical Metrics ({categoricalCols.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('correlations')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'correlations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Correlation Heatmap ({numericCols.length}x{numericCols.length})</span>
          </button>
        </div>

        {/* Documentation badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <Info className="w-3 h-3 text-indigo-500" />
          <span>Formulas: Sample StdDev (s, N-1), Tukey Quartiles, Pearson r</span>
        </div>
      </div>

      {/* 1. Numerical Deep Dive Table */}
      {activeSubTab === 'numeric' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Descriptive Statistics for Numerical Features
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Parametric & non-parametric indicators calculated across all valid finite numerical cells.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-3 text-right">Valid N</th>
                  <th className="py-3 px-3 text-right">Missing</th>
                  <th className="py-3 px-3 text-right">Mean (μ)</th>
                  <th className="py-3 px-3 text-right">StdDev (s)</th>
                  <th className="py-3 px-3 text-right">Min</th>
                  <th className="py-3 px-3 text-right">Q1 (25%)</th>
                  <th className="py-3 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    Median (Q2)
                  </th>
                  <th className="py-3 px-3 text-right">Q3 (75%)</th>
                  <th className="py-3 px-3 text-right">Max</th>
                  <th className="py-3 px-3 text-right">Range</th>
                  <th className="py-3 px-3 text-right">IQR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                {numericStatsList.map((st) => {
                  if (!st) return null;
                  return (
                    <tr
                      key={st.column}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">
                        {st.column}
                      </td>
                      <td className="py-3 px-3 text-right">{st.validCount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-400">
                        {st.missingCount > 0 ? (
                          <span className="text-amber-500">{st.missingCount}</span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {st.mean.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                        {st.stdDev.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">{st.min.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{st.q1.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                        {st.median.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">{st.q3.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{st.max.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{st.range.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{st.iqr.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Categorical Distribution Cards */}
      {activeSubTab === 'categorical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoricalStatsList.map((cat) => (
            <div
              key={cat.column}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {cat.column}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {cat.uniqueCount.toLocaleString()} distinct values • {cat.missingCount} missing
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Mode (Top)</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[120px] inline-block">
                      {cat.mode}
                    </span>
                  </div>
                </div>

                {/* Frequency bars */}
                <div className="mt-4 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {cat.frequencies.slice(0, 8).map((f) => (
                    <div key={f.value} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                          {f.value || '(Empty)'}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {f.count.toLocaleString()} ({f.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, f.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Pearson Correlation Heatmap */}
      {activeSubTab === 'correlations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pearson Correlation Matrix Heatmap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Measures linear correlation between numeric columns (-1.0 to +1.0).
              </p>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>-1.0 (Inverse)</span>
              <div className="h-3 w-16 rounded bg-gradient-to-r from-rose-600 via-slate-200 dark:via-slate-800 to-indigo-600" />
              <span>+1.0 (Positive)</span>
            </div>
          </div>

          {correlationMatrix ? (
            <div className="overflow-x-auto">
              <table className="text-xs text-center border-collapse mx-auto">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-semibold text-slate-500 dark:text-slate-400">
                      Feature
                    </th>
                    {correlationMatrix.columns.map((c) => (
                      <th
                        key={c}
                        className="p-2 font-semibold text-slate-700 dark:text-slate-300 max-w-[90px] truncate"
                        title={c}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationMatrix.columns.map((rowCol, rIdx) => (
                    <tr key={rowCol}>
                      <td className="p-2 text-left font-bold text-slate-900 dark:text-white max-w-[120px] truncate">
                        {rowCol}
                      </td>
                      {correlationMatrix.columns.map((colCol, cIdx) => {
                        const r = correlationMatrix.matrix[rIdx][cIdx];
                        return (
                          <td
                            key={colCol}
                            className={`p-2.5 font-mono text-xs border border-white dark:border-slate-900 transition-colors ${getCorrelationColor(
                              r
                            )}`}
                            title={`${rowCol} & ${colCol}: r = ${r ?? 'N/A'}`}
                          >
                            {r !== null ? r.toFixed(2) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              At least 2 numerical columns are required to construct a correlation heatmap.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
