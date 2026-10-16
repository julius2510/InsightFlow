'use client';

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  ShieldCheck,
  Lock,
  Cpu,
  DatabaseZap,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">
              Insight<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/workspace"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
            >
              Open Workspace
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-4 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy-First Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Data Handling &amp; Privacy Statement
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            InsightFlow was engineered specifically to respect user privacy and eliminate remote data exposure. Here is exactly how your files and data are handled.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1: In-Browser Processing */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  1. 100% In-Browser Execution by Default
                </h2>
                <span className="text-xs text-slate-400">Zero backend file ingestion</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              When you drag and drop or browse a CSV or Excel file, the file is read directly into your web browser&apos;s memory using the HTML5 File API, <strong>Papa Parse</strong>, and <strong>SheetJS</strong>.
            </p>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Parsing & Profiling:</strong> Header detection, missing cell calculation, and data type inference run completely on your CPU.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Statistics & Heatmaps:</strong> Pearson correlations, standard deviation, and quartiles are computed client-side.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Visualizations:</strong> Recharts graphs and SVG exports render directly within your local DOM.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Data Cleaning:</strong> Transformations create immutable state copies in browser RAM, enabling instant undo/redo without server calls.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 2: No Databases & Clearing Workspace */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <DatabaseZap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  2. No Accounts, No Database, No Cookies
                </h2>
                <span className="text-xs text-slate-400">Ephemeral application state</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              InsightFlow does not require registration, login, or personal profiles. We operate zero cloud databases for user datasets.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>How to completely wipe workspace memory</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                You can immediately flush all dataset contents from memory at any moment by clicking the <strong>Trash (Clear Workspace)</strong> button in the workspace header, or simply by closing or refreshing your browser tab.
              </p>
            </div>
          </div>

          {/* Section 3: Optional AI Synthesis */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  3. Optional Server-Side AI Integration
                </h2>
                <span className="text-xs text-slate-400">Strict metadata-only transmission</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              InsightFlow includes a built-in deterministic rule engine that produces rich analytical insights completely offline. If you or your organization choose to trigger the optional server-side AI deep dive:
            </p>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  <strong>What is sent:</strong> Summary aggregates only (e.g. column names, inferred types, means, ranges, category cardinality, and Pearson correlation coefficients).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  <strong>What is NEVER sent:</strong> Individual row records, confidential customer data, names, addresses, or file raw contents.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero AI Lock-In:</strong> If no AI API key is configured in the server environment, InsightFlow falls back cleanly to the rule engine with zero functionality loss.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 4: Untrusted File Handling */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Untrusted Data Sanitization
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              All uploaded spreadsheet contents are treated strictly as untrusted raw strings and numbers. Cells are rendered via standard React text nodes rather than innerHTML, preventing XSS (Cross-Site Scripting), formula execution, or code injection attacks.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-tr from-indigo-50 via-slate-50 to-violet-50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-indigo-200/60 dark:border-indigo-900/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Ready to Explore Your Data Privately?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
            Get started right now with zero signup. Drop in your dataset or try one of our built-in samples.
          </p>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all"
          >
            <span>Launch Workspace</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500">
        InsightFlow • Privacy-First Interactive Analytics Studio
      </footer>
    </div>
  );
}
