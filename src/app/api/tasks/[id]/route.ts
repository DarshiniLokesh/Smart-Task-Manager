import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Task from '@/models/Task';
import { UpdateTaskSchema } from '@/lib/validations/task';
import { ITask } from '@/types/task';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid task ID format' }, { status: 400 });
    }

    const task = await Task.findById(id).lean();
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found in MongoDB' }, { status: 404 });
    }

    const formatted: ITask = {
      _id: task._id.toString(),
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
      tags: task.tags || [],
      subtasks: (task.subtasks || []).map((s) => ({
        id: s.id || (s as { _id?: unknown })._id?.toString() || `sub-${Math.random()}`,
        title: s.title,
        completed: Boolean(s.completed),
      })),
      order: task.order || 0,
      createdAt: task.createdAt ? task.createdAt.toISOString() : undefined,
      updatedAt: task.updatedAt ? task.updatedAt.toISOString() : undefined,
    };
    return NextResponse.json({ success: true, task: formatted });
  } catch (error: any) {
    console.error('Error fetching task from MongoDB:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch task from database' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validation = UpdateTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updates = validation.data;
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid task ID format' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { ...updates };
    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updatedTask) {
      return NextResponse.json({ success: false, error: 'Task not found in MongoDB' }, { status: 404 });
    }

    const formatted: ITask = {
      _id: updatedTask._id.toString(),
      title: updatedTask.title,
      description: updatedTask.description || '',
      priority: updatedTask.priority,
      status: updatedTask.status,
      dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : undefined,
      tags: updatedTask.tags || [],
      subtasks: (updatedTask.subtasks || []).map((s) => ({
        id: s.id || (s as { _id?: unknown })._id?.toString() || `sub-${Math.random()}`,
        title: s.title,
        completed: Boolean(s.completed),
      })),
      order: updatedTask.order || 0,
      createdAt: updatedTask.createdAt ? updatedTask.createdAt.toISOString() : undefined,
      updatedAt: updatedTask.updatedAt ? updatedTask.updatedAt.toISOString() : undefined,
    };

    return NextResponse.json({ success: true, task: formatted });
  } catch (error: any) {
    console.error('Error updating task in MongoDB:', error);
    return NextResponse.json({ success: false, error: 'Failed to update task in database' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid task ID format' }, { status: 400 });
    }

    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Task not found in MongoDB' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Task deleted successfully from MongoDB' });
  } catch (error: any) {
    console.error('Error deleting task from MongoDB:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task from database' }, { status: 500 });
  }
}
