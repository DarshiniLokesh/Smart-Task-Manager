import { ITask } from '@/types/task';

// Initial sample seed data for fallback in-memory mode when MongoDB is not connected
export let memoryTasks: ITask[] = [
  {
    _id: "task-1",
    title: "Launch Smart Task Manager MVP",
    description: "Finalize Next.js App Router codebase, wire up dnd-kit Kanban board, and deploy to Vercel.",
    priority: "urgent",
    status: "in_progress",
    dueDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    tags: ["nextjs", "production", "fullstack"],
    subtasks: [
      { id: "sub-1", title: "Setup Next.js 14 App Router & TypeScript", completed: true },
      { id: "sub-2", title: "Build MongoDB & Mongoose schemas", completed: true },
      { id: "sub-3", title: "Implement dnd-kit Kanban drag and drop", completed: false },
      { id: "sub-4", title: "Integrate OpenAI task breakdown API", completed: false },
    ],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "task-2",
    title: "Design Responsive UI with Glassmorphic Aesthetic",
    description: "Create sleek dark mode CSS design tokens, custom cards, animated priority badges, and floating modals.",
    priority: "high",
    status: "in_progress",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["design", "css", "tailwind"],
    subtasks: [
      { id: "sub-20", title: "Tailwind custom color tokens setup", completed: true },
      { id: "sub-21", title: "Glassmorphic modal dialogs", completed: false },
    ],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "task-3",
    title: "Implement OpenAI AI Task Prioritizer",
    description: "Analyze due dates, priority weight, and age using GPT-4o-mini with fallback heuristic algorithm.",
    priority: "high",
    status: "todo",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["ai", "openai", "backend"],
    subtasks: [
      { id: "sub-30", title: "Configure OpenAI client and prompt template", completed: false },
      { id: "sub-31", title: "Write fallback heuristic scoring rule", completed: true },
    ],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "task-4",
    title: "Configure Inngest Background Job Scanner",
    description: "Set up Inngest scheduled functions for automated task due-date notifications.",
    priority: "medium",
    status: "todo",
    dueDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // Overdue
    tags: ["inngest", "background-jobs"],
    subtasks: [
      { id: "sub-40", title: "Create Inngest client and serve handler", completed: true },
      { id: "sub-41", title: "Define cron function for overdue tasks", completed: false },
    ],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "task-5",
    title: "Write Comprehensive Documentation & Seed Script",
    description: "Provide clear setup instructions, environment variable descriptions, and sample data seed command.",
    priority: "low",
    status: "done",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["documentation", "readme"],
    subtasks: [
      { id: "sub-50", title: "Write README.md file", completed: true },
      { id: "sub-51", title: "Create scripts/seed.ts script", completed: true },
    ],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function addMemoryTask(taskData: Omit<ITask, '_id' | 'createdAt' | 'updatedAt'>): ITask {
  const newTask: ITask = {
    ...taskData,
    _id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryTasks.unshift(newTask);
  return newTask;
}

export function updateMemoryTask(id: string, updates: Partial<ITask>): ITask | null {
  const index = memoryTasks.findIndex((t) => t._id === id);
  if (index === -1) return null;
  memoryTasks[index] = {
    ...memoryTasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return memoryTasks[index];
}

export function deleteMemoryTask(id: string): boolean {
  const index = memoryTasks.findIndex((t) => t._id === id);
  if (index === -1) return false;
  memoryTasks.splice(index, 1);
  return true;
}

export function replaceMemoryTasks(newTasks: ITask[]) {
  memoryTasks = newTasks;
}
