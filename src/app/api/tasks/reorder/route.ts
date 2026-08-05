import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Task from '@/models/Task';
import { ReorderSchema } from '@/lib/validations/task';
import { updateFileTask } from '@/lib/fileStore';
import mongoose from 'mongoose';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validation = ReorderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items } = validation.data;
    const db = await connectToDatabase();

    if (db) {
      const bulkOps = items
        .filter((item) => mongoose.Types.ObjectId.isValid(item.id))
        .map((item) => ({
          updateOne: {
            filter: { _id: item.id },
            update: { status: item.status, order: item.order },
          },
        }));

      if (bulkOps.length > 0) {
        await Task.bulkWrite(bulkOps);
      }
    } else {
      // File persistence updates
      items.forEach((item) => {
        updateFileTask(item.id, { status: item.status, order: item.order });
      });
    }

    return NextResponse.json({ success: true, message: 'Reorder synced successfully' });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync task reordering' },
      { status: 500 }
    );
  }
}
