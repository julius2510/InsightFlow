'use client';

import React from 'react';
import { ColumnProfile } from '@/types/dataset';
import { calculateNumericStats } from '@/lib/statistics/numeric';
import { calculateCategoricalStats } from '@/lib/statistics/categorical';
import { generateHistogramData } from '@/lib/visualization/chartData';
import {
  X,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ColumnDetailModalProps {
  columnProfile: ColumnProfile;
  rows: Record<string, any>[];
  onClose: () => void;
}

export function ColumnDetailModal({
  columnProfile,
  rows,
  onClose,
}: ColumnDetailModalProps) {
  const colName = columnProfile.name;
  const colValues = rows.map((r) => r[colName]);

  const numStats =
    columnProfile.type === 'number'
      ? calculateNumericStats(colValues, colName)
      : null;

  const catStats =
    columnProfile.type !== 'number'
      ? calculateCategoricalStats(colValues, colName)
      : null;

  const histogramData =
    columnProfile.type === 'number'
      ? generateHistogramData(rows, colName, 8)
      : [];

  const getTypeIcon = () => {
    switch (columnProfile.type) {
      case 'number':
        return <Hash className="w-4 h-4 text-indigo-500" />;
      case 'date':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'boolean':
        return <ToggleLeft className="w-4 h-4 text-amber-500" />;
      default:
        return <Type className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              {getTypeIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {colName}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {columnProfile.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed profile & value distribution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Missing Values</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {columnProfile.missingCount}
                </span>
                <span className="text-xs text-slate-500">
                  ({columnProfile.missingPercentage}%)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Unique Values</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {columnProfile.uniqueCount.toLocaleString()}
              </p>
            </div>

            {numStats && (
              <>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Mean (Avg)</span>
                  <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {numStats.mean.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Median</span>
                  <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {numStats.median.toLocaleString()}
                  </p>
                </div>
              </>
            )}

            {catStats && (
              <>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 sm:col-span-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Most Frequent (Mode)</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate">
                      {catStats.mode}
                    </span>
                    <span className="text-xs text-slate-500">
                      {catStats.modeFrequency} records
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Distribution Visualizer */}
          {numStats && histogramData.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Value Frequency Histogram</span>
              </h4>
              <div className="h-44 w-full bg-slate-50 dark:bg-slate-800/30 rounded-xl p-2 border border-slate-200/70 dark:border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detailed Statistics Table for Numeric */}
          {numStats && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Statistical Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400">Minimum:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{numStats.min}</strong>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400">Maximum:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{numStats.max}</strong>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400">Range:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{numStats.range}</strong>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400">Sample StdDev:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{numStats.stdDev}</strong>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400">Q1 (25th):</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{numStats.q1}</strong>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400">Median (50th):</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{numStats.median}</strong>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400">Q3 (75th):</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{numStats.q3}</strong>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400">IQR:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{numStats.iqr}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Categorical Frequencies */}
          {catStats && catStats.frequencies.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Top Categories Distribution
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {catStats.frequencies.slice(0, 10).map((f) => (
                  <div
                    key={f.value}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {f.value || '(empty)'}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {f.count.toLocaleString()} ({f.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, f.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Values */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Sample Distinct Values
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {columnProfile.sampleValues.map((val, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                >
                  {val === null || val === undefined ? (
                    <span className="text-rose-500 italic">null</span>
                  ) : (
                    String(val)
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
