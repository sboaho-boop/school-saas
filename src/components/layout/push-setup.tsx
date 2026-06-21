'use client';

import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';

export function PushSetup() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!currentUser || typeof window === 'undefined') return;

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      (async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          const res = await api.get<{ publicKey: string }>('/push/vapid-public-key').catch(() => null);
          if (!res) return;
          const existing = await reg.pushManager.getSubscription();
          if (existing) await existing.unsubscribe();
          const key = Uint8Array.from(
            atob(res.publicKey.replace(/-/g, '+').replace(/_/g, '/').padEnd(res.publicKey.length + ((4 - res.publicKey.length % 4) % 4 || 4), '=')),
            (c) => c.charCodeAt(0),
          );
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key,
          });
          await api.post('/push/subscribe', sub.toJSON());
        } catch {}
      })();
    }

    pollingRef.current = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [currentUser, fetchNotifications]);

  return null;
}
