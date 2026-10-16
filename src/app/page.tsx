'use client';

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LiveChartPreview } from '@/components/landing/LiveChartPreview';
import { Features } from '@/components/landing/Features';
import { Workflow } from '@/components/landing/Workflow';
import { Footer } from '@/components/landing/Footer';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Layers,
  BarChart2,
  Cpu,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
              Insight<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Link
              href="/workspace"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Workspace
            </Link>
            <Link
              href="/privacy"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Privacy &amp; Security</span>
            </Link>
            <Link
              href="/workspace?sample=sales"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Samples
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/workspace"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-indigo-500/25 transition-all"
            >
              Start Exploring
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Zero Login • 100% Client-Side Privacy • Instant Analytics</span>
            </div>

            {/* Headline matching mission requirement */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Turn Raw Data Into{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                Clear Insights.
              </span>
            </h1>

            {/* Supporting text matching mission requirement */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Explore your data, uncover patterns, and build meaningful visualizations — all in one workspace.
            </p>

            {/* CTAs matching mission requirement */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/workspace"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/workspace?sample=sales"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Try Sample Dataset</span>
              </Link>
            </div>

            {/* Quick Guarantees */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No sign-up required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Processes CSV &amp; Excel locally</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No database storage</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Chart Preview */}
          <div className="mt-14 max-w-4xl mx-auto">
            <LiveChartPreview />
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <Features />

      {/* Workflow Explanation */}
      <Workflow />

      {/* Privacy Highlight Banner */}
      <section className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-transparent to-slate-100/50 dark:to-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% In-Browser Privacy</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Your Data Never Touches Our Servers
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                InsightFlow processes all CSV parsing, descriptive statistics, chart aggregations, and cleaning steps right on your device. Close the tab or click Clear Workspace, and all session data vanishes instantly.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Link
                  href="/privacy"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Read our complete privacy statement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-3">
              <Link
                href="/workspace"
                className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md text-center transition-all"
              >
                Open Free Workspace
              </Link>
              <Link
                href="/workspace?sample=students"
                className="px-6 py-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-center transition-colors"
              >
                Explore Student Sample
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
