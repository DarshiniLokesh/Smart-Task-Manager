'use client';

import React from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Sparkles, Plus, Bell, CheckSquare, Zap, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    openCreateModal,
    openAiBreakdownModal,
    openAiPrioritizeModal,
    toggleNotificationsDrawer,
    notifications,
    isSyncing,
    fetchTasks,
  } = useTaskStore();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-500/20">
            <CheckSquare className="h-5 w-5" />
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950">
              <Zap className="h-2.5 w-2.5 text-slate-950" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Smart<span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Tasks</span>
              </h1>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                AI Powered
              </span>
              {isSyncing && (
                <span className="flex items-center gap-1 text-xs text-slate-400 animate-pulse">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Syncing...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent Kanban & AI Task Prioritization
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Tasks Button */}
          <button
            onClick={() => fetchTasks()}
            title="Refresh Tasks"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* AI Prioritize Button */}
          <button
            onClick={openAiPrioritizeModal}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-indigo-500/30 px-3.5 py-2 text-xs sm:text-sm font-medium text-indigo-300 shadow-md shadow-indigo-950/40 transition-all hover:border-indigo-500/60 hover:bg-slate-800 hover:text-white hover:shadow-indigo-500/20 active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-indigo-400 transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline">AI Prioritize</span>
            <span className="sm:hidden">Prioritize</span>
          </button>

          {/* AI Task Breakdown Button */}
          <button
            onClick={() => openAiBreakdownModal()}
            className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-purple-500/30 px-3.5 py-2 text-xs sm:text-sm font-medium text-purple-300 shadow-md shadow-purple-950/40 transition-all hover:border-purple-500/60 hover:bg-slate-800 hover:text-white hover:shadow-purple-500/20 active:scale-95"
          >
            <Zap className="h-4 w-4 text-purple-400 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">AI Breakdown</span>
            <span className="sm:hidden">Breakdown</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={toggleNotificationsDrawer}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white active:scale-95"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifications.total > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-900/50 animate-pulse">
                {notifications.total}
              </span>
            )}
          </button>

          {/* New Task Button */}
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:opacity-95 hover:shadow-blue-600/40 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
