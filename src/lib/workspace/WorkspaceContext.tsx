'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dataset,
  TableFilter,
  TableSort,
} from '@/types/dataset';
import { ChartConfig } from '@/types/charts';
import { CleaningHistoryStep, CleaningOperation } from '@/types/cleaning';
import { AISummaryResponse } from '@/types/insights';
import { profileDataset } from '../statistics/profiler';
import { parseCSVString } from '../parsers/csvParser';
import { inspectExcelWorkbook, parseExcelSheet } from '../parsers/excelParser';
import { SAMPLE_DATASETS } from '../samples/sampleData';
import { getSensibleChartConfig } from '../visualization/chartData';
import { generateRuleBasedInsights, GeneratedInsightsResult } from '../insights/ruleEngine';
import { useToast } from '@/components/ui/Toast';

export type WorkspaceTab =
  | 'overview'
  | 'table'
  | 'statistics'
  | 'visualize'
  | 'insights'
  | 'cleaning';

interface WorkspaceContextType {
  dataset: Dataset | null;
  originalDataset: Dataset | null;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  isLoading: boolean;
  loadingMessage: string;

  // History / Undo / Redo
  historyPast: CleaningHistoryStep[];
  historyFuture: CleaningHistoryStep[];
  applyCleaning: (cleanedRows: Record<string, any>[], op: CleaningOperation) => void;
  undo: () => void;
  redo: () => void;
  resetToOriginal: () => void;

  // Table controls
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortConfig: TableSort | null;
  setSortConfig: (s: TableSort | null) => void;
  filters: TableFilter[];
  addFilter: (filter: TableFilter) => void;
  removeFilter: (column: string) => void;
  clearFilters: () => void;
  hiddenColumns: Set<string>;
  toggleColumnVisibility: (col: string) => void;
  setAllColumnsVisible: (visible: boolean) => void;

  // Chart controls
  chartConfig: ChartConfig;
  setChartConfig: React.Dispatch<React.SetStateAction<ChartConfig>>;

  // Insights
  ruleInsights: GeneratedInsightsResult | null;
  aiInsights: AISummaryResponse | null;
  isAiLoading: boolean;
  requestAIAnalysis: () => Promise<void>;

  // Dataset Ingest & Reset
  loadFromCSV: (csvString: string, fileName: string, fileSize?: number, delimiter?: string) => void;
  loadFromExcelBuffer: (buffer: ArrayBuffer, fileName: string, fileSize?: number, sheet?: string) => void;
  loadSample: (sampleId: string) => void;
  clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { success, error, info } = useToast();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [originalDataset, setOriginalDataset] = useState<Dataset | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Undo / Redo history
  const [historyPast, setHistoryPast] = useState<CleaningHistoryStep[]>([]);
  const [historyFuture, setHistoryFuture] = useState<CleaningHistoryStep[]>([]);

