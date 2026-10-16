'use client';

import React from 'react';
import {
  UploadCloud,
  FileCheck2,
  LineChart,
  FileDown,
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Drop Any Dataset',
    desc: 'Upload CSV or Excel files. Automated delimiter parsing and sheet discovery without uploading to an external server.',
    icon: <UploadCloud className="w-5 h-5 text-indigo-500" />,
  },
  {
    step: '02',
    title: 'Instant Quality Audit',
    desc: 'Heuristic data quality rating, missing cell detection, duplicate row identification, and column type inference in milliseconds.',
    icon: <FileCheck2 className="w-5 h-5 text-sky-500" />,
  },
  {
    step: '03',
    title: 'Explore & Visualize',
    desc: 'Slice and dice with flexible search, type-appropriate filters, 7 interactive chart types, and automated correlation discovery.',
    icon: <LineChart className="w-5 h-5 text-violet-500" />,
  },
  {
    step: '04',
    title: 'Clean & Export',
    desc: 'Impute missing values, remove duplicates with undo/redo history, and download cleaned CSVs or formatted PDF executive reports.',
    icon: <FileDown className="w-5 h-5 text-emerald-500" />,
  },
];

export function Workflow() {
  return (
    <section className="py-20 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Frictionless Analytics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            From Raw Spreadsheet to Decisions in Seconds
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            A linear, distraction-free workflow designed for researchers, analysts, students, and product teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                    {s.icon}
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-200 dark:text-slate-800">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
