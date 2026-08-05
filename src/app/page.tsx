'use client';

import React, { useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Header } from '@/components/Header';
import { AnalyticsOverview } from '@/components/AnalyticsOverview';
import { FilterBar } from '@/components/FilterBar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskModal } from '@/components/TaskModal';
import { AiBreakdownModal } from '@/components/AiBreakdownModal';
import { AiPrioritizeModal } from '@/components/AiPrioritizeModal';
import { NotificationsDrawer } from '@/components/NotificationsDrawer';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function Home() {
  const { fetchTasks, isLoading, error } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Error Alert if any */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Analytics & Metric Overview Cards */}
        <AnalyticsOverview />

        {/* Search & Filtering Controls Bar */}
        <FilterBar />

        {/* Loading Spinner / Kanban Board */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-slate-400">Loading Smart Tasks board...</p>
          </div>
        ) : (
          <KanbanBoard />
        )}
      </main>

      {/* Modal Dialogs & Drawers */}
      <TaskModal />
      <AiBreakdownModal />
      <AiPrioritizeModal />
      <NotificationsDrawer />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smart Task Manager — Next.js, TypeScript, Mongoose MongoDB, dnd-kit, Zustand & OpenAI</span>
          <span className="text-slate-600">Built with Antigravity Pair Programming</span>
        </div>
      </footer>
    </div>
  );
}
