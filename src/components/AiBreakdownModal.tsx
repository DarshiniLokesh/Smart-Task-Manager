'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Priority, Subtask } from '@/types/task';
import { Sparkles, X, Plus, Trash2, Check, ArrowRight, Wand2, RefreshCw } from 'lucide-react';

export const AiBreakdownModal: React.FC = () => {
  const {
    isAiBreakdownOpen,
    activeBreakdownTask,
    closeAiBreakdownModal,
    requestAiBreakdown,
    addTask,
    updateTask,
  } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestedPriority, setSuggestedPriority] = useState<Priority>('medium');
  const [isSuccess, setIsSuccess] = useState(false);

  const runBreakdown = async (targetTitle: string, targetDesc?: string) => {
    if (!targetTitle.trim()) return;
    setIsGenerating(true);
    setIsSuccess(false);

    const result = await requestAiBreakdown(targetTitle.trim(), targetDesc?.trim());
    if (result) {
      setGeneratedSubtasks(result.subtasks || []);
      setSuggestedTags(result.suggestedTags || []);
      if (result.suggestedPriority) setSuggestedPriority(result.suggestedPriority);
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (isAiBreakdownOpen) {
      if (activeBreakdownTask) {
        setTitle(activeBreakdownTask.title);
        setDescription(activeBreakdownTask.description || '');
        setGeneratedSubtasks([]);
        setSuggestedTags([]);
        setIsSuccess(false);
        // Automatically generate AI subtasks immediately upon opening for existing task!
        runBreakdown(activeBreakdownTask.title, activeBreakdownTask.description);
      } else {
        setTitle('');
        setDescription('');
        setGeneratedSubtasks([]);
        setSuggestedTags([]);
        setIsSuccess(false);
      }
    }
  }, [activeBreakdownTask, isAiBreakdownOpen]);

  if (!isAiBreakdownOpen) return null;

  const handleManualGenerate = () => {
    runBreakdown(title, description);
  };

  const handleSubtaskTextChange = (index: number, newText: string) => {
    const updated = [...generatedSubtasks];
    updated[index] = newText;
    setGeneratedSubtasks(updated);
  };

  const handleRemoveSubtask = (index: number) => {
    setGeneratedSubtasks(generatedSubtasks.filter((_, idx) => idx !== index));
  };

  const handleAddSubtaskItem = () => {
    setGeneratedSubtasks([...generatedSubtasks, 'New actionable step']);
  };

  const handleAcceptAndApply = async () => {
    if (generatedSubtasks.length === 0) return;

    const formattedSubtasks: Subtask[] = generatedSubtasks.map((st, idx) => ({
      id: `sub-ai-${Date.now()}-${idx}`,
      title: st,
      completed: false,
    }));

    if (activeBreakdownTask) {
      // Append subtasks to existing task
      const combinedSubtasks = [...(activeBreakdownTask.subtasks || []), ...formattedSubtasks];
      const combinedTags = Array.from(
        new Set([...(activeBreakdownTask.tags || []), ...suggestedTags])
      );

      await updateTask(activeBreakdownTask._id, {
        subtasks: combinedSubtasks,
        tags: combinedTags,
      });
    } else {
      // Create new task with AI subtasks
      await addTask({
        title: title.trim(),
        description: description.trim(),
        priority: suggestedPriority,
        status: 'todo',
        tags: suggestedTags,
        subtasks: formattedSubtasks,
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      closeAiBreakdownModal();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-purple-500/30 bg-slate-900 shadow-2xl my-8 overflow-hidden">
        {/* Glowing Top Banner */}
        <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-blue-900/60 p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  AI Task Breakdown
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </h2>
                <p className="text-xs text-purple-200/80">
                  Automatically decomposing goals into clear, actionable execution steps
                </p>
              </div>
            </div>
            <button
              onClick={closeAiBreakdownModal}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Goal Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 pb-1.5">
              High-Level Task or Goal
            </label>
            <input
              type="text"
              placeholder="e.g. Launch new marketing campaign & landing page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 pb-1.5">
              Context or Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add key context to guide AI decomposition..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleManualGenerate}
            disabled={isGenerating || !title.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/25 hover:opacity-95 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-purple-200" />
                AI generating subtasks...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-purple-200" />
                Regenerate AI Subtasks
              </>
            )}
          </button>

          {/* Generated Subtasks Checklist */}
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2 rounded-2xl border border-purple-900/40 bg-purple-950/20">
              <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
              <p className="text-xs font-medium text-purple-300">
                OpenAI is analyzing "{title}" and generating subtasks...
              </p>
            </div>
          ) : (
            generatedSubtasks.length > 0 && (
              <div className="mt-4 rounded-2xl border border-purple-500/30 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-purple-400" />
                    AI Generated Steps ({generatedSubtasks.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSubtaskItem}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add step
                  </button>
                </div>

                {/* Editable List of Subtasks */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {generatedSubtasks.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-950 text-[10px] font-bold text-purple-400 border border-purple-800">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={st}
                        onChange={(e) => handleSubtaskTextChange(idx, e.target.value)}
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Suggested Tags */}
                {suggestedTags.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400">Suggested Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {suggestedTags.map((tag) => (
                        <span key={tag} className="rounded-md bg-purple-950/60 px-2 py-0.5 text-[10px] text-purple-300 border border-purple-800/40">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Action Footer */}
          {generatedSubtasks.length > 0 && !isGenerating && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                {activeBreakdownTask ? 'Append to task checklist' : 'Create as new task'}
              </span>
              <button
                type="button"
                onClick={handleAcceptAndApply}
                disabled={isSuccess}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition"
              >
                {isSuccess ? (
                  <>
                    <Check className="h-4 w-4" /> Applied Successfully!
                  </>
                ) : (
                  <>
                    <span>Accept & Save Tasks</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
