import { z } from 'zod';

export const SubtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Subtask title cannot be empty'),
  completed: z.boolean(),
});

export const PrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const StatusSchema = z.enum(['todo', 'in_progress', 'done']);

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title is too long'),
  description: z.string().max(1000).optional().default(''),
  priority: PrioritySchema.optional().default('medium'),
  status: StatusSchema.optional().default('todo'),
  dueDate: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  subtasks: z.array(SubtaskSchema).optional().default([]),
  order: z.number().optional().default(0),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).optional(),
  priority: PrioritySchema.optional(),
  status: StatusSchema.optional(),
  dueDate: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  subtasks: z.array(SubtaskSchema).optional(),
  order: z.number().optional(),
});

export const ReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      status: StatusSchema,
      order: z.number(),
    })
  ),
});

export const AiBreakdownSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
});
