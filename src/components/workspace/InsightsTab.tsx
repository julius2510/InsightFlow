'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Cpu,
  BrainCircuit,
  Lock,
} from 'lucide-react';

export function InsightsTab() {
  const { dataset, ruleInsights, aiInsights, isAiLoading, requestAIAnalysis } = useWorkspace();
  const [showAiDisclosure, setShowAiDisclosure] = useState(false);

  if (!dataset || !ruleInsights) return null;

  const factualInsights = ruleInsights.insights.filter((i) => i.type === 'factual');
  const hypothesisInsights = ruleInsights.insights.filter((i) => i.type === 'hypothesis');

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'alert':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Engine Status Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Cpu className="w-3.5 h-3.5" />
                <span>Deterministic Rule Engine Active</span>
              </span>
              <span className="text-xs text-indigo-200/70 hidden sm:inline">
                • 100% Offline & Private
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Automated Analytical Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 mt-2 leading-relaxed">
              {ruleInsights.summary}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
            <button
              onClick={() => setShowAiDisclosure(true)}
              disabled={isAiLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-950 hover:bg-indigo-50 shadow-lg shadow-indigo-950/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              <span>{isAiLoading ? 'Analyzing Summary...' : 'Run Server-Side AI Deep Dive'}</span>
            </button>
            <span className="text-[11px] text-indigo-300/70 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Sends metadata only; never raw data rows
            </span>
          </div>
        </div>
      </div>

      {/* AI Disclosure & Confirmation Modal */}
      {showAiDisclosure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-4">
              <BrainCircuit className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Privacy Notice: Optional AI Synthesis
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              InsightFlow strictly protects your privacy. If you enable the optional AI deep dive:
            </p>

            <div className="space-y-2 mb-6 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Safe Metadata Only:</strong> We send aggregated statistics (means, ranges, column names, top categories, and correlations).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Raw Data:</strong> None of your individual data rows or confidential records are transmitted.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Offline Fallback:</strong> If no API key is configured on the server, InsightFlow falls back cleanly to local rule insights without breaking.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAiDisclosure(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAiDisclosure(false);
                  requestAIAnalysis();
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Confirm &amp; Run Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generated Response (if available) */}
      {aiInsights && (
        <div className="p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-200/50 dark:border-indigo-900/40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                {aiInsights.isRealAI ? 'AI Executive Analysis' : 'Local Rule Engine Synthesis'}
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
              {aiInsights.modelUsed || 'Rule Engine'}
            </span>
          </div>

          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {aiInsights.executiveSummary}
          </p>

          {aiInsights.keyFindings && aiInsights.keyFindings.length > 0 && (
            <div>
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block mb-1.5">
                Key AI Findings:
              </span>
              <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                {aiInsights.keyFindings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {aiInsights.hypotheses && aiInsights.hypotheses.length > 0 && (
            <div>
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block mb-1.5">
                Hypotheses to Validate:
              </span>
              <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                {aiInsights.hypotheses.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {aiInsights.suggestedActions && aiInsights.suggestedActions.length > 0 && (
            <div className="pt-2 border-t border-indigo-200/40 dark:border-indigo-900/30">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block mb-1">
                Suggested Next Actions:
              </span>
              <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                {aiInsights.suggestedActions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Factual Findings & Observations Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Factual Observations & Statistical Findings</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Empirically verified mathematical observations computed directly from the current records.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {factualInsights.length} Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factualInsights.map((ins) => (
            <div
              key={ins.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getSeverityBadge(
                      ins.severity
                    )}`}
                  >
                    {ins.category}
                  </span>
                  {ins.metricValue !== undefined && (
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {ins.metricValue}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  {ins.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ins.description}
                </p>
              </div>

              {ins.relatedColumns.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Fields:</span>
                  {ins.relatedColumns.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hypotheses & Patterns */}
      {hypothesisInsights.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Hypotheses & Potential Patterns</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Plausible explanations requiring human domain validation.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
              {hypothesisInsights.length} Hypotheses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hypothesisInsights.map((ins) => (
              <div
                key={ins.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                      Hypothesis
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {ins.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ins.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Follow-Up Questions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Suggested Analytical Inquiries & Next Steps
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Recommended business and research questions tailored to the signals discovered in this dataset.
        </p>

        <div className="space-y-2.5">
          {ruleInsights.followUpQuestions.map((q, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="mt-0.5 leading-relaxed">{q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
