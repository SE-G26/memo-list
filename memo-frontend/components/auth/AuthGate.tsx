'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthSession, fetchCurrentUser, getAuthToken } from '@/shared/lib/auth-api';

interface AuthGateProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ['/login'];
const AUTH_GATE_TIMEOUT_MS = 10000;

export function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [retrySeed, setRetrySeed] = useState(0);
  const forceRedirectingRef = useRef(false);

  const isPublicPage = useMemo(() => {
    return PUBLIC_PATHS.some((path) => pathname?.startsWith(path));
  }, [pathname]);

  useEffect(() => {
    let active = true;
    let guardTimer: ReturnType<typeof setTimeout> | null = null;

    if (isPublicPage) {
      setChecking(false);
      return () => {
        active = false;
      };
    }

    const token = getAuthToken();
    if (!token) {
      router.replace('/login');
      setChecking(false);
      return () => {
        active = false;
      };
    }

    const verify = async () => {
      guardTimer = setTimeout(() => {
        if (!active || forceRedirectingRef.current) return;
        clearAuthSession();
        router.replace('/login');
        setChecking(false);
      }, AUTH_GATE_TIMEOUT_MS);

      try {
        await fetchCurrentUser();
        if (!active || forceRedirectingRef.current) return;
      } catch {
        clearAuthSession();
        if (!active || forceRedirectingRef.current) return;
        router.replace('/login');
      } finally {
        if (guardTimer) {
          clearTimeout(guardTimer);
          guardTimer = null;
        }

        if (forceRedirectingRef.current) return;
        if (active) {
          setChecking(false);
        }
      }
    };

    void verify();

    return () => {
      active = false;
      if (guardTimer) {
        clearTimeout(guardTimer);
      }
    };
  }, [isPublicPage, retrySeed, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-xl bg-white px-6 py-4 text-sm text-slate-600 shadow">
          <p>正在验证登录状态...</p>
          <button
            type="button"
            onClick={() => {
              setChecking(true);
              setRetrySeed((value) => value + 1);
            }}
            className="mt-3 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50"
          >
            检测中...重试
          </button>
          <button
            type="button"
            onClick={() => {
              forceRedirectingRef.current = true;
              clearAuthSession();
              window.location.href = '/login';
            }}
            className="mt-2 w-full rounded-md border border-rose-200 px-3 py-1.5 text-xs text-rose-600 transition hover:bg-rose-50"
          >
            无法继续？强制进入登录页
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
