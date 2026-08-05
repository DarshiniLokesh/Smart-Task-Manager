'use client';

import React from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Priority } from '@/types/task';
import { Search, Tag, X, Filter } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    selectedTag,
    setSelectedTag,
  } = useTaskStore();

  // Extract unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || []))).sort();

  const priorities: { key: Priority | 'all'; label: string }[] = [
    { key: 'all', label: 'All Priorities' },
    { key: 'urgent', label: 'Urgent' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low' },
  ];

  const hasActiveFilters = searchQuery !== '' || selectedPriority !== 'all' || selectedTag !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPriority('all');
    setSelectedTag('all');
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3.5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search tasks by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters Group */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Priority Filter */}
        <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/60 p-1">
          {priorities.map((p) => {
            const isActive = selectedPriority === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setSelectedPriority(p.key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Tag Selector */}
        {allTags.length > 0 && (
          <div className="relative">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="appearance-none rounded-xl border border-slate-800 bg-slate-950/60 pl-8 pr-8 py-2 text-xs font-medium text-slate-300 focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="all">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
            <Tag className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Filter className="absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
