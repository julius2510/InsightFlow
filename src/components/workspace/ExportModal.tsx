'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { exportToCSV } from '@/lib/export/csvExport';
import {
  generateMarkdownReport,
  openPrintableReportWindow,
} from '@/lib/export/reportGenerator';
import { computeCorrelationMatrix } from '@/lib/statistics/correlation';
import { useToast } from '@/components/ui/Toast';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export function ExportModal({ onClose }: { onClose: () => void }) {
  const { dataset, originalDataset, ruleInsights } = useWorkspace();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  if (!dataset || !ruleInsights) return null;

  const numericCols = dataset.columns.filter(
    (c) => dataset.columnProfiles[c]?.type === 'number'
  );
  const corrMatrix =
    numericCols.length > 1
      ? computeCorrelationMatrix(dataset.rawRows, numericCols)
      : undefined;

  const handleExportCurrentCSV = () => {
    exportToCSV(dataset.rawRows, `${dataset.name}_active_cleaned.csv`);
    success('CSV Exported', `Downloaded ${dataset.rawRows.length} rows.`);
  };

  const handleExportOriginalCSV = () => {
    if (!originalDataset) return;
    exportToCSV(originalDataset.rawRows, `${originalDataset.name}_raw_original.csv`);
    success('Original CSV Exported', `Downloaded original ${originalDataset.rawRows.length} rows.`);
  };

  const handleCopySummary = async () => {
    const md = generateMarkdownReport(dataset, ruleInsights, corrMatrix);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    success('Copied to Clipboard', 'Analytical summary markdown copied.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenPrintableReport = () => {
    openPrintableReportWindow(dataset, ruleInsights);
    success('Printable Report Generated', 'Opened in a new window.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Export Dataset &amp; Analytical Reports
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Export Cleaned CSV */}
          <button
            onClick={handleExportCurrentCSV}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-500 hover:bg-indigo-50/30 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-2">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600">
                Export Cleaned CSV
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Reflects all current row filters, deduplications, and imputations.
              </p>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 mt-3 block">
              Download .csv &rarr;
            </span>
          </button>

          {/* 2. Export Raw Original CSV */}
          <button
            onClick={handleExportOriginalCSV}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-400 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-2">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                Export Original CSV
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Download the unmodified dataset as initially ingested.
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 mt-3 block">
              Download .csv &rarr;
            </span>
          </button>

          {/* 3. Printable PDF / HTML Report */}
          <button
            onClick={handleOpenPrintableReport}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-500 hover:bg-indigo-50/30 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center mb-2">
                <Printer className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600">
                Printable PDF Report
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Full executive summary, metrics, column dictionary, and strategic inquiries.
              </p>
            </div>
            <span className="text-[10px] font-bold text-violet-600 mt-3 block">
              Open Printable &rarr;
            </span>
          </button>

          {/* 4. Copy Markdown Summary */}
          <button
            onClick={handleCopySummary}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-500 hover:bg-indigo-50/30 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600">
                Copy Markdown Summary
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Formatted Markdown for READMEs, Slack, Notion, or presentations.
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 mt-3 block">
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </span>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
          All reports and CSV exports are synthesized entirely in client memory. No telemetry or dataset contents are sent to external cloud servers.
        </div>
      </div>
    </div>
  );
}
