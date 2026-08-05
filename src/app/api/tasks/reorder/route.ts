import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Task from '@/models/Task';
import { ReorderSchema } from '@/lib/validations/task';
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
    await connectToDatabase();

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

    return NextResponse.json({ success: true, message: 'Reorder synced successfully in MongoDB' });
  } catch (error: any) {
    console.error('Error reordering tasks in MongoDB:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync task reordering in database' },
      { status: 500 }
    );
  }
}
