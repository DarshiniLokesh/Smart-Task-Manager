import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Task from '@/models/Task';
import { CreateTaskSchema } from '@/lib/validations/task';
import { ITask } from '@/types/task';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const tag = searchParams.get('tag');

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (tag) query.tags = tag;

    const tasks = await Task.find(query).sort({ order: 1, createdAt: -1 }).lean();
    const formattedTasks: ITask[] = tasks.map((t) => ({
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

    return NextResponse.json({ success: true, tasks: formattedTasks });
  } catch (error: any) {
    console.error('Error fetching tasks from MongoDB:', error);
    return NextResponse.json(
      { success: false, error: 'Database connection failed: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = CreateTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const taskData = validation.data;
    await connectToDatabase();

    const topTask = await Task.findOne({ status: taskData.status }).sort({ order: 1 }).lean();
    const newOrder = topTask && typeof topTask.order === 'number' ? topTask.order - 1 : 0;

    const newTask = await Task.create({
      ...taskData,
      order: newOrder,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
    });

    const formattedTask: ITask = {
      _id: newTask._id.toString(),
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : undefined,
      tags: newTask.tags || [],
      subtasks: (newTask.subtasks || []).map((s) => ({
        id: s.id || (s as { _id?: unknown })._id?.toString() || `sub-${Math.random()}`,
        title: s.title,
        completed: Boolean(s.completed),
      })),
      order: newTask.order || 0,
      createdAt: newTask.createdAt ? newTask.createdAt.toISOString() : undefined,
      updatedAt: newTask.updatedAt ? newTask.updatedAt.toISOString() : undefined,
    };

    return NextResponse.json(
      {
        success: true,
        task: formattedTask,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating task in MongoDB:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task in database: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
