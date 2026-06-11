import { create } from 'zustand';
import { api, getToken, setToken } from '@/lib/api';
import type { Staff, StaffType } from '@/types';

interface AuthStore {
  currentUser: Staff | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const ROLE_NAV_ITEMS: Record<StaffType, string[]> = {
  headteacher: ['dashboard', 'students', 'staff', 'academics', 'attendance', 'marks', 'wallet', 'tasks', 'transport', 'finance', 'communication', 'reports', 'audit-logs', 'terminal', 'settings'],
  admin: ['dashboard', 'students', 'staff', 'academics', 'attendance', 'marks', 'wallet', 'tasks', 'transport', 'finance', 'communication', 'reports', 'audit-logs', 'terminal', 'settings'],
  accountant: ['dashboard', 'finance', 'tasks', 'communication', 'reports'],
  teaching: ['dashboard', 'students', 'academics', 'attendance', 'marks', 'tasks', 'communication'],
  'non-teaching': ['dashboard', 'tasks', 'communication'],
};

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await api.post<{ user: { id: string; email: string; name: string; role: string }; token: string }>('/auth/login', { email, password });
      setToken(token);
      const staffList = await api.get<Staff[]>('/staff');
      const matched = staffList.find((s) => s.email === user.email);
      set({
        currentUser: matched || { id: user.id, name: user.name, email: user.email, role: user.role, phone: '', department: '', staffType: user.role as StaffType, status: 'active', hireDate: '' },
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await api.post<{ user: { id: string; email: string; name: string; role: string }; token: string }>('/auth/register', { email, password, name, role: 'headteacher' });
      setToken(token);
      set({ currentUser: { id: user.id, name: user.name, email: user.email, role: user.role, phone: '', department: '', staffType: 'headteacher', status: 'active', hireDate: '' }, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    setToken(null);
    set({ currentUser: null, error: null });
  },

  initialize: async () => {
    const token = getToken();
    if (!token) return;
    try {
      const staffList = await api.get<Staff[]>('/staff');
      const user = await api.get<{ id: string; email: string; name: string; role: string }>('/auth/me');
      const matched = staffList.find((s) => s.email === user.email);
      if (matched) set({ currentUser: matched });
    } catch {
      setToken(null);
    }
  },
}));