  // Table controls
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<TableSort | null>(null);
  const [filters, setFilters] = useState<TableFilter[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // Chart config
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'bar',
    title: 'Data Visualization',
    xAxis: '',
    yAxis: '',
    aggregation: 'count',
    showGrid: true,
    showLegend: true,
    colorTheme: 'violet-indigo',
  });

  // AI Insights
  const [aiInsights, setAiInsights] = useState<AISummaryResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Compute Rule-Based Insights reactively whenever dataset updates
  const ruleInsights = useMemo(() => {
    if (!dataset) return null;
    return generateRuleBasedInsights(dataset);
  }, [dataset]);

  const loadFromCSV = useCallback(
    (csvString: string, fileName: string, fileSize: number = 0, delimiter?: string) => {
      try {
        setIsLoading(true);
        setLoadingMessage('Parsing CSV and inferring column types...');

        const parseResult = parseCSVString(csvString, { delimiter });
        const { rows, columns, warnings } = parseResult;

        if (columns.length === 0 || rows.length === 0) {
          throw new Error('No valid columns or rows found in file.');
        }

        const { overview, columnProfiles } = profileDataset(rows, columns);

        const newDataset: Dataset = {
          id: `ds-${Date.now()}`,
          name: fileName.replace(/\.[^/.]+$/, ''),
          fileName,
          fileSize,
          rawRows: rows,
          columns,
          columnProfiles,
          overview,
          loadedAt: new Date().toLocaleTimeString(),
        };

        setDataset(newDataset);
        setOriginalDataset(JSON.parse(JSON.stringify(newDataset)));
        setHistoryPast([]);
        setHistoryFuture([]);
        setFilters([]);
        setSearchQuery('');
        setHiddenColumns(new Set());
        setSortConfig(null);
        setAiInsights(null);

        // Set sensible chart defaults
        setChartConfig(getSensibleChartConfig(columns, columnProfiles));

        if (warnings.length > 0) {
          info('Import Notice', warnings[0]);
        }
        success('Dataset Imported Successfully', `Loaded ${rows.length.toLocaleString()} rows and ${columns.length} columns.`);
      } catch (err: any) {
        error('Import Failed', err.message || 'Failed to parse CSV file.');
      } finally {
        setIsLoading(false);
      }
    },
    [error, info, success]
  );

  const loadFromExcelBuffer = useCallback(
    (buffer: ArrayBuffer, fileName: string, fileSize: number = 0, sheet?: string) => {
      try {
        setIsLoading(true);
        setLoadingMessage('Reading Excel workbook and worksheet...');

        const wbInfo = inspectExcelWorkbook(buffer);
        const parseResult = parseExcelSheet(wbInfo.workbook, sheet);
        const { rows, columns, warnings, selectedSheet } = parseResult;

        const { overview, columnProfiles } = profileDataset(rows, columns);

        const newDataset: Dataset = {
          id: `ds-${Date.now()}`,
          name: `${fileName.replace(/\.[^/.]+$/, '')} (${selectedSheet})`,
          fileName,
          fileSize,
          rawRows: rows,
          columns,
          columnProfiles,
          overview,
          loadedAt: new Date().toLocaleTimeString(),
        };

        setDataset(newDataset);
        setOriginalDataset(JSON.parse(JSON.stringify(newDataset)));
        setHistoryPast([]);
        setHistoryFuture([]);
        setFilters([]);
        setSearchQuery('');
        setHiddenColumns(new Set());
        setSortConfig(null);
        setAiInsights(null);

        setChartConfig(getSensibleChartConfig(columns, columnProfiles));

        if (warnings.length > 0) {
          info('Import Notice', warnings[0]);
        }
        success('Excel File Imported', `Loaded sheet "${selectedSheet}" with ${rows.length.toLocaleString()} rows.`);
      } catch (err: any) {
        error('Excel Import Failed', err.message || 'Failed to parse Excel workbook.');
      } finally {
        setIsLoading(false);
      }
    },
    [error, info, success]
  );

  const loadSample = useCallback(
    (sampleId: string) => {
      const sample = SAMPLE_DATASETS.find((s) => s.id === sampleId) || SAMPLE_DATASETS[0];
      loadFromCSV(sample.csvData, `${sample.name}.csv`, sample.csvData.length);
    },
    [loadFromCSV]
  );

  const clearWorkspace = useCallback(() => {
    setDataset(null);
    setOriginalDataset(null);
    setHistoryPast([]);
    setHistoryFuture([]);
    setFilters([]);
    setSearchQuery('');
    setHiddenColumns(new Set());
    setAiInsights(null);
    info('Workspace Cleared', 'All dataset memory has been completely wiped from your browser.');
  }, [info]);

  // Apply cleaning operation with history recording
  const applyCleaning = useCallback(
    (cleanedRows: Record<string, any>[], op: CleaningOperation) => {
      if (!dataset) return;

      // Extract remaining columns from first row (or current if empty)
      const currentColumns = cleanedRows.length > 0 ? Object.keys(cleanedRows[0]) : dataset.columns;
      const { overview, columnProfiles } = profileDataset(cleanedRows, currentColumns);

      const nextDataset: Dataset = {
        ...dataset,
        rawRows: cleanedRows,
        columns: currentColumns,
        overview,
        columnProfiles,
      };

      // Record step in history
      setHistoryPast((prev) => [...prev, { data: dataset.rawRows, operation: op }]);
      setHistoryFuture([]); // clear redo stack on new action
      setDataset(nextDataset);

      success('Transformation Applied', op.description);
    },
    [dataset, success]
  );

  const undo = useCallback(() => {
    if (historyPast.length === 0 || !dataset) return;

    const previousStep = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);

    const currentStep: CleaningHistoryStep = {
      data: dataset.rawRows,
      operation: {
        id: `undo-${Date.now()}`,
        type: previousStep.operation.type,
        description: `Undone: ${previousStep.operation.description}`,
        params: {},
        timestamp: new Date().toLocaleTimeString(),
        affectedRows: 0,
        affectedCells: 0,
      },
    };

    setHistoryFuture((prev) => [currentStep, ...prev]);
    setHistoryPast(newPast);

    const cols = previousStep.data.length > 0 ? Object.keys(previousStep.data[0]) : dataset.columns;
    const { overview, columnProfiles } = profileDataset(previousStep.data, cols);

    setDataset({
      ...dataset,
      rawRows: previousStep.data,
      columns: cols,
      overview,
      columnProfiles,
    });

    info('Action Undone', previousStep.operation.description);
  }, [historyPast, dataset, info]);

  const redo = useCallback(() => {
    if (historyFuture.length === 0 || !dataset) return;

    const nextStep = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    setHistoryPast((prev) => [
      ...prev,
      {
        data: dataset.rawRows,
        operation: nextStep.operation,
      },
    ]);
    setHistoryFuture(newFuture);

    const cols = nextStep.data.length > 0 ? Object.keys(nextStep.data[0]) : dataset.columns;
    const { overview, columnProfiles } = profileDataset(nextStep.data, cols);

    setDataset({
      ...dataset,
      rawRows: nextStep.data,
      columns: cols,
      overview,
      columnProfiles,
    });

    info('Action Redone', nextStep.operation.description);
  }, [historyFuture, dataset, info]);

  const resetToOriginal = useCallback(() => {
    if (!originalDataset) return;
    setDataset(JSON.parse(JSON.stringify(originalDataset)));
    setHistoryPast([]);
    setHistoryFuture([]);
    success('Reset to Original', 'All cleaning transformations have been reverted to the initial dataset.');
  }, [originalDataset, success]);

  // Column visibility
  const toggleColumnVisibility = useCallback((col: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) {
        next.delete(col);
      } else {
        next.add(col);
      }
      return next;
    });
  }, []);

  const setAllColumnsVisible = useCallback(
    (visible: boolean) => {
      if (visible) {
        setHiddenColumns(new Set());
      } else if (dataset) {
        // Keep at least the first column
        const allButFirst = new Set(dataset.columns.slice(1));
        setHiddenColumns(allButFirst);
      }
    },
    [dataset]
  );

  // Table filters
  const addFilter = useCallback((filter: TableFilter) => {
    setFilters((prev) => [...prev.filter((f) => f.column !== filter.column), filter]);
  }, []);

  const removeFilter = useCallback((col: string) => {
    setFilters((prev) => prev.filter((f) => f.column !== col));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  // Request Optional AI Analysis
  const requestAIAnalysis = useCallback(async () => {
    if (!dataset) return;
    try {
      setIsAiLoading(true);

      // Extract high-level summary only (no raw data records)
      const numericSummaries = dataset.columns
        .filter((c) => dataset.columnProfiles[c]?.type === 'number')
        .map((c) => {
          const p = dataset.columnProfiles[c];
          return {
            column: c,
            mean: p.mean ?? null,
            min: p.min ?? null,
            max: p.max ?? null,
            stdDev: null,
          };
        });

      const categoricalSummaries = dataset.columns
        .filter((c) => dataset.columnProfiles[c]?.type !== 'number')
        .map((c) => {
          const p = dataset.columnProfiles[c];
          return {
            column: c,
            uniqueCount: p.uniqueCount,
            mode: p.topValue ?? null,
            modePercentage: null,
          };
        });

      // Extract strong correlations from rule insights if available
      const strongCorrelations =
        ruleInsights?.insights
          .filter((i) => i.category === 'correlation' && i.relatedColumns.length === 2 && typeof i.metricValue === 'number')
          .map((i) => ({
            col1: i.relatedColumns[0],
            col2: i.relatedColumns[1],
            correlation: Number(i.metricValue),
          })) || [];

      const payload = {
        datasetName: dataset.name,
        rowCount: dataset.overview.rowCount,
        columnCount: dataset.overview.columnCount,
        qualityScore: dataset.overview.quality.overallScore,
        numericSummaries,
        categoricalSummaries,
        strongCorrelations,
      };

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setAiInsights(data);

      if (data.isRealAI) {
        success('AI Insights Ready', `Generated analysis via ${data.modelUsed}.`);
      } else {
        info('Local Insights Active', data.message || 'Offline mode: using deterministic rule insights.');
      }
    } catch (err: any) {
      error('AI Analysis Error', err.message || 'Failed to retrieve AI insights.');
    } finally {
      setIsAiLoading(false);
    }
  }, [dataset, ruleInsights, success, info, error]);

  return (
    <WorkspaceContext.Provider
      value={{
        dataset,
        originalDataset,
        activeTab,
        setActiveTab,
        isLoading,
        loadingMessage,
        historyPast,
        historyFuture,
        applyCleaning,
        undo,
        redo,
        resetToOriginal,
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
        chartConfig,
        setChartConfig,
        ruleInsights,
        aiInsights,
        isAiLoading,
        requestAIAnalysis,
        loadFromCSV,
        loadFromExcelBuffer,
        loadSample,
        clearWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
