'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { getToken } from '@/lib/api';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const initialize = useAuthStore((s) => s.initialize);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!currentUser) {
        await initialize();
      }
      const token = getToken();
      const hasUser = !!useAuthStore.getState().currentUser;
      if (!token && !hasUser) {
        router.replace('/login');
        return;
      }
      setChecking(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (checking) return;
    const token = getToken();
    const hasUser = !!useAuthStore.getState().currentUser;
    if (!token && !hasUser) {
      router.replace('/login');
    }
  }, [currentUser, checking, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
