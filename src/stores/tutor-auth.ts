import { create } from 'zustand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tutor_token');
}

function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('tutor_token', token);
  else localStorage.removeItem('tutor_token');
}

interface TutorUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  dailyUsage?: number;
  dailyUsageDate?: string;
  preferredLanguage?: string;
}

interface TutorAuthStore {
  user: TutorUser | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string, language?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  setPreferredLanguage: (language: string) => Promise<void>;
}

async function tutorRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_URL + path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Request failed: ' + res.status);
  }
  return res.json();
}

export const useTutorAuth = create<TutorAuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await tutorRequest<{ user: TutorUser; token: string }>('/tutor/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setToken(res.token);
      set({ user: res.user, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await tutorRequest<{ user: TutorUser; token: string }>('/tutor/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      set({ user: res.user, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    setToken(null);
    set({ user: null });
  },

  fetchMe: async () => {
    const token = getToken();
    if (!token) return;
    try {
      const user = await tutorRequest<TutorUser>('/tutor/auth/me');
      set({ user });
      if (user?.preferredLanguage && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('eduplatform-lang');
          if (!stored || stored === 'en') {
            localStorage.setItem('eduplatform-lang', user.preferredLanguage);
          }
        } catch {}
      }
    } catch {
      setToken(null);
      set({ user: null });
    }
  },

  clearError: () => set({ error: null }),

  setPreferredLanguage: async (language: string) => {
    try {
      const user = await tutorRequest<TutorUser>('/tutor/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ preferredLanguage: language }),
      });
      set({ user });
    } catch {
      // Non-fatal; language still persists locally in this session
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await tutorRequest('/tutor/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false });
      // Always show success (server never reveals if email exists)
    }
  },

  resetPassword: async (token, password) => {
    set({ loading: true, error: null });
    try {
      await tutorRequest('/tutor/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));

export { getToken as getTutorToken, setToken as setTutorToken, tutorRequest };
