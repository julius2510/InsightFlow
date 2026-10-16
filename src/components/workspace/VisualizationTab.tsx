'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { ChartType, AggregationMethod } from '@/types/charts';
import {
  prepareChartData,
  validateChartConfig,
  CHART_PALETTES,
} from '@/lib/visualization/chartData';
import { toPng } from 'html-to-image';
import { useToast } from '@/components/ui/Toast';
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  PieChart as PieChartIcon,
  ScatterChart as ScatterIcon,
  Grid as GridIcon,
  Columns as HistogramIcon,
  Download,
  AlertCircle,
  RotateCcw,
  Sliders,
  Palette,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function VisualizationTab() {
  const { dataset, chartConfig, setChartConfig } = useWorkspace();
  const { success, error } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!dataset) return null;

  const { rawRows, columns, columnProfiles } = dataset;

  const validation = validateChartConfig(chartConfig, columnProfiles);

  const { data: chartData, keys } = useMemo(() => {
    return prepareChartData(rawRows, chartConfig, columnProfiles);
  }, [rawRows, chartConfig, columnProfiles]);

  const activePalette =
    CHART_PALETTES.find((p) => p.id === chartConfig.colorTheme) || CHART_PALETTES[0];

  const handleExportPNG = async () => {
    if (!chartRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${(chartConfig.title || 'chart').toLowerCase().replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      success('Chart Exported', 'Downloaded high-resolution PNG image.');
    } catch (err: any) {
      error('Export Failed', 'Could not render PNG from chart.');
    } finally {
      setIsExporting(false);
    }
  };

  const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: 'bar', label: 'Bar', icon: <BarChartIcon className="w-4 h-4" /> },
    { type: 'line', label: 'Line', icon: <LineChartIcon className="w-4 h-4" /> },
    { type: 'area', label: 'Area', icon: <AreaChartIcon className="w-4 h-4" /> },
    { type: 'pie', label: 'Pie', icon: <PieChartIcon className="w-4 h-4" /> },
    { type: 'histogram', label: 'Histogram', icon: <HistogramIcon className="w-4 h-4" /> },
    { type: 'scatter', label: 'Scatter', icon: <ScatterIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* Controls Sidebar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 lg:sticky lg:top-20">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chart Studio</h3>
          </div>
          <button
            onClick={() =>
              setChartConfig((prev) => ({
                ...prev,
                title: 'Data Visualization',
                aggregation: 'sum',
                showGrid: true,
                showLegend: true,
              }))
            }
            className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* 1. Chart Type */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
            Chart Type
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {chartTypes.map((ct) => (
              <button
                key={ct.type}
                onClick={() => setChartConfig((prev) => ({ ...prev, type: ct.type }))}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all ${
                  chartConfig.type === ct.type
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {ct.icon}
                <span className="mt-1">{ct.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Title */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Chart Title
          </label>
          <input
            type="text"
            value={chartConfig.title}
            onChange={(e) => setChartConfig((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* 3. X-Axis Field */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {chartConfig.type === 'histogram' ? 'Value Field (Numeric)' : 'X-Axis / Category Field'}
          </label>
          <select
            value={chartConfig.xAxis}
            onChange={(e) => setChartConfig((prev) => ({ ...prev, xAxis: e.target.value }))}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {columns.map((c) => (
              <option key={c} value={c}>
                {c} ({columnProfiles[c]?.type})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Y-Axis Field (if not histogram) */}
        {chartConfig.type !== 'histogram' && (
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Y-Axis / Metric Field
            </label>
            <select
              value={chartConfig.yAxis}
              onChange={(e) => setChartConfig((prev) => ({ ...prev, yAxis: e.target.value }))}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">(None - Record Count)</option>
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c} ({columnProfiles[c]?.type})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 5. Aggregation Method */}
        {chartConfig.type !== 'scatter' && chartConfig.type !== 'histogram' && (
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Aggregation Method
            </label>
            <select
              value={chartConfig.aggregation}
              onChange={(e) =>
                setChartConfig((prev) => ({
                  ...prev,
                  aggregation: e.target.value as AggregationMethod,
                }))
              }
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="sum">Sum</option>
              <option value="avg">Average (Mean)</option>
              <option value="count">Record Count</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
              <option value="none">None (Raw points)</option>
            </select>
          </div>
        )}

        {/* 6. Group By */}
        {chartConfig.type === 'bar' && (
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Breakdown / Group By (Optional)
            </label>
            <select
              value={chartConfig.groupBy || ''}
              onChange={(e) =>
                setChartConfig((prev) => ({ ...prev, groupBy: e.target.value || undefined }))
              }
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">(None)</option>
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 7. Color Theme */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span>Color Palette</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {CHART_PALETTES.map((pal) => (
              <button
                key={pal.id}
                onClick={() => setChartConfig((prev) => ({ ...prev, colorTheme: pal.id }))}
                className={`p-2 rounded-xl border text-[11px] text-left transition-all ${
                  chartConfig.colorTheme === pal.id
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 font-bold'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex gap-1 mb-1">
                  {pal.colors.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-slate-700 dark:text-slate-300">{pal.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Display Toggles */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={chartConfig.showGrid}
              onChange={(e) =>
                setChartConfig((prev) => ({ ...prev, showGrid: e.target.checked }))
              }
              className="rounded text-indigo-600"
            />
            <span>Show Gridlines</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={chartConfig.showLegend}
              onChange={(e) =>
                setChartConfig((prev) => ({ ...prev, showLegend: e.target.checked }))
              }
              className="rounded text-indigo-600"
            />
            <span>Show Legend</span>
          </label>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Canvas Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between min-h-[540px]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {chartConfig.title || 'Data Visualization'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {chartConfig.type.toUpperCase()} • X: {chartConfig.xAxis || 'None'} • Y:{' '}
                {chartConfig.yAxis || 'Record Count'} ({chartConfig.aggregation})
              </p>
            </div>

            <button
              onClick={handleExportPNG}
              disabled={!validation.valid || isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
            </button>
          </div>

          {/* Validation Warning */}
          {!validation.valid ? (
            <div className="my-auto py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Field Compatibility Notice
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{validation.error}</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="my-auto py-16 text-center text-slate-400 text-xs">
              No points available to render with current configuration.
            </div>
          ) : (
            <div ref={chartRef} className="w-full h-[440px] pt-4 bg-white dark:bg-slate-900">
              <ResponsiveContainer width="100%" height="100%">
                {chartConfig.type === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                    {chartConfig.showGrid && (
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    )}
                    <XAxis dataKey={chartConfig.xAxis} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#fff',
                      }}
                    />
                    {chartConfig.showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
                    {keys.map((k, i) => (
                      <Bar
                        key={k}
                        dataKey={k}
                        fill={activePalette.colors[i % activePalette.colors.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                ) : chartConfig.type === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                    {chartConfig.showGrid && (
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    )}
                    <XAxis dataKey={chartConfig.xAxis} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#fff',
                      }}
                    />
                    {chartConfig.showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
                    {keys.map((k, i) => (
                      <Line
                        key={k}
                        type="monotone"
                        dataKey={k}
                        stroke={activePalette.colors[i % activePalette.colors.length]}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                ) : chartConfig.type === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                    {chartConfig.showGrid && (
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    )}
                    <XAxis dataKey={chartConfig.xAxis} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#fff',
                      }}
                    />
                    {chartConfig.showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
                    {keys.map((k, i) => (
                      <Area
                        key={k}
                        type="monotone"
                        dataKey={k}
                        stroke={activePalette.colors[i % activePalette.colors.length]}
                        fill={activePalette.colors[i % activePalette.colors.length]}
                        fillOpacity={0.25}
                      />
                    ))}
                  </AreaChart>
                ) : chartConfig.type === 'pie' ? (
                  <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#fff',
                      }}
                    />
                    {chartConfig.showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey={chartConfig.xAxis}
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      innerRadius={60}
                      paddingAngle={3}
                      label={({ name, percent }: any) =>
                        `${name} (${(Number(percent) * 100).toFixed(0)}%)`
                      }
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={activePalette.colors[index % activePalette.colors.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                ) : chartConfig.type === 'histogram' ? (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                    {chartConfig.showGrid && (
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    )}
                    <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="count" fill={activePalette.colors[0]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  // Scatter Plot
                  <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                    {chartConfig.showGrid && (
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    )}
                    <XAxis
                      type="number"
                      dataKey="x"
                      name={chartConfig.xAxis}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name={chartConfig.yAxis}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#fff',
                      }}
                    />
                    <Scatter
                      name={`${chartConfig.xAxis} vs ${chartConfig.yAxis}`}
                      data={chartData}
                      fill={activePalette.colors[0]}
                    />
                  </ScatterChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Aggregated and plotted strictly within browser memory.</span>
            <span>{chartData.length} data series rendered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
