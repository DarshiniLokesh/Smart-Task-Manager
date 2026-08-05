'use client';

import React from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { CheckCircle2, Clock, AlertTriangle, Layers, TrendingUp } from 'lucide-react';

export const AnalyticsOverview: React.FC = () => {
  const { tasks } = useTaskStore();

  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const done = tasks.filter((t) => t.status === 'done').length;

  const now = new Date();
  const overdue = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
  ).length;

  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      {/* Total Tasks Card */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-slate-700/80">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Total Tasks</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{total}</span>
            <span className="text-[10px] text-slate-500">{todo} todo</span>
          </div>
        </div>
      </div>

      {/* In Progress Card */}
      <div className="flex items-center gap-3 rounded-2xl border border-blue-900/40 bg-blue-950/20 p-4 backdrop-blur-md transition-all hover:border-blue-800/50">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Clock className="h-5 w-5 animate-spin-slow" />
        </div>
        <div>
          <p className="text-xs font-medium text-blue-300/80">In Progress</p>
          <span className="text-xl font-bold text-blue-400">{inProgress}</span>
        </div>
      </div>

      {/* Completed Card */}
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4 backdrop-blur-md transition-all hover:border-emerald-800/50">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-emerald-300/80">Completed</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400">{done}</span>
            <span className="text-[10px] font-semibold text-emerald-500">{completionPct}%</span>
          </div>
        </div>
      </div>

      {/* Overdue Card */}
      <div className="flex items-center gap-3 rounded-2xl border border-rose-900/40 bg-rose-950/20 p-4 backdrop-blur-md transition-all hover:border-rose-800/50">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-rose-300/80">Overdue</p>
          <span className="text-xl font-bold text-rose-400">{overdue}</span>
        </div>
      </div>

      {/* Completion Progress Bar Card */}
      <div className="col-span-2 hidden flex-col justify-center rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-4 backdrop-blur-md sm:col-span-4 lg:col-span-1 lg:flex">
        <div className="flex items-center justify-between pb-1 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-indigo-300">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> Goal Rate
          </span>
          <span className="font-bold text-indigo-300">{completionPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
