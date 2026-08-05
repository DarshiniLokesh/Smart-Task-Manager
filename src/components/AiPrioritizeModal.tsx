'use client';

import React from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { priorityConfig, formatDueDate } from '@/lib/utils';
import { Sparkles, X, RefreshCw, ArrowRight, Zap, Target } from 'lucide-react';

export const AiPrioritizeModal: React.FC = () => {
  const {
    isAiPrioritizeOpen,
    closeAiPrioritizeModal,
    prioritizeData,
    isPrioritizingLoading,
    requestAiPrioritization,
    openEditModal,
    tasks,
  } = useTaskStore();

  if (!isAiPrioritizeOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-indigo-500/30 bg-slate-900 shadow-2xl my-8 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900/60 p-6 border-b border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  AI Prioritization Insights
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                    GPT-4o / Heuristic Score
                  </span>
                </h2>
                <p className="text-xs text-indigo-200/80">
                  Intelligent recommendations based on due dates, priority weight, and progress momentum
                </p>
              </div>
            </div>
            <button
              onClick={closeAiPrioritizeModal}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {isPrioritizingLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
              <p className="text-sm font-medium text-slate-300">
                Analyzing active tasks & scoring urgency...
              </p>
            </div>
          ) : prioritizeData ? (
            <>
              {/* Strategic Summary Box */}
              <div className="rounded-2xl border border-indigo-900/50 bg-indigo-950/30 p-4">
                <div className="flex items-start gap-2.5">
                  <Target className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      Strategic Focus Summary
                    </h4>
                    <p className="mt-1 text-xs text-slate-200 leading-relaxed">
                      {prioritizeData.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Recommended Focus Tasks ({prioritizeData.recommendations.length})
                </h3>

                {prioritizeData.recommendations.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-400">
                    No active tasks needing priority ranking right now.
                  </div>
                ) : (
                  prioritizeData.recommendations.map((rec, index) => {
                    const fullTask = tasks.find((t) => t._id === rec.taskId);
                    const priorityMeta = priorityConfig[rec.priority] || priorityConfig.medium;
                    const dueMeta = formatDueDate(rec.dueDate);

                    return (
                      <div
                        key={rec.taskId || index}
                        className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-indigo-500/50 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {/* Rank Number */}
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-950 font-bold text-xs text-indigo-300 border border-indigo-800/50">
                              #{index + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition">
                                {rec.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${priorityMeta.bg} ${priorityMeta.text} ${priorityMeta.border}`}
                                >
                                  {priorityMeta.label}
                                </span>
                                {rec.dueDate && (
                                  <span className={`text-[10px] font-medium ${dueMeta.isOverdue ? 'text-rose-400' : 'text-slate-400'}`}>
                                    {dueMeta.text}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Urgency Score Pill */}
                          <div className="flex items-center gap-1 shrink-0 rounded-xl bg-slate-900 px-3 py-1 border border-slate-800">
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-xs font-bold text-white">
                              {rec.urgencyScore}
                            </span>
                            <span className="text-[10px] text-slate-500">/100</span>
                          </div>
                        </div>

                        {/* Recommendation Reason */}
                        <div className="mt-3 rounded-xl bg-slate-900/60 p-2.5 text-xs text-slate-300 border border-slate-800/50">
                          <span className="font-semibold text-indigo-400">Why now: </span>
                          <span>{rec.reason}</span>
                        </div>

                        {/* Quick View Button */}
                        {fullTask && (
                          <div className="mt-2.5 flex justify-end">
                            <button
                              onClick={() => {
                                closeAiPrioritizeModal();
                                openEditModal(fullTask);
                              }}
                              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                            >
                              <span>View & Edit Task</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Click refresh to analyze active tasks.
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => requestAiPrioritization()}
              disabled={isPrioritizingLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPrioritizingLoading ? 'animate-spin' : ''}`} />
              Re-analyze Tasks
            </button>
            <button
              onClick={closeAiPrioritizeModal}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
