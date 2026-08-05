'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ITask } from '@/types/task';
import { useTaskStore } from '@/store/useTaskStore';
import { formatDueDate, priorityConfig } from '@/lib/utils';
import {
  GripVertical,
  Calendar,
  CheckSquare,
  Sparkles,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';

interface TaskCardProps {
  task: ITask;
  isOverlay?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay = false }) => {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const {
    openEditModal,
    deleteTask,
    toggleSubtask,
    openAiBreakdownModal,
  } = useTaskStore();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityMeta = priorityConfig[task.priority] || priorityConfig.medium;
  const dueDateMeta = formatDueDate(task.dueDate);

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col rounded-2xl border bg-slate-900/90 p-4 shadow-lg backdrop-blur-md transition-all duration-200 ${
        isOverlay
          ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105 z-50'
          : dueDateMeta.isOverdue && task.status !== 'done'
          ? 'border-rose-500/50 shadow-rose-950/20 hover:border-rose-500'
          : 'border-slate-800/90 hover:border-slate-700 hover:shadow-xl'
      }`}
    >
      {/* Top Header Row: Drag Handle, Priority Badge, Action Menu */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-slate-500 hover:text-slate-300 active:cursor-grabbing p-0.5 rounded transition"
            title="Drag task"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Priority Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${priorityMeta.bg} ${priorityMeta.text} ${priorityMeta.border}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${priorityMeta.dot}`} />
            {priorityMeta.label}
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
          {/* AI Breakdown Button */}
          <button
            onClick={() => openAiBreakdownModal(task)}
            title="Generate AI Subtasks Breakdown"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => openEditModal(task)}
            title="Edit Task"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700 hover:text-white transition"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => deleteTask(task._id)}
            title="Delete Task"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Task Title & Description */}
      <div className="space-y-1 py-1">
        <h3
          className={`text-sm font-semibold tracking-tight text-white ${
            task.status === 'done' ? 'line-through opacity-60' : ''
          }`}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Tags Row */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks Progress Bar & Toggle */}
      {totalSubtasks > 0 && (
        <div className="mt-3 rounded-xl border border-slate-800/60 bg-slate-950/40 p-2.5">
          <div
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="flex cursor-pointer items-center justify-between text-xs text-slate-300 font-medium hover:text-white transition"
          >
            <span className="flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5 text-blue-400" />
              <span>
                {completedSubtasks}/{totalSubtasks} Subtasks
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">{subtaskProgress}%</span>
              {showSubtasks ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                subtaskProgress === 100
                  ? 'bg-emerald-500'
                  : subtaskProgress > 50
                  ? 'bg-indigo-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>

          {/* Subtasks List */}
          {showSubtasks && (
            <div className="mt-2.5 space-y-1.5 border-t border-slate-800/80 pt-2">
              {task.subtasks.map((sub) => (
                <label
                  key={sub.id}
                  className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition"
                >
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => toggleSubtask(task._id, sub.id)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={sub.completed ? 'line-through text-slate-500' : ''}>
                    {sub.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card Footer: Due Date Badge */}
      {task.dueDate && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-xs">
          <div
            className={`flex items-center gap-1.5 font-medium ${
              dueDateMeta.isOverdue && task.status !== 'done'
                ? 'text-rose-400 animate-pulse'
                : dueDateMeta.isDueSoon && task.status !== 'done'
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          >
            {dueDateMeta.isOverdue && task.status !== 'done' ? (
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
            ) : (
              <Calendar className="h-3.5 w-3.5" />
            )}
            <span>{dueDateMeta.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
