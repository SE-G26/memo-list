export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'weekdays';
export type MasteryLevel = 'good' | 'fair' | 'poor';
export type TaskKind = 'standard' | 'learning_source' | 'learning_review';

export interface Task {
  id: string;
  title: string;
  frequency: TaskFrequency;
  reminderTime?: string | null;
  isLearning: boolean;
  notes?: string;
  completed: boolean;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  taskKind: TaskKind;
  parentTaskId?: string | null;
  seriesId?: string;
  reviewStep?: number;
  completedAt?: string;
  learningContent?: string;
  mastery?: MasteryLevel;
}

export interface TaskDatabase {
  tasks: Task[];
}

export interface CreateTaskInput {
  title: string;
  frequency: TaskFrequency;
  reminderTime?: string | null;
  isLearning: boolean;
  notes?: string;
  dueDate: string;
}

export interface UpdateTaskInput {
  title?: string;
  frequency?: TaskFrequency;
  reminderTime?: string | null;
  isLearning?: boolean;
  notes?: string;
  dueDate?: string;
}

export interface CompleteTaskInput {
  learnedContent?: string;
  mastery?: MasteryLevel;
}

export interface CompleteTaskResult {
  task: Task;
  createdReviews: Task[];
  adjustedReviews: Task[];
  nextRecurringTask?: Task;
}
