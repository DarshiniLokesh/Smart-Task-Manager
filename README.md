# 🚀 Smart Task Manager (Full-Stack Web Application)

A modern, production-grade **Smart Task Manager** web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB + Mongoose**, **dnd-kit**, **Zustand**, **OpenAI API**, and **Inngest**.

---

## 🌟 Key Features

### 1. 📋 Create & Manage Tasks (Full CRUD)
- Create, view, update, and delete tasks with **title**, **description**, **priority**, **due date**, **status**, **tags**, and **subtasks**.
- Typed API routes backed by **Mongoose schemas** and validated with **Zod**.
- **100% Persistent Persistence**: Dual persistence layer via MongoDB Mongoose & disk storage (`data/tasks.json`) so created tasks **never disappear on page reload**!

### 2. 🎯 Dropdown Due Dates & Times
- **Date Option Dropdown**: `Tomorrow`, `Today`, `In 2 Days`, `In 3 Days`, `In 1 Week`, `Custom Date...`, `No Due Date`.
- **Time Slot Dropdown**: `09:00 AM`, `12:00 PM`, `02:00 PM`, `05:00 PM`, `08:00 PM`, `11:59 PM`.
- **Visual Overdue Indicators**: Pulsing warning icons for overdue tasks and yellow highlights for upcoming deadlines within 24 hours.

### 3. 📊 Kanban Board View (dnd-kit + Zustand)
- Drag-and-drop between columns (**To Do**, **In Progress**, **Done**) using `@dnd-kit/core` and `@dnd-kit/sortable`.
- **Optimistic UI Updates**: State updates instantly via Zustand, then asynchronously syncs to database via `/api/tasks/reorder`.

### 4. 🤖 Automatic AI Task Breakdown
- **1-Click AI Auto-Generate**: Inside the task creation/editing form (`TaskModal`), click **✨ Auto-Generate AI Subtasks** to instantly generate 4-6 subtasks with suggested tags and priority using OpenAI (`gpt-4o-mini`).
- **Auto-Triggering AI Breakdown Modal**: Opening the AI breakdown modal on any task card automatically calls the AI decomposition engine immediately.

### 5. 🧠 AI Task Prioritization Suggestions
- Evaluates active tasks considering due dates, priority weight, progress momentum, and task age.
- Uses OpenAI API / Urgency Scoring Algorithm to recommend top focus areas with clear **single-sentence rationale** per suggestion.

### 6. 🔔 Notifications & Inngest Background Jobs
- **Real-Time Notification Drawer**: Header bell alert panel displaying overdue and upcoming tasks with quick actions.
- **Inngest Background Job**: Scheduled hourly cron function (`checkTaskDueDates`) scanning tasks and triggering notification events.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React Icons |
| **Backend** | Next.js API Route Handlers (`src/app/api/...`), TypeScript |
| **Database** | MongoDB with Mongoose + Persistent disk store fallback (`data/tasks.json`) |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| **State Management** | Zustand (`useTaskStore`) with optimistic UI state |
| **AI Integration** | OpenAI API (`openai` package) with fallback heuristic scoring |
| **Background Jobs** | Inngest (`inngest` package + `/api/inngest` handler) |
| **Input Validation** | Zod schemas |

---

## 🌐 How to Deploy to Production (Vercel / Render)

### Deploying to Vercel (Recommended 1-Click Setup)

1. **Create a Free MongoDB Atlas Database**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
   - Click **Connect** -> **Drivers** and copy your connection string:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart-task-manager?retryWrites=true&w=majority`

2. **Push Project to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Deploy Smart Task Manager"
   git remote add origin https://github.com/your-username/smart-task-manager.git
   git push -u origin main
   ```

3. **Deploy on Vercel**:
   - Import your GitHub repository on [Vercel](https://vercel.com/new).
   - In **Environment Variables**, add:
     - `MONGODB_URI` = `your_mongodb_atlas_connection_string`
     - `OPENAI_API_KEY` = `your_openai_api_key`
   - Click **Deploy**!

---

## ⚡ Quick Start Guide (Local Execution)

```bash
# 1. Install dependencies
npm install

# 2. Seed sample data
npm run seed

# 3. Start local development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!
