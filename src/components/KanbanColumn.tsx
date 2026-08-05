'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ITask, Status } from '@/types/task';
import { TaskCard } from './TaskCard';
import { statusConfig } from '@/lib/utils';
import { useTaskStore } from '@/store/useTaskStore';
import { Plus, ListTodo, Clock, CheckCircle2 } from 'lucide-react';

interface KanbanColumnProps {
  status: Status;
  tasks: ITask[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const { openCreateModal } = useTaskStore();
  const config = statusConfig[status];

  const taskIds = tasks.map((t) => t._id);

  const columnIcons: Record<Status, React.ReactNode> = {
    todo: <ListTodo className="h-4 w-4 text-slate-400" />,
    in_progress: <Clock className="h-4 w-4 text-blue-400" />,
    done: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-3xl border p-4 transition-all duration-200 min-h-[500px] ${
        isOver
          ? 'border-indigo-500/80 bg-indigo-950/20 shadow-xl shadow-indigo-950/30'
          : 'border-slate-800/80 bg-slate-950/40 backdrop-blur-xl'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800">
            {columnIcons[status]}
          </div>
          <h2 className="text-base font-bold tracking-tight text-white">{config.label}</h2>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-800 px-2 text-xs font-bold text-slate-300">
            {tasks.length}
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={openCreateModal}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-white transition"
          title={`Add task to ${config.label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Task Cards List */}
      <div className="mt-4 flex-1 space-y-3">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>

        {/* Empty State Drop Placeholder */}
        {tasks.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800/60 p-4 text-center">
            <p className="text-xs font-medium text-slate-500">No tasks in {config.label}</p>
            <button
              onClick={openCreateModal}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              + Add a task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
