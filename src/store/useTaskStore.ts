import { create } from 'zustand';
import {
  ITask,
  Priority,
  Status,
  CreateTaskInput,
  UpdateTaskInput,
  ReorderItem,
  AiBreakdownResponse,
  AiPrioritizeResponse,
} from '@/types/task';

interface NotificationState {
  overdue: ITask[];
  dueSoon: ITask[];
  total: number;
}

interface TaskStore {
  // Data State
  tasks: ITask[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Filter & Search State
  searchQuery: string;
  selectedPriority: Priority | 'all';
  selectedTag: string | 'all';

  // Modals & Drawers State
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  activeEditingTask: ITask | null;
  isAiBreakdownOpen: boolean;
  activeBreakdownTask: ITask | null;
  isAiPrioritizeOpen: boolean;
  prioritizeData: AiPrioritizeResponse | null;
  isPrioritizingLoading: boolean;
  isNotificationsOpen: boolean;
  notifications: NotificationState;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: Priority | 'all') => void;
  setSelectedTag: (tag: string | 'all') => void;

  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (task: ITask) => void;
  closeEditModal: () => void;
  openAiBreakdownModal: (task?: ITask) => void;
  closeAiBreakdownModal: () => void;
  openAiPrioritizeModal: () => void;
  closeAiPrioritizeModal: () => void;
  toggleNotificationsDrawer: () => void;

  // API & State Mutations
  fetchTasks: () => Promise<void>;
  addTask: (input: CreateTaskInput) => Promise<ITask | null>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<ITask | null>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  moveTaskOptimistically: (taskId: string, targetStatus: Status, targetIndex: number) => void;
  syncReorder: (items: ReorderItem[]) => Promise<void>;

  // AI Actions
  requestAiBreakdown: (title: string, description?: string) => Promise<AiBreakdownResponse | null>;
  requestAiPrioritization: () => Promise<AiPrioritizeResponse | null>;
  fetchNotifications: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  isSyncing: false,
  error: null,

  searchQuery: '',
  selectedPriority: 'all',
  selectedTag: 'all',

  isCreateModalOpen: false,
  isEditModalOpen: false,
  activeEditingTask: null,
  isAiBreakdownOpen: false,
  activeBreakdownTask: null,
  isAiPrioritizeOpen: false,
  prioritizeData: null,
  isPrioritizingLoading: false,
  isNotificationsOpen: false,
  notifications: { overdue: [], dueSoon: [], total: 0 },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedPriority: (selectedPriority) => set({ selectedPriority }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openEditModal: (task) => set({ isEditModalOpen: true, activeEditingTask: task }),
  closeEditModal: () => set({ isEditModalOpen: false, activeEditingTask: null }),
  openAiBreakdownModal: (task) => set({ isAiBreakdownOpen: true, activeBreakdownTask: task || null }),
  closeAiBreakdownModal: () => set({ isAiBreakdownOpen: false, activeBreakdownTask: null }),
  openAiPrioritizeModal: () => {
    set({ isAiPrioritizeOpen: true });
    get().requestAiPrioritization();
  },
  closeAiPrioritizeModal: () => set({ isAiPrioritizeOpen: false }),
  toggleNotificationsDrawer: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      if (json.success) {
        set({ tasks: json.tasks, isLoading: false });
        get().fetchNotifications();
      } else {
        set({ error: json.error || 'Failed to load tasks', isLoading: false });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching tasks';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addTask: async (input) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (json.success) {
        const newTask: ITask = json.task;
        // Immediate optimistic addition to UI
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        // Full database sync
        await get().fetchTasks();
        return newTask;
      }
      return null;
    } catch (err) {
      console.error('Failed to add task:', err);
      return null;
    }
  },

  updateTask: async (id, input) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (json.success) {
        const updatedTask: ITask = json.task;
        set((state) => ({
          tasks: state.tasks.map((t) => (t._id === id ? updatedTask : t)),
        }));
        await get().fetchTasks();
        return updatedTask;
      }
      return null;
    } catch (err) {
      console.error('Failed to update task:', err);
      return null;
    }
  },

  deleteTask: async (id) => {
    try {
      // Optimistic update
      set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));

      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        await get().fetchTasks();
        return true;
      } else {
        // Revert on error
        await get().fetchTasks();
        return false;
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      await get().fetchTasks();
      return false;
    }
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const targetTask = get().tasks.find((t) => t._id === taskId);
    if (!targetTask) return;

    const updatedSubtasks = targetTask.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    // Optimistic UI update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === taskId ? { ...t, subtasks: updatedSubtasks } : t
      ),
    }));

    await get().updateTask(taskId, { subtasks: updatedSubtasks });
  },

  moveTaskOptimistically: (taskId, targetStatus, targetIndex) => {
    const currentTasks = [...get().tasks];
    const taskIndex = currentTasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) return;

    const task = { ...currentTasks[taskIndex], status: targetStatus };

    // Remove task from old position
    currentTasks.splice(taskIndex, 1);

    // Filter tasks in target column
    const columnTasks = currentTasks.filter((t) => t.status === targetStatus);
    const otherTasks = currentTasks.filter((t) => t.status !== targetStatus);

    // Insert task at targetIndex
    const safeIndex = Math.max(0, Math.min(targetIndex, columnTasks.length));
    columnTasks.splice(safeIndex, 0, task);

    // Re-index column tasks
    const reindexedColumnTasks = columnTasks.map((t, idx) => ({ ...t, order: idx }));

    const newTasks = [...otherTasks, ...reindexedColumnTasks];
    set({ tasks: newTasks });

    // Prepare sync payload
    const reorderPayload: ReorderItem[] = reindexedColumnTasks.map((t) => ({
      id: t._id,
      status: t.status,
      order: t.order,
    }));

    get().syncReorder(reorderPayload);
  },

  syncReorder: async (items) => {
    set({ isSyncing: true });
    try {
      await fetch('/api/tasks/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
    } catch (err) {
      console.error('Failed to sync task order:', err);
    } finally {
      set({ isSyncing: false });
    }
  },

  requestAiBreakdown: async (title, description) => {
    try {
      const res = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const json = await res.json();
      if (json.success) {
        return json.data as AiBreakdownResponse;
      }
      return null;
    } catch (err) {
      console.error('Failed to generate AI breakdown:', err);
      return null;
    }
  },

  requestAiPrioritization: async () => {
    set({ isPrioritizingLoading: true });
    try {
      const res = await fetch('/api/ai/prioritize', {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        set({ prioritizeData: json.data, isPrioritizingLoading: false });
        return json.data as AiPrioritizeResponse;
      }
      set({ isPrioritizingLoading: false });
      return null;
    } catch (err) {
      console.error('Failed to request AI prioritization:', err);
      set({ isPrioritizingLoading: false });
      return null;
    }
  },

  fetchNotifications: async () => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success) {
        set({
          notifications: {
            overdue: json.data.overdue || [],
            dueSoon: json.data.dueSoon || [],
            total: json.data.total || 0,
          },
        });
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  },
}));
