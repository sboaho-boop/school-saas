import { create } from 'zustand';
import type { Notification } from '@/types';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'fee_reminder',
    title: 'Fee Payment Due',
    message: '15 students have outstanding fees due this week.',
    read: false,
    createdAt: '2026-05-02T10:00:00Z',
  },
  {
    id: '2',
    type: 'task_deadline',
    title: 'Task Deadline Approaching',
    message: 'Staff meeting minutes submission due tomorrow.',
    read: false,
    createdAt: '2026-05-02T09:00:00Z',
  },
  {
    id: '3',
    type: 'attendance_alert',
    title: 'Low Attendance Alert',
    message: 'Basic 4 has below 70% attendance this week.',
    read: true,
    createdAt: '2026-05-01T14:00:00Z',
  },
  {
    id: '4',
    type: 'exam_announcement',
    title: 'Mid-Term Exams Scheduled',
    message: 'Mid-term exams begin on May 15, 2026.',
    read: true,
    createdAt: '2026-05-01T08:00:00Z',
  },
];

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.read).length,
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
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: state.unreadCount - 1,
    })),
  markAllAsRead: () =>
    set(() => ({
      notifications: [],
      unreadCount: 0,
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: state.unreadCount - (state.notifications.find((n) => n.id === id)?.read ? 0 : 1),
    })),
}));
