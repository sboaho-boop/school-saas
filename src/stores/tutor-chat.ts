import { create } from 'zustand';
import { tutorRequest } from './tutor-auth';
import { speakText } from '@/lib/speech';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface TutorChatStore {
  messages: ChatMessage[];
  loading: boolean;
  remaining: number | null;
  sendMessage: (message: string, image?: string) => Promise<void>;
  sendVoice: (audioBlob: Blob, language: string, mime?: string) => Promise<{ reply: string; remaining: number; language?: string; transcribed?: string }>;
  sendImage: (prompt: string, style?: string) => Promise<void>;
  sendPhoto: (file: File, caption?: string) => Promise<void>;
  resetChat: () => void;
  loadHistory: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function mediaSrc(raw?: string): string | undefined {
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const origin = API_URL.replace(/\/api\/?$/, '');
  return origin + raw;
}

const WELCOME_MESSAGE = "Hi! I'm Teacher Kofi, your AI learning companion 🎉\n\nI can help you with:\n• Mathematics 📐\n• English 📖\n• Science 🔬\n• Ghanaian languages (Twi, Ga, Ewe, Fante, Dagbani) 🗣️\n• Homework help 📝\n• Quizzes and learning games 🎮\n\nWhat would you like to learn today?";

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = typeof window !== 'undefined' ? localStorage.getItem('tutor_token') : null;
  if (token) headers.Authorization = 'Bearer ' + token;
  return headers;
}

export const useTutorChat = create<TutorChatStore>((set, get) => ({
  messages: [{ role: 'assistant', content: WELCOME_MESSAGE }],
  loading: false,
  remaining: null,

  sendMessage: async (message: string, image?: string) => {
    const { messages } = get();
    const userMsg: ChatMessage = { role: 'user', content: message };
    if (image) userMsg.image = image;
    const placeholder: ChatMessage = { role: 'assistant', content: '' };
    set({ messages: [...messages, userMsg, placeholder], loading: true });

    const history = messages.slice(1).map((m) => {
      const entry: { role: string; content: string; image?: string } = { role: m.role, content: m.content };
      if (m.image) entry.image = m.image;
      return entry;
    });
    let started = false;

    const patchLast = (content: string, extra?: Partial<TutorChatStore>) => {
      set((s) => {
        const arr = [...s.messages];
        arr[arr.length - 1] = { role: 'assistant', content };
        return { messages: arr, ...(extra || {}) };
      });
    };

    // 1) Stream tokens for a fast reply
    try {
      const res = await fetch(API_URL + '/tutor/ai/chat/stream', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ message, history, ...(image ? { image } : {}) }),
      });
      if (!res.ok) throw new Error('Stream failed');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');
      const decoder = new TextDecoder();
      let buffer = '';
      let text = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let sep = buffer.indexOf('\n\n');
        while (sep !== -1) {
          const event = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          sep = buffer.indexOf('\n\n');
          for (const line of event.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;
            try {
              const evt = JSON.parse(payload);
              if (typeof evt.token === 'string') {
                text += evt.token;
                if (!started) { started = true; set({ loading: false }); }
                patchLast(text);
              } else if (evt.done) {
                patchLast(text, { remaining: evt.remaining, loading: false });
              } else if (evt.error) {
                throw new Error(evt.error);
              }
            } catch { /* partial json line */ }
          }
        }
      }
      if (!text.trim()) throw new Error('Empty reply');
      set({ loading: false });
      return;
    } catch {
      // 2) Fallback: classic JSON reply (patches the placeholder bubble)
      try {
        const res = await tutorRequest<{ reply: string; remaining: number }>('/tutor/ai/chat', {
          method: 'POST',
          body: JSON.stringify({ message, history, ...(image ? { image } : {}) }),
        });
        patchLast(res.reply, { remaining: res.remaining, loading: false });
      } catch {
        patchLast('Sorry, I had trouble connecting. Please try again.', { loading: false });
      }
    }
  },

  sendVoice: async (audioBlob: Blob, language: string, mime?: string) => {
    const { messages } = get();
    set({ loading: true });

    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
    const formData = new FormData();
    formData.append('audio', audioBlob, mime === 'audio/wav' ? 'voice.wav' : 'voice.webm');
    formData.append('mime', mime || audioBlob.type || 'audio/wav');
    formData.append('language', language);
    formData.append('history', JSON.stringify(history));

    try {
      const res = await fetch(API_URL + '/tutor/ai/voice', {
        method: 'POST',
        headers: authHeaders(),
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
      await speakText(data.reply || '', data.language || language);
      return data;
    } catch (err: unknown) {
      set((s) => ({
        messages: [...s.messages, { role: 'assistant', content: 'Voice error: ' + ((err as Error).message || 'Failed') }],
        loading: false,
      }));
      throw err;
    }
  },

  sendImage: async (prompt: string, style?: string) => {
    const { messages } = get();
    const userMsg: ChatMessage = { role: 'user', content: '🎨 ' + prompt };
    set({ messages: [...messages, userMsg], loading: true });

    try {
      const res = await tutorRequest<{ imageData: string; prompt: string; remaining: number }>('/tutor/ai/image', {
        method: 'POST',
        body: JSON.stringify({ prompt, style }),
      });
      set((s) => ({
        messages: [
          ...s.messages,
          { role: 'assistant', content: "Here's your picture! 🖼️ Ask me to draw something else anytime.", image: res.imageData },
        ],
        remaining: res.remaining,
        loading: false,
      }));
    } catch {
      set((s) => ({
        messages: [...s.messages, { role: 'assistant', content: 'Sorry, I could not draw that right now. Please try again.' }],
        loading: false,
      }));
    }
  },

  sendPhoto: async (file: File, caption?: string) => {
    const text = (caption || '').trim() || '📷 Look at this picture — what do you see?';
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(API_URL + '/tutor/upload', {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      await get().sendMessage(text, String(data.url));
    } catch (err: unknown) {
      set((s) => ({
        messages: [...s.messages, { role: 'assistant', content: 'Sorry, I could not upload that photo: ' + ((err as Error).message || 'Try again.') }],
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
