import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Task from '../src/models/Task';

// Load environment variables from .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-task-manager';

const sampleTasks = [
  {
    title: 'Design Authentication Schema & OAuth API',
    description: 'Create Mongoose user session models, JWT token rotation helper, and OAuth callback handler.',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // Due in 6 hours
    tags: ['auth', 'backend', 'security'],
    subtasks: [
      { id: 'seed-sub-1', title: 'Define User Mongoose schema', completed: true },
      { id: 'seed-sub-2', title: 'Implement JWT signing & verification helper', completed: true },
      { id: 'seed-sub-3', title: 'Create OAuth callback Next.js API route', completed: false },
    ],
    order: 0,
  },
  {
    title: 'Launch Smart Task Manager Production Build',
    description: 'Finalize Next.js App Router codebase, wire up dnd-kit Kanban board, and deploy to Vercel.',
    priority: 'urgent',
    status: 'todo',
    dueDate: new Date(Date.now() + 18 * 60 * 60 * 1000), // Due in 18 hours
    tags: ['nextjs', 'production', 'fullstack'],
    subtasks: [
      { id: 'seed-sub-10', title: 'Setup Next.js 14 App Router & TypeScript', completed: true },
      { id: 'seed-sub-11', title: 'Build MongoDB & Mongoose schemas', completed: true },
      { id: 'seed-sub-12', title: 'Implement dnd-kit Kanban drag and drop', completed: true },
      { id: 'seed-sub-13', title: 'Integrate OpenAI task breakdown API', completed: false },
    ],
    order: 0,
  },
  {
    title: 'Implement OpenAI Task Prioritizer Engine',
    description: 'Analyze due dates, priority weight, and age using GPT-4o-mini with fallback heuristic algorithm.',
    priority: 'high',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
    tags: ['ai', 'openai', 'backend'],
    subtasks: [
      { id: 'seed-sub-20', title: 'Configure OpenAI client and prompt template', completed: true },
      { id: 'seed-sub-21', title: 'Write fallback heuristic scoring rule', completed: true },
      { id: 'seed-sub-22', title: 'Create /api/ai/prioritize route handler', completed: false },
    ],
    order: 1,
  },
  {
    title: 'Audit Inngest Scheduled Due-Date Background Job',
    description: 'Ensure Inngest background job correctly queries overdue tasks and dispatches notification alerts.',
    priority: 'medium',
    status: 'todo',
    dueDate: new Date(Date.now() - 14 * 60 * 60 * 1000), // Overdue by 14 hours
    tags: ['inngest', 'background-jobs'],
    subtasks: [
      { id: 'seed-sub-30', title: 'Create Inngest client and serve route handler', completed: true },
      { id: 'seed-sub-31', title: 'Test cron schedule execution locally', completed: false },
    ],
    order: 1,
  },
  {
    title: 'Build Dark Mode Glassmorphic Visual Design System',
    description: 'Create sleek dark mode CSS design tokens, custom cards, animated priority badges, and floating modals.',
    priority: 'high',
    status: 'done',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ['design', 'css', 'tailwind'],
    subtasks: [
      { id: 'seed-sub-40', title: 'Tailwind custom color tokens setup', completed: true },
      { id: 'seed-sub-41', title: 'Glassmorphic modal dialogs', completed: true },
    ],
    order: 0,
  },
  {
    title: 'Setup MongoDB Database Connection & Cached Singleton',
    description: 'Write robust connection caching utility for Mongoose in serverless Next.js App Router environment.',
    priority: 'medium',
    status: 'done',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    tags: ['mongodb', 'database'],
    subtasks: [
      { id: 'seed-sub-50', title: 'Implement connectToDatabase in src/lib/db.ts', completed: true },
    ],
    order: 1,
  },
  {
    title: 'Refactor Zustand Board Store for Optimistic Drag Updates',
    description: 'Separate Zustand store logic cleanly from UI components with selectors and sync actions.',
    priority: 'low',
    status: 'done',
    dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    tags: ['zustand', 'state-management'],
    subtasks: [
      { id: 'seed-sub-60', title: 'Create useTaskStore with optimistic UI state', completed: true },
    ],
    order: 2,
  },
  {
    title: 'Write Comprehensive README & Project Documentation',
    description: 'Provide clear setup instructions, environment variable descriptions, and sample data seed command.',
    priority: 'medium',
    status: 'todo',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    tags: ['documentation', 'readme'],
    subtasks: [
      { id: 'seed-sub-70', title: 'Document environment variables (.env.local)', completed: true },
      { id: 'seed-sub-71', title: 'Write dev server start & seed guide', completed: false },
    ],
    order: 2,
  },
];

async function seed() {
  console.log('Connecting to MongoDB Atlas Cluster at:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully!');

    console.log('Clearing existing tasks...');
    await Task.deleteMany({});

    console.log(`Inserting ${sampleTasks.length} sample tasks...`);
    const created = await Task.insertMany(sampleTasks);

    console.log(`Successfully seeded ${created.length} tasks into MongoDB Atlas!`);
    created.forEach((t) => {
      console.log(` - [${t.status.toUpperCase()}] (${t.priority}) ${t.title}`);
    });
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

seed();
