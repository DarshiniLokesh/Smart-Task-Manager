import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Task from '@/models/Task';
import { getFileTasks } from '@/lib/fileStore';
import { generateTaskPrioritization } from '@/lib/openai';
import { ITask } from '@/types/task';

export async function POST() {
  try {
    const db = await connectToDatabase();
    let tasks: ITask[] = [];

    if (db) {
      const dbTasks = await Task.find({ status: { $ne: 'done' } }).lean();
      tasks = dbTasks.map((t) => ({
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
      tasks = getFileTasks().filter((t) => t.status !== 'done');
    }

    const result = await generateTaskPrioritization(tasks);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating AI prioritization:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate task prioritization' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
