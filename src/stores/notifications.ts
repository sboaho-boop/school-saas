import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Notification } from '@/types';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await api.get<{ notifications: Notification[]; total: number; unreadCount: number }>('/notifications');
      set({ notifications: res.notifications, total: res.total, unreadCount: res.unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get<{ count: number }>('/notifications/unread-count');
      set({ unreadCount: res.count });
    } catch {}
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  addNotification: (notification) =>
    set((state) => {
      const newNotification = {
        ...notification,
        id: Date.now().toString(),
        read: false,
      };
      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }),
}));
