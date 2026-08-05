import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Task from '@/models/Task';
import { generateTaskPrioritization } from '@/lib/openai';
import { ITask } from '@/types/task';

export async function POST() {
  try {
    await connectToDatabase();
    const dbTasks = await Task.find({ status: { $ne: 'done' } }).lean();

    const tasks: ITask[] = dbTasks.map((t) => ({
      _id: t._id.toString(),
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
      tags: t.tags || [],
      subtasks: (t.subtasks || []).map((s) => ({
        id: s.id || (s as { _id?: unknown })._id?.toString() || `sub-${Math.random()}`,
        title: s.title,
        completed: Boolean(s.completed),
      })),
      order: t.order || 0,
      createdAt: t.createdAt ? t.createdAt.toISOString() : undefined,
      updatedAt: t.updatedAt ? t.updatedAt.toISOString() : undefined,
    }));

    const result = await generateTaskPrioritization(tasks);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating AI prioritization:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate task prioritization from MongoDB' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
