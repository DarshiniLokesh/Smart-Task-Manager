'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Priority, Status, Subtask } from '@/types/task';
import { X, Plus, Trash2, Calendar, Clock, Tag, AlertCircle, Check, Sparkles, RefreshCw } from 'lucide-react';

type DatePreset = 'none' | 'today' | 'tomorrow' | 'in_2_days' | 'in_3_days' | 'in_1_week' | 'custom';

export const TaskModal: React.FC = () => {
  const {
    isCreateModalOpen,
    isEditModalOpen,
    activeEditingTask,
    closeCreateModal,
    closeEditModal,
    addTask,
    updateTask,
    requestAiBreakdown,
  } = useTaskStore();

  const isOpen = isCreateModalOpen || isEditModalOpen;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');

  // Dropdown Due Date & Time States
  const [datePreset, setDatePreset] = useState<DatePreset>('tomorrow');
  const [customDate, setCustomDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('17:00');

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiGeneratingSubtasks, setIsAiGeneratingSubtasks] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to format date object to YYYY-MM-DD
  const formatDateToYYYYMMDD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isEditModalOpen && activeEditingTask) {
      setTitle(activeEditingTask.title || '');
      setDescription(activeEditingTask.description || '');
      setPriority(activeEditingTask.priority || 'medium');
      setStatus(activeEditingTask.status || 'todo');

      if (activeEditingTask.dueDate) {
        const d = new Date(activeEditingTask.dueDate);
        const yyyymmdd = formatDateToYYYYMMDD(d);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        setDatePreset('custom');
        setCustomDate(yyyymmdd);
        setSelectedTime(`${hours}:${minutes}`);
      } else {
        setDatePreset('none');
        setCustomDate('');
        setSelectedTime('17:00');
      }

      setTags(activeEditingTask.tags || []);
      setSubtasks(activeEditingTask.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setDatePreset('tomorrow');
      setCustomDate(formatDateToYYYYMMDD(new Date(Date.now() + 24 * 60 * 60 * 1000)));
      setSelectedTime('17:00');
      setTags([]);
      setSubtasks([]);
    }
    setErrorMsg('');
  }, [isEditModalOpen, isCreateModalOpen, activeEditingTask]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSub: Subtask = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      };
      setSubtasks([...subtasks, newSub]);
      setNewSubtaskTitle('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleAutoGenerateAiSubtasks = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a task title first to auto-generate subtasks.');
      return;
    }
    setErrorMsg('');
    setIsAiGeneratingSubtasks(true);

    const result = await requestAiBreakdown(title.trim(), description.trim());
    if (result && Array.isArray(result.subtasks) && result.subtasks.length > 0) {
      const generated: Subtask[] = result.subtasks.map((stTitle, idx) => ({
        id: `sub-ai-auto-${Date.now()}-${idx}`,
        title: stTitle,
        completed: false,
      }));
      setSubtasks([...subtasks, ...generated]);

      if (result.suggestedTags && result.suggestedTags.length > 0) {
        const combined = Array.from(new Set([...tags, ...result.suggestedTags]));
        setTags(combined);
      }
      if (result.suggestedPriority) {
        setPriority(result.suggestedPriority);
      }
    }
    setIsAiGeneratingSubtasks(false);
  };

  const getComputedTargetDateStr = (): string => {
    if (datePreset === 'none') return '';
    const now = new Date();
    if (datePreset === 'today') return formatDateToYYYYMMDD(now);
    if (datePreset === 'tomorrow') return formatDateToYYYYMMDD(new Date(now.getTime() + 24 * 60 * 60 * 1000));
    if (datePreset === 'in_2_days') return formatDateToYYYYMMDD(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000));
    if (datePreset === 'in_3_days') return formatDateToYYYYMMDD(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000));
    if (datePreset === 'in_1_week') return formatDateToYYYYMMDD(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
    if (datePreset === 'custom') return customDate || formatDateToYYYYMMDD(now);
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Task title is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    let formattedDueDate: string | undefined = undefined;
    const targetDateStr = getComputedTargetDateStr();

    if (targetDateStr) {
      const dateTimeString = `${targetDateStr}T${selectedTime}:00`;
      const dateObj = new Date(dateTimeString);
      if (!isNaN(dateObj.getTime())) {
        formattedDueDate = dateObj.toISOString();
      }
    }

    if (isEditModalOpen && activeEditingTask) {
      await updateTask(activeEditingTask._id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: formattedDueDate,
        tags,
        subtasks,
      });
      closeEditModal();
    } else {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: formattedDueDate,
        tags,
        subtasks,
      });
      closeCreateModal();
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isEditModalOpen) closeEditModal();
    else closeCreateModal();
  };

  const targetDateStr = getComputedTargetDateStr();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {isEditModalOpen ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 pb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Design authentication API schema"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 pb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add key requirements, instructions, or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none"
            />
          </div>

          {/* Priority & Status Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 pb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 pb-1.5">
                Status Column
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Structured Dropdown Due Date & Time Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-400" />
              Due Date & Time (Dropdown Selectors)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date Preset Dropdown */}
              <div>
                <label className="block text-[11px] text-slate-400 pb-1">Date Option</label>
                <select
                  value={datePreset}
                  onChange={(e) => {
                    const preset = e.target.value as DatePreset;
                    setDatePreset(preset);
                    if (preset === 'custom' && !customDate) {
                      setCustomDate(formatDateToYYYYMMDD(new Date()));
                    }
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                >
                  <option value="tomorrow">Tomorrow</option>
                  <option value="today">Today</option>
                  <option value="in_2_days">In 2 Days</option>
                  <option value="in_3_days">In 3 Days</option>
                  <option value="in_1_week">In 1 Week</option>
                  <option value="custom">Specific Custom Date...</option>
                  <option value="none">No Due Date</option>
                </select>
              </div>

              {/* Time Slot Dropdown */}
              {datePreset !== 'none' && (
                <div>
                  <label className="block text-[11px] text-slate-400 pb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-indigo-400" /> Time Slot
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                  >
                    <option value="09:00">09:00 AM (Morning)</option>
                    <option value="12:00">12:00 PM (Noon)</option>
                    <option value="14:00">02:00 PM (Afternoon)</option>
                    <option value="17:00">05:00 PM (End of Workday)</option>
                    <option value="20:00">08:00 PM (Evening)</option>
                    <option value="23:59">11:59 PM (End of Day)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Custom Date Input when 'custom' is picked */}
            {datePreset === 'custom' && (
              <div className="pt-1">
                <label className="block text-[11px] text-slate-400 pb-1">Select Custom Date</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            )}

            {/* Active Selection Summary Badge */}
            {datePreset !== 'none' && targetDateStr && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-xs text-blue-300">
                <span className="font-semibold">Selected Due Date:</span>
                <span>
                  {targetDateStr} at {selectedTime}
                </span>
              </div>
            )}
          </div>

          {/* Tags Manager */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 pb-1.5 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-purple-400" />
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag (e.g. backend)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300 border border-slate-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks Builder with One-Click AI Auto-Generate Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Subtasks Checklist
              </label>

              {/* One-Click AI Auto Generate Subtasks Button */}
              <button
                type="button"
                onClick={handleAutoGenerateAiSubtasks}
                disabled={isAiGeneratingSubtasks || !title.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 px-3 py-1 text-xs font-bold text-purple-300 shadow-md shadow-purple-950/50 hover:bg-purple-900/50 hover:text-white transition disabled:opacity-40"
              >
                {isAiGeneratingSubtasks ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-300" />
                    <span>AI Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>✨ Auto-Generate AI Subtasks</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-2 pb-1">
              <input
                type="text"
                placeholder="Add a subtask step manually..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs"
                  >
                    <span className="text-slate-300">{sub.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:opacity-95 transition disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : isEditModalOpen ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
