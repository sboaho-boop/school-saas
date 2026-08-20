import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Message {
  id: string;
  subject: string;
  body: string;
  fromId: string;
  toId: string;
  read: boolean;
  createdAt: string;
  sender?: { id: string; name: string; email: string; role: string };
  receiver?: { id: string; name: string; email: string; role: string };
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  priority: string;
  createdAt: string;
  author?: { id: string; name: string };
}

interface CommunicationStore {
  messages: Message[];
  announcements: Announcement[];
  messageTotal: number;
  announcementTotal: number;
  loading: boolean;
  error: string | null;
  unreadMessageCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchMessages: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  sendMessage: (msg: { subject: string; body: string; toId: string }) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  addAnnouncement: (ann: { title: string; body: string; priority?: string }) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

export const useCommunicationStore = create<CommunicationStore>((set, get) => ({
  messages: [],
  announcements: [],
  messageTotal: 0,
  announcementTotal: 0,
  loading: false,
  error: null,
  unreadMessageCount: 0,
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  fetchMessages: async () => {
    try {
      const search = get().searchQuery;
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get<{ messages: Message[]; total: number }>(`/communication/messages${params}`);
      set({ messages: res.messages, messageTotal: res.total, unreadMessageCount: res.messages.filter((m) => !m.read && m.toId).length });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  fetchAnnouncements: async () => {
    try {
      const search = get().searchQuery;
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get<{ announcements: Announcement[]; total: number }>(`/communication/announcements${params}`);
      set({ announcements: res.announcements, announcementTotal: res.total });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  sendMessage: async (msg) => {
    const created = await api.post<Message>('/communication/messages', msg);
    set((s) => ({ messages: [created, ...s.messages] }));
  },
  markRead: async (id) => {
    await api.put(`/communication/messages/${id}/read`);
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
      unreadMessageCount: Math.max(0, s.unreadMessageCount - 1),
    }));
  },
  deleteMessage: async (id) => {
    await api.delete(`/communication/messages/${id}`);
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) }));
  },
  addAnnouncement: async (ann) => {
    const created = await api.post<Announcement>('/communication/announcements', ann);
    set((s) => ({ announcements: [created, ...s.announcements] }));
  },
  deleteAnnouncement: async (id) => {
    await api.delete(`/communication/announcements/${id}`);
    set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }));
  },
}));
