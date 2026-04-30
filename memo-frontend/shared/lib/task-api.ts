import type { MasteryLevel, Task } from '@/shared/types/global';
import { clearAuthSession, getAuthToken } from '@/shared/lib/auth-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>;
type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt'>>;

interface CompleteTaskInput {
  learnedContent?: string;
  mastery?: MasteryLevel;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

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
