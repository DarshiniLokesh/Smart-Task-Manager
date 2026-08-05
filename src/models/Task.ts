import mongoose, { Schema, Document, Model } from 'mongoose';
import { Priority, Status, Subtask } from '@/types/task';

export interface ITaskDocument extends Document {
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: Date;
  tags: string[];
  subtasks: Subtask[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema = new Schema<Subtask>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { _id: false });

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    dueDate: { type: Date, default: null },
    tags: [{ type: String, trim: true }],
    subtasks: [SubtaskSchema],
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ status: 1, order: 1 });
TaskSchema.index({ dueDate: 1 });

const Task: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>('Task', TaskSchema);

export default Task;
