'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceProvider, useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { DatasetUploader } from '@/components/workspace/DatasetUploader';
import { OverviewTab } from '@/components/workspace/OverviewTab';
import { DataTableTab } from '@/components/workspace/DataTableTab';
import { StatisticsTab } from '@/components/workspace/StatisticsTab';
import { VisualizationTab } from '@/components/workspace/VisualizationTab';
import { InsightsTab } from '@/components/workspace/InsightsTab';
import { DataCleaningTab } from '@/components/workspace/DataCleaningTab';
import {
  LayoutDashboard,
  Table,
  Calculator,
  BarChart3,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';

function WorkspaceContent() {
  const { dataset, activeTab, setActiveTab, loadSample } = useWorkspace();
  const searchParams = useSearchParams();
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Check if sample param is passed in URL
  useEffect(() => {
    const sampleParam = searchParams.get('sample');
    if (sampleParam && !dataset) {
      loadSample(sampleParam);
    }
  }, [searchParams, dataset, loadSample]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'table', label: 'Data Table', icon: <Table className="w-4 h-4" /> },
    { id: 'statistics', label: 'Statistics', icon: <Calculator className="w-4 h-4" /> },
    { id: 'visualize', label: 'Visualizations', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'insights', label: 'AI Insights', icon: <Sparkles className="w-4 h-4 text-indigo-500" /> },
    { id: 'cleaning', label: 'Data Cleaning', icon: <Wand2 className="w-4 h-4 text-violet-500" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <WorkspaceHeader onOpenUpload={() => setShowUploadModal(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!dataset ? (
          // Empty State: Uploader & Sample Selector
          <DatasetUploader />
        ) : (
          <div className="space-y-6">
            {/* Primary Tab Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 border-b border-slate-200/80 dark:border-slate-800">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                      isActive
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-sm'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Panel */}
            <div className="pt-2">
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'table' && <DataTableTab />}
              {activeTab === 'statistics' && <StatisticsTab />}
              {activeTab === 'visualize' && <VisualizationTab />}
              {activeTab === 'insights' && <InsightsTab />}
              {activeTab === 'cleaning' && <DataCleaningTab />}
            </div>
          </div>
        )}
      </main>

      {/* Switch Dataset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-4 top-4 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <DatasetUploader isModal onClose={() => setShowUploadModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Loading workspace...</div>}>
        <WorkspaceContent />
      </Suspense>
    </WorkspaceProvider>
  );
}
