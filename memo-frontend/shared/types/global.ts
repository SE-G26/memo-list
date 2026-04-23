export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'weekdays';
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'failed';
export type MasteryLevel = 'good' | 'fair' | 'poor';
export type TaskKind = 'standard' | 'learning_source' | 'learning_review';

export interface Task {
  id: string;                   // 本地 id
  // serverId?: string;            // 后端 id
  title: string;
  frequency: TaskFrequency;
  reminderTime?: string | null;
  isLearning: boolean;
  notes?: string;
  completed: boolean;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  taskKind?: TaskKind;
  parentTaskId?: string | null;
  seriesId?: string;
  reviewStep?: number;
  completedAt?: string;
  learningContent?: string;
  mastery?: MasteryLevel;
  // syncStatus: SyncStatus;       // 同步状态
  // lastSyncedAt?: string;        // 最后同步时间
}