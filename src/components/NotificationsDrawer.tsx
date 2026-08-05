'use client';

import React from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { formatDueDate, priorityConfig } from '@/lib/utils';
import { Bell, X, AlertTriangle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const NotificationsDrawer: React.FC = () => {
  const {
    isNotificationsOpen,
    toggleNotificationsDrawer,
    notifications,
    openEditModal,
    updateTask,
  } = useTaskStore();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={toggleNotificationsDrawer}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl animate-slide-in-right flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Notifications Center</h3>
                <p className="text-xs text-slate-400">
                  {notifications.total} alert{notifications.total === 1 ? '' : 's'} for overdue or due-soon tasks
                </p>
              </div>
            </div>
            <button
              onClick={toggleNotificationsDrawer}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Overdue Section */}
            {notifications.overdue.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  Overdue Tasks ({notifications.overdue.length})
                </h4>

                <div className="space-y-2.5">
                  {notifications.overdue.map((task) => {
                    const priorityMeta = priorityConfig[task.priority] || priorityConfig.medium;
                    const dueMeta = formatDueDate(task.dueDate);

                    return (
                      <div
                        key={task._id}
                        className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-3.5 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-white">{task.title}</h5>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityMeta.bg} ${priorityMeta.text}`}
                          >
                            {priorityMeta.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-rose-300">
                          <span>{dueMeta.text}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                updateTask(task._id, { status: 'done' });
                              }}
                              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Mark Done
                            </button>
                            <button
                              onClick={() => {
                                toggleNotificationsDrawer();
                                openEditModal(task);
                              }}
                              className="text-slate-300 hover:text-white font-semibold flex items-center gap-1"
                            >
                              Edit <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Due Soon Section */}
            {notifications.dueSoon.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Due Within 24 Hours ({notifications.dueSoon.length})
                </h4>

                <div className="space-y-2.5">
                  {notifications.dueSoon.map((task) => {
                    const priorityMeta = priorityConfig[task.priority] || priorityConfig.medium;
                    const dueMeta = formatDueDate(task.dueDate);

                    return (
                      <div
                        key={task._id}
                        className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-3.5 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-white">{task.title}</h5>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityMeta.bg} ${priorityMeta.text}`}
                          >
                            {priorityMeta.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-amber-300">
                          <span>{dueMeta.text}</span>
                          <button
                            onClick={() => {
                              toggleNotificationsDrawer();
                              openEditModal(task);
                            }}
                            className="text-slate-300 hover:text-white font-semibold flex items-center gap-1"
                          >
                            View <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {notifications.total === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
                <p className="text-sm font-semibold text-white">All Clear!</p>
                <p className="text-xs text-slate-400 mt-1">
                  No overdue tasks or urgent deadlines upcoming.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
