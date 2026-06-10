import { create } from 'zustand';

export interface Message {
  id: string;
  subject: string;
  body: string;
  fromName: string;
  toName: string;
  read: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
}

interface CommunicationStore {
  messages: Message[];
  announcements: Announcement[];
  sendMessage: (msg: Omit<Message, 'id' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => void;
}

const mockMessages: Message[] = [
  { id: 'm1', subject: 'PTA Meeting Reminder', body: 'Reminder: PTA meeting this Friday at 3pm.', fromName: 'Admin', toName: 'All Parents', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'm2', subject: 'Math Test Results', body: 'Basic 4 math test results are available.', fromName: 'Mr. Asante', toName: 'Basic 4 Parents', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'm3', subject: 'Fee Payment Reminder', body: 'Please clear outstanding fees by end of week.', fromName: 'Finance Dept', toName: 'Defaulters', read: false, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

const mockAnnouncements: Announcement[] = [
  { id: 'a1', title: 'School Closed', body: 'School will be closed on Monday for public holiday.', author: 'Head Teacher', priority: 'high', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a2', title: 'Sports Day', body: 'Annual sports day is scheduled for next Friday.', author: 'Sports Dept', priority: 'normal', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];

export const useCommunicationStore = create<CommunicationStore>((set) => ({
  messages: mockMessages,
  announcements: mockAnnouncements,
  sendMessage: (msg) => set((s) => ({
    messages: [{ ...msg, id: Date.now().toString(), read: false, createdAt: new Date().toISOString() }, ...s.messages],
  })),
  markRead: (id) => set((s) => ({
    messages: s.messages.map((m) => m.id === id ? { ...m, read: true } : m),
  })),
  addAnnouncement: (ann) => set((s) => ({
    announcements: [{ ...ann, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...s.announcements],
  })),
}));
