import { inngest } from "./client";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";

export const checkTaskDueDates = inngest.createFunction(
  { id: "check-task-due-dates", name: "Scheduled Task Due Date Check" },
  [
    { cron: "0 * * * *" }, // Run every hour
    { event: "task/check-due-dates" }
  ],
  async ({ step }) => {
    // Step 1: Connect to database
    const dbConnected = await step.run("connect-db", async () => {
      const conn = await connectToDatabase();
      return !!conn;
    });

    if (!dbConnected) {
      return { status: "skipped", reason: "Database not connected" };
    }

    // Step 2: Query overdue and due-soon tasks
    const notifications = await step.run("query-due-tasks", async () => {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const tasks = await Task.find({
        status: { $ne: "done" },
        dueDate: { $ne: null, $lte: next24Hours },
      }).lean();

      const overdueCount = tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now
      ).length;
      const dueSoonCount = tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) >= now
      ).length;

      return {
        timestamp: new Date().toISOString(),
        totalFlaggedTasks: tasks.length,
        overdueCount,
        dueSoonCount,
        taskIds: tasks.map((t) => t._id.toString()),
      };
    });

    return { status: "success", summary: notifications };
  }
);

export const functions = [checkTaskDueDates];
