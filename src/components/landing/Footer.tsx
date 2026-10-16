'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#090d16] py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Insight<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
              </span>
              <p className="text-xs text-slate-500">Interactive AI Data Explorer</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <Link href="/workspace" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Workspace Studio
            </Link>
            <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Data Privacy
            </Link>
            <Link
              href="/workspace?sample=sales"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sales Sample
            </Link>
            <Link
              href="/workspace?sample=customers"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Customer Sample
            </Link>
            <Link
              href="/workspace?sample=students"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Academic Sample
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Client-Side Ingestion • Zero Remote Database Storage</span>
          </div>
          <div>
            &copy; 2026 InsightFlow. Deployable to Vercel.
          </div>
        </div>
      </div>
    </footer>
  );
}
