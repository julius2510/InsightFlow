'use client';

import React from 'react';
import {
  FileSpreadsheet,
  Calculator,
  BarChart3,
  Sparkles,
  Wand2,
  Download,
  ShieldCheck,
  Grid,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <FileSpreadsheet className="w-6 h-6 text-indigo-500" />,
    title: 'Instant In-Browser Ingestion',
    description:
      'Seamlessly drop CSV or multi-sheet Excel files. Automated delimiter detection, BOM cleansing, and column deduplication right in browser memory.',
  },
  {
    icon: <Calculator className="w-6 h-6 text-sky-500" />,
    title: 'Deep Statistical Profiling',
    description:
      'Accurate parametric and non-parametric statistics: sample standard deviation, quartiles, IQR, mode distributions, and Pearson correlation matrices.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-violet-500" />,
    title: 'Interactive Visual Studio',
    description:
      'Generate Bar, Line, Area, Pie, Histogram, and Scatter plots. Filter, aggregate, choose color palettes, and export crisp high-resolution PNGs.',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-amber-500" />,
    title: 'Factual & AI Insights',
    description:
      'Discover strong correlation signals, detect statistical outliers via IQR boundaries, and run optional server-side AI syntheses with zero raw data leaks.',
  },
  {
    icon: <Wand2 className="w-6 h-6 text-emerald-500" />,
    title: 'Data Cleaning & Hygiene',
    description:
      'Deduplicate records, impute missing numbers with mean or median, drop unneeded columns, and filter rows with a full immutable undo/redo history.',
  },
  {
    icon: <Download className="w-6 h-6 text-rose-500" />,
    title: 'Multi-Format Export & Reports',
    description:
      'Export transformed datasets to CSV, copy formatted Markdown executive summaries to your clipboard, or print ready-to-share PDF executive reports.',
  },
];

export function Features() {
  return (
    <section className="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Engineered For Speed &amp; Accuracy
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            Everything You Need To Understand Your Data
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            From raw spreadsheet files to presentation-ready charts and statistical reports — built without accounts or mandatory databases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
