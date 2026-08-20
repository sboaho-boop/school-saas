import { create } from 'zustand';
import { api } from '@/lib/api';

export interface ConversationParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  type: string;
  fileUrl?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  schoolId: string;
  studentId?: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  participants: { user: ConversationParticipant }[];
  messages: ConversationMessage[];
  student?: { id: string; firstName: string; lastName: string; className: string };
}

interface ConversationStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentMessages: ConversationMessage[];
  loading: boolean;
  error: string | null;
  total: number;
  fetchConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  createConversation: (participantIds: string[], title?: string, studentId?: string) => Promise<Conversation>;
  sendMessage: (conversationId: string, body: string, fileUrl?: string) => Promise<ConversationMessage>;
  startConversationWithParent: (studentId: string) => Promise<Conversation>;
  clearCurrent: () => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  loading: false,
  error: null,
  total: 0,

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const res = await api.get<{ conversations: Conversation[]; total: number }>('/conversations');
      set({ conversations: res.conversations, total: res.total, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchConversation: async (id: string) => {
    set({ loading: true });
    try {
      const [conversation, messages] = await Promise.all([
        api.get<Conversation>(`/conversations/${id}`),
        api.get<ConversationMessage[]>(`/conversations/${id}/messages`),
      ]);
      set({ currentConversation: conversation, currentMessages: messages, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createConversation: async (participantIds, title, studentId) => {
    const conversation = await api.post<Conversation>('/conversations', { participantIds, title, studentId });
    set((s) => ({ conversations: [conversation, ...s.conversations] }));
    return conversation;
  },

  sendMessage: async (conversationId, body, fileUrl) => {
    const message = await api.post<ConversationMessage>(`/conversations/${conversationId}/messages`, { body, fileUrl });
    set((s) => ({
      currentMessages: [...s.currentMessages, message],
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, updatedAt: new Date().toISOString(), messages: [{ ...message }] }
          : c
      ),
    }));
    return message;
  },

  startConversationWithParent: async (studentId) => {
    const conversation = await api.post<Conversation>(`/conversations/with-parent/${studentId}`);
    const exists = get().conversations.find((c) => c.id === conversation.id);
    if (!exists) {
      set((s) => ({ conversations: [conversation, ...s.conversations] }));
    }
    return conversation;
  },

  clearCurrent: () => set({ currentConversation: null, currentMessages: [] }),
}));
