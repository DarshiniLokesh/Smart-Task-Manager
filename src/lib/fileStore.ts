import fs from 'fs';
import path from 'path';
import { ITask } from '@/types/task';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'tasks.json');

const initialSeedTasks: ITask[] = [
  {
    _id: "task-1",
    title: "Launch Smart Task Manager MVP",
    description: "Finalize Next.js App Router codebase, wire up dnd-kit Kanban board, and deploy to production.",
    priority: "urgent",
    status: "in_progress",
    dueDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    tags: ["nextjs", "production", "fullstack"],
    subtasks: [
      { id: "sub-1", title: "Setup Next.js 14 App Router & TypeScript", completed: true },
      { id: "sub-2", title: "Build MongoDB & Mongoose schemas", completed: true },
      { id: "sub-3", title: "Implement dnd-kit Kanban drag and drop", completed: true },
      { id: "sub-4", title: "Integrate OpenAI task breakdown API", completed: true },
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
      { id: "sub-21", title: "Glassmorphic modal dialogs", completed: true },
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
      { id: "sub-30", title: "Configure OpenAI client and prompt template", completed: true },
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
    dueDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    tags: ["inngest", "background-jobs"],
    subtasks: [
      { id: "sub-40", title: "Create Inngest client and serve handler", completed: true },
      { id: "sub-41", title: "Define cron function for overdue tasks", completed: true },
    ],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "task-5",
    title: "Write Comprehensive Documentation & Deployment Guide",
    description: "Provide clear setup instructions, environment variable descriptions, and Vercel deployment guide.",
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

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(initialSeedTasks, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing data file:', err);
  }
}

export function getFileTasks(): ITask[] {
  ensureDataFile();
  try {
    const content = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(content) as ITask[];
  } catch (err) {
    console.error('Error reading tasks file:', err);
    return initialSeedTasks;
  }
}

export function saveFileTasks(tasks: ITask[]): void {
  ensureDataFile();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving tasks to file:', err);
  }
}

export function addFileTask(taskData: Omit<ITask, '_id' | 'createdAt' | 'updatedAt'>): ITask {
  const tasks = getFileTasks();
  const newTask: ITask = {
    ...taskData,
    _id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.unshift(newTask);
  saveFileTasks(tasks);
  return newTask;
}

export function updateFileTask(id: string, updates: Partial<ITask>): ITask | null {
  const tasks = getFileTasks();
  const index = tasks.findIndex((t) => t._id === id);
  if (index === -1) return null;
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveFileTasks(tasks);
  return tasks[index];
}

export function deleteFileTask(id: string): boolean {
  const tasks = getFileTasks();
  const index = tasks.findIndex((t) => t._id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  saveFileTasks(tasks);
  return true;
}
