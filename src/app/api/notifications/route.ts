import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Task from '@/models/Task';
import { getFileTasks } from '@/lib/fileStore';
import { ITask } from '@/types/task';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let flaggedTasks: ITask[] = [];

    if (db) {
      const dbTasks = await Task.find({
        status: { $ne: 'done' },
        dueDate: { $ne: null, $lte: next24h },
      })
        .sort({ dueDate: 1 })
        .lean();

      flaggedTasks = dbTasks.map((t) => ({
        _id: t._id.toString(),
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
        tags: t.tags || [],
        subtasks: t.subtasks || [],
        order: t.order || 0,
        createdAt: t.createdAt ? t.createdAt.toISOString() : undefined,
        updatedAt: t.updatedAt ? t.updatedAt.toISOString() : undefined,
      }));
    } else {
      flaggedTasks = getFileTasks().filter((t) => {
        if (t.status === 'done' || !t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due <= next24h;
      });
    }

    const overdue = flaggedTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now);
    const dueSoon = flaggedTasks.filter((t) => t.dueDate && new Date(t.dueDate) >= now);

    return NextResponse.json({
      success: true,
      data: {
        total: flaggedTasks.length,
        overdueCount: overdue.length,
        dueSoonCount: dueSoon.length,
        overdue,
        dueSoon,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task notifications' },
      { status: 500 }
    );
  }
}
