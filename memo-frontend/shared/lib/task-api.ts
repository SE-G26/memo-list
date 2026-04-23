import type { MasteryLevel, Task } from '@/shared/types/global';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>;
type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt'>>;

interface CompleteTaskInput {
  learnedContent?: string;
  mastery?: MasteryLevel;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload?.error === 'string' ? payload.error : 'Request failed.';
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function fetchTasks(): Promise<Task[]> {
  const result = await apiFetch<{ tasks: Task[] }>('/api/tasks?includeCompleted=true');
  return result.tasks;
}

export async function fetchTaskById(id: string): Promise<Task> {
  const result = await apiFetch<{ task: Task }>(`/api/tasks/${id}`);
  return result.task;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const result = await apiFetch<{ task: Task }>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return result.task;
}

export async function patchTask(id: string, updates: UpdateTaskInput): Promise<Task> {
  const result = await apiFetch<{ task: Task }>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return result.task;
}

export async function removeTask(id: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
}

export async function completeTask(id: string, payload: CompleteTaskInput): Promise<void> {
  await apiFetch(`/api/tasks/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
