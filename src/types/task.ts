export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in_progress' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string; // ISO date string
  tags: string[];
  subtasks: Subtask[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string;
  tags?: string[];
  subtasks?: Subtask[];
  order?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string;
  tags?: string[];
  subtasks?: Subtask[];
  order?: number;
}

export interface ReorderItem {
  id: string;
  status: Status;
  order: number;
}

export interface AiBreakdownRequest {
  title: string;
  description?: string;
}

export interface AiBreakdownResponse {
  subtasks: string[];
  suggestedTags?: string[];
  suggestedPriority?: Priority;
}

export interface PrioritizedTaskRecommendation {
  taskId: string;
  title: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  urgencyScore: number;
  reason: string;
}

export interface AiPrioritizeResponse {
  recommendations: PrioritizedTaskRecommendation[];
  summary: string;
}
