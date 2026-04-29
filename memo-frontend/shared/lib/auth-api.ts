import type { UserProfile } from '@/shared/types/global';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const AUTH_STORAGE_KEY = 'memo_auth_session';

interface AuthPayload {
  token: string;
  user: UserProfile;
}

interface StoredSession {
  token: string;
  user: UserProfile;
}

interface Credentials {
  username: string;
  password: string;
}

function getStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function setStoredSession(session: StoredSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAuthToken(): string | null {
  return getStoredSession()?.token ?? null;
}

export function getCurrentUserFromStorage(): UserProfile | null {
  return getStoredSession()?.user ?? null;
}

export function setCurrentUserInStorage(user: UserProfile): void {
  const token = getAuthToken();
  if (!token) {
    return;
  }

  setStoredSession({ token, user });
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload?.error === 'string' ? payload.error : 'Request failed.';
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function register(credentials: Credentials): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload?.error === 'string' ? payload.error : 'Registration failed.';
    throw new Error(message);
  }

  const data = (await response.json()) as AuthPayload;
  setStoredSession({ token: data.token, user: data.user });
  return data.user;
}

export async function login(credentials: Credentials): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload?.error === 'string' ? payload.error : 'Login failed.';
    throw new Error(message);
  }

  const data = (await response.json()) as AuthPayload;
  setStoredSession({ token: data.token, user: data.user });
  return data.user;
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const result = await authFetch<{ user: UserProfile }>('/api/auth/me');
  setCurrentUserInStorage(result.user);
  return result.user;
}

export async function logout(): Promise<void> {
  try {
    await authFetch('/api/auth/logout', { method: 'POST' });
  } finally {
    clearAuthSession();
  }
}
