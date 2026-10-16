'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { SAMPLE_DATASETS, SampleDatasetMeta } from '@/lib/samples/sampleData';
import { inspectExcelWorkbook } from '@/lib/parsers/excelParser';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  TrendingUp,
  Users,
  GraduationCap,
} from 'lucide-react';

interface DatasetUploaderProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function DatasetUploader({ isModal = false, onClose }: DatasetUploaderProps) {
  const { loadFromCSV, loadFromExcelBuffer, loadSample, isLoading, loadingMessage } = useWorkspace();
  const [isDragging, setIsDragging] = useState(false);
  const [customDelimiter, setCustomDelimiter] = useState<string>('');
  const [showExcelSheetSelector, setShowExcelSheetSelector] = useState<{
    file: File;
    buffer: ArrayBuffer;
    sheets: string[];
  } | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      const fileName = file.name;
      const lower = fileName.toLowerCase();

      // Validate format
      if (!lower.endsWith('.csv') && !lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
        setUploadError('Unsupported file format. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.');
        return;
      }

      // Check file size (e.g. warn or reject > 30MB)
      if (file.size > 35 * 1024 * 1024) {
        setUploadError(
          `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 35MB limit. Please upload a smaller file or sample for in-browser analysis.`
        );
        return;
      }

      try {
        if (lower.endsWith('.csv')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            loadFromCSV(text, fileName, file.size, customDelimiter || undefined);
            if (onClose) onClose();
          };
          reader.readAsText(file);
        } else {
          // Excel file
          const reader = new FileReader();
          reader.onload = (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            try {
              const wbInfo = inspectExcelWorkbook(buffer);
              if (wbInfo.sheetNames.length > 1) {
                setShowExcelSheetSelector({
                  file,
                  buffer,
                  sheets: wbInfo.sheetNames,
                });
                setSelectedSheet(wbInfo.sheetNames[0]);
              } else {
                loadFromExcelBuffer(buffer, fileName, file.size);
                if (onClose) onClose();
              }
            } catch (err: any) {
              setUploadError(err.message || 'Failed to read Excel workbook.');
            }
          };
          reader.readAsArrayBuffer(file);
        }
      } catch (err: any) {
        setUploadError(err.message || 'Error processing file.');
      }
    },
    [customDelimiter, loadFromCSV, loadFromExcelBuffer, onClose]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleSampleClick = (sample: SampleDatasetMeta) => {
    loadSample(sample.id);
    if (onClose) onClose();
  };

  const handleConfirmExcelSheet = () => {
    if (!showExcelSheetSelector) return;
    loadFromExcelBuffer(
      showExcelSheetSelector.buffer,
      showExcelSheetSelector.file.name,
      showExcelSheetSelector.file.size,
      selectedSheet
    );
    setShowExcelSheetSelector(null);
    if (onClose) onClose();
  };

  const getSampleIcon = (id: string) => {
    if (id === 'sales') return <TrendingUp className="w-5 h-5 text-indigo-500" />;
    if (id === 'customers') return <Users className="w-5 h-5 text-sky-500" />;
    return <GraduationCap className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <div className={`w-full ${isModal ? 'p-6' : 'py-8 px-4 sm:px-6 max-w-5xl mx-auto'}`}>
      {/* Excel Sheet Selector Modal */}
      {showExcelSheetSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Select Excel Worksheet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              This workbook contains multiple sheets. Choose which sheet to load:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
              {showExcelSheetSelector.sheets.map((sheet) => (
                <button
                  key={sheet}
                  onClick={() => setSelectedSheet(sheet)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm text-left transition-all ${
                    selectedSheet === sheet
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{sheet}</span>
                  {selectedSheet === sheet && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExcelSheetSelector(null)}
                className="px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExcelSheet}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Load Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header section (if standalone) */}
      {!isModal && (
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Client-Side Privacy Guaranteed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Upload Your Dataset to Begin
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Import CSV or Excel files. All computations occur right in your browser memory — your data never leaves your device.
          </p>
        </div>
      )}

      {/* Dropzone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500/80 bg-white dark:bg-slate-900/60 hover:bg-slate-50/50 dark:hover:bg-slate-900'
        } shadow-sm hover:shadow-md`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
          Drag and drop your dataset here, or <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">browse</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          Supports <strong>CSV (.csv)</strong> and <strong>Excel (.xlsx, .xls)</strong> up to 35MB. Automatic delimiter and sheet detection included.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <FileText className="w-3 h-3 text-indigo-500" /> CSV
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <FileSpreadsheet className="w-3 h-3 text-emerald-500" /> Excel (.xlsx)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <Layers className="w-3 h-3 text-amber-500" /> Multi-Sheet
          </span>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 rounded-2xl flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {loadingMessage || 'Processing file...'}
            </span>
          </div>
        )}
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* CSV Delimiter Fallback Setting */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Custom CSV Delimiter (optional fallback):</span>
        </div>
        <div className="flex items-center gap-2">
          {['', ',', ';', '\t', '|'].map((del) => (
            <button
              key={del || 'auto'}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCustomDelimiter(del);
              }}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                customDelimiter === del
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-indigo-400'
              }`}
            >
              {del === '' ? 'Auto' : del === '\t' ? 'Tab' : del}
            </button>
          ))}
        </div>
      </div>

      {/* Sample Datasets Library */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Or explore with a ready sample dataset</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bundled with realistic multi-type columns, anomalies, and statistics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample)}
              className="text-left p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-500/80 dark:hover:border-indigo-500/80 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 transition-colors">
                    {getSampleIcon(sample.id)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {sample.badge}
                  </span>
                </div>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {sample.name}
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {sample.rowCount} rows • {sample.columnCount} cols
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  Load <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
