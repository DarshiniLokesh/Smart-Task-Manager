import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Task from '@/models/Task';
import { UpdateTaskSchema } from '@/lib/validations/task';
import { getFileTasks, updateFileTask, deleteFileTask } from '@/lib/fileStore';
import { ITask } from '@/types/task';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await connectToDatabase();

    if (db && mongoose.Types.ObjectId.isValid(id)) {
      const task = await Task.findById(id).lean();
      if (!task) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      const formatted: ITask = {
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
        tags: task.tags || [],
        subtasks: task.subtasks || [],
        order: task.order || 0,
        createdAt: task.createdAt ? task.createdAt.toISOString() : undefined,
        updatedAt: task.updatedAt ? task.updatedAt.toISOString() : undefined,
      };
      return NextResponse.json({ success: true, task: formatted });
    } else {
      const task = getFileTasks().find((t) => t._id === id);
      if (!task) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, task });
    }
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch task' }, { status: 500 });
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
    const db = await connectToDatabase();

    if (db && mongoose.Types.ObjectId.isValid(id)) {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.dueDate !== undefined) {
        updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
      }

      const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!updatedTask) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }

      const formatted: ITask = {
        _id: updatedTask._id.toString(),
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        status: updatedTask.status,
        dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : undefined,
        tags: updatedTask.tags || [],
        subtasks: updatedTask.subtasks || [],
        order: updatedTask.order || 0,
        createdAt: updatedTask.createdAt ? updatedTask.createdAt.toISOString() : undefined,
        updatedAt: updatedTask.updatedAt ? updatedTask.updatedAt.toISOString() : undefined,
      };

      return NextResponse.json({ success: true, task: formatted });
    } else {
      const updated = updateFileTask(id, updates as Partial<ITask>);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, task: updated });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await connectToDatabase();

    if (db && mongoose.Types.ObjectId.isValid(id)) {
      const deleted = await Task.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Task deleted successfully' });
    } else {
      const deleted = deleteFileTask(id);
      if (!deleted) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Task deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 });
  }
}
