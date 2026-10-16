'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  Sparkles,
  FileSpreadsheet,
  Download,
  Trash2,
  FolderOpen,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { ExportModal } from './ExportModal';

export function WorkspaceHeader({ onOpenUpload }: { onOpenUpload: () => void }) {
  const { dataset, clearWorkspace, activeTab, setActiveTab } = useWorkspace();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const qualityScore = dataset?.overview.quality.overallScore ?? 100;
  const qualityRating = dataset?.overview.quality.rating ?? 'Excellent';

  const getQualityBadgeColor = () => {
    if (qualityScore >= 90)
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    if (qualityScore >= 75)
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20';
    if (qualityScore >= 60)
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo and breadcrumbs */}
            <div className="flex items-center gap-4 min-w-0">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white tracking-tight hidden sm:inline">
                  Insight<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
                </span>
              </Link>

              {dataset && (
                <div className="flex items-center gap-2 min-w-0 border-l border-slate-200 dark:border-slate-800 pl-4">
                  <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[180px] sm:max-w-[280px]">
                        {dataset.name}
                      </span>
                      <span
                        className={`hidden md:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${getQualityBadgeColor()}`}
                      >
                        {qualityScore >= 75 ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        Quality {qualityScore}% ({qualityRating})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-2">
                      <span>{dataset.overview.rowCount.toLocaleString()} rows</span>
                      <span>•</span>
                      <span>{dataset.overview.columnCount} columns</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {dataset && (
                <>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>

                  <button
                    onClick={onOpenUpload}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Switch or Upload New Dataset"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Switch Data</span>
                  </button>

                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Clear Active Dataset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              <Link
                href="/privacy"
                className="hidden lg:inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 px-2 py-1 rounded-md"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Client-Side</span>
              </Link>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Clear Workspace Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Clear Active Workspace?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              This will remove the dataset from browser memory and reset all transformations. Since
              no data is stored on any server, unsaved changes will be lost.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearWorkspace();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors"
              >
                Clear Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
    </>
  );
}
