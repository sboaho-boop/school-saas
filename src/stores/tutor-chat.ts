import { create } from 'zustand';
import { tutorRequest } from './tutor-auth';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TutorChatStore {
  messages: ChatMessage[];
  loading: boolean;
  remaining: number | null;
  sendMessage: (message: string) => Promise<void>;
  sendVoice: (audioBlob: Blob, language: string) => Promise<void>;
  resetChat: () => void;
  loadHistory: () => Promise<void>;
}

const WELCOME_MESSAGE = "Hi! I'm Teacher Kofi, your AI learning companion 🎉\n\nI can help you with:\n• Mathematics 📐\n• English 📖\n• Science 🔬\n• Ghanaian languages (Twi, Ga, Ewe, Fante, Dagbani) 🗣️\n• Homework help 📝\n• Quizzes and learning games 🎮\n\nWhat would you like to learn today?";

export const useTutorChat = create<TutorChatStore>((set, get) => ({
  messages: [{ role: 'assistant', content: WELCOME_MESSAGE }],
  loading: false,
  remaining: null,

  sendMessage: async (message: string) => {
    const { messages } = get();
    const userMsg: ChatMessage = { role: 'user', content: message };
    set({ messages: [...messages, userMsg], loading: true });

    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await tutorRequest<{ reply: string; remaining: number }>('/tutor/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      });
      set((s) => ({
        messages: [...s.messages, { role: 'assistant', content: res.reply }],
        remaining: res.remaining,
        loading: false,
      }));
    } catch {
      set((s) => ({
        messages: [...s.messages, { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.' }],
        loading: false,
      }));
    }
  },

  sendVoice: async (audioBlob: Blob, language: string) => {
    const { messages } = get();
    set({ loading: true });

    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');
    formData.append('language', language);
    formData.append('history', JSON.stringify(history));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tutor_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(apiUrl + '/tutor/ai/voice', {
        method: 'POST',
        headers: token ? { Authorization: 'Bearer ' + token } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Voice failed');

      set((s) => ({
        messages: [
          ...s.messages,
          { role: 'user', content: '🎤 ' + data.transcribed },
          { role: 'assistant', content: data.reply },
        ],
        remaining: data.remaining,
        loading: false,
      }));
    } catch (err: any) {
      set((s) => ({
        messages: [...s.messages, { role: 'assistant', content: 'Voice error: ' + (err.message || 'Failed') }],
        loading: false,
      }));
    }
  },

  resetChat: () => {
    window.speechSynthesis?.cancel();
    set({ messages: [{ role: 'assistant', content: WELCOME_MESSAGE }] });
  },

  loadHistory: async () => {
    try {
      const history = await tutorRequest<Array<{ userMessage: string; aiResponse: string }>>('/tutor/ai/history');
      if (history.length > 0) {
        const mapped: ChatMessage[] = [];
        for (const h of history.reverse()) {
          mapped.push({ role: 'user', content: h.userMessage });
          mapped.push({ role: 'assistant', content: h.aiResponse });
        }
        set({ messages: [{ role: 'assistant', content: WELCOME_MESSAGE }, ...mapped] });
      }
    } catch {}
  },
}));

export { WELCOME_MESSAGE };
