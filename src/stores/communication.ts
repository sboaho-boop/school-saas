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
  sender?: { id: string; name: string; email: string };
  receiver?: { id: string; name: string; email: string };
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
  loading: boolean;
  error: string | null;
  fetchMessages: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  sendMessage: (msg: { subject: string; body: string; toId: string }) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  addAnnouncement: (ann: { title: string; body: string; priority?: string }) => Promise<void>;
}

export const useCommunicationStore = create<CommunicationStore>((set) => ({
  messages: [],
  announcements: [],
  loading: false,
  error: null,
  fetchMessages: async () => {
    try {
      const messages = await api.get<Message[]>('/communication/messages');
      set({ messages });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  fetchAnnouncements: async () => {
    try {
      const announcements = await api.get<Announcement[]>('/communication/announcements');
      set({ announcements });
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
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) }));
  },
  addAnnouncement: async (ann) => {
    const created = await api.post<Announcement>('/communication/announcements', ann);
    set((s) => ({ announcements: [created, ...s.announcements] }));
  },
}));
