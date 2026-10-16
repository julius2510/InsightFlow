'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const SALES_SAMPLE = [
  { region: 'West', sales: 48500, profit: 12400, margin: 25.5 },
  { region: 'East', sales: 52100, profit: 14800, margin: 28.4 },
  { region: 'Central', sales: 36400, profit: 7900, margin: 21.7 },
  { region: 'South', sales: 41200, profit: 9800, margin: 23.8 },
  { region: 'North', sales: 38900, profit: 8600, margin: 22.1 },
];

const CHURN_SAMPLE = [
  { channel: 'Organic', users: 1420, churnRate: 8.2, satisfaction: 4.6 },
  { channel: 'Paid Ads', users: 2150, churnRate: 14.5, satisfaction: 3.9 },
  { channel: 'Social', users: 1890, churnRate: 16.8, satisfaction: 3.5 },
  { channel: 'Referral', users: 980, churnRate: 4.1, satisfaction: 4.9 },
  { channel: 'Email', users: 1120, churnRate: 9.4, satisfaction: 4.3 },
];

export function LiveChartPreview() {
  const [activeDataset, setActiveDataset] = useState<'sales' | 'churn'>('sales');
  const [chartMode, setChartMode] = useState<'bar' | 'line'>('bar');

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-indigo-500/10">
      {/* Interactive Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Interactive Studio Preview
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live Recharts
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interact with genuine computed chart data right on this landing page.
            </p>
          </div>
        </div>

        {/* Dataset & Mode Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveDataset('sales')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeDataset === 'sales'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sales Analytics
            </button>
            <button
              onClick={() => setActiveDataset('churn')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeDataset === 'churn'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Marketing Retention
            </button>
          </div>

          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setChartMode('bar')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartMode === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Bars
            </button>
            <button
              onClick={() => setChartMode('line')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartMode === 'line'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Trends
            </button>
          </div>
        </div>
      </div>

      {/* Mini Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {activeDataset === 'sales' ? (
          <>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Total Revenue</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">$217,100</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Net Profit</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">$53,500</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Avg Margin</span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">24.7%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Quality Score</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">98/100</span>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Active Users</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">7,560</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Lowest Churn</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">4.1% (Referral)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Avg CSAT</span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">4.24 / 5.0</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Signal Quality</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">High (r = -0.84)</span>
            </div>
          </>
        )}
      </div>

      {/* Rendered Chart */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeDataset === 'sales' ? (
            chartMode === 'bar' ? (
              <BarChart data={SALES_SAMPLE} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} />
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
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sales" name="Sales ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={SALES_SAMPLE} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} />
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
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="sales" name="Sales ($)" stroke="#6366f1" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" name="Profit ($)" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            )
          ) : chartMode === 'bar' ? (
            <BarChart data={CHURN_SAMPLE} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
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
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="users" name="Active Customers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="churnRate" name="Churn Rate (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={CHURN_SAMPLE} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
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
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="users" name="Active Customers" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="churnRate" name="Churn Rate (%)" stroke="#f43f5e" strokeWidth={3} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer CTA Strip */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Real-time client aggregation</span>
        </span>
        <Link
          href={`/workspace?sample=${activeDataset}`}
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
        >
          <span>Explore this dataset in Studio</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
