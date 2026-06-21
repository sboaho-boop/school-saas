import { create } from 'zustand';
import { api, getToken, setToken } from '@/lib/api';
import type { Staff, StaffType } from '@/types';

interface AuthStore {
  currentUser: Staff | null;
  loading: boolean;
  error: string | null;
  require2fa: boolean;
  tempToken: string | null;
  pendingUserId: string | null;
  login: (email: string, password: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string, options?: { privacyConsent?: boolean }) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  clearError: () => void;
  cancel2fa: () => void;
}

export const ROLE_NAV_ITEMS: Record<StaffType, string[]> = {
  headteacher: ['dashboard', 'students', 'staff', 'academics', 'attendance', 'marks', 'wallet', 'tasks', 'transport', 'finance', 'communication', 'reports', 'audit-logs', 'terminal', 'settings', 'orders'],
  admin: ['dashboard', 'students', 'staff', 'academics', 'attendance', 'marks', 'wallet', 'tasks', 'transport', 'finance', 'communication', 'reports', 'audit-logs', 'terminal', 'settings', 'orders'],
  accountant: ['dashboard', 'finance', 'tasks', 'communication', 'reports'],
  teaching: ['dashboard', 'students', 'academics', 'attendance', 'marks', 'tasks', 'communication'],
  'non-teaching': ['dashboard', 'tasks', 'communication'],
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: null,
  loading: false,
  error: null,
  require2fa: false,
  tempToken: null,
  pendingUserId: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ user?: { id: string; email: string; name: string; role: string }; token?: string; require2fa?: boolean; tempToken?: string; userId?: string }>('/auth/login', { email, password });
      if (res.require2fa) {
        set({ require2fa: true, tempToken: res.tempToken || null, pendingUserId: res.userId || null, loading: false });
        return;
      }
      setToken(res.token!);
      const staffList = await api.get<Staff[]>('/staff');
      const matched = staffList.find((s) => s.email === (res.user as any).email);
      set({
        currentUser: matched || { id: (res.user as any).id, name: (res.user as any).name, email: (res.user as any).email, role: (res.user as any).role, phone: '', department: '', staffType: (res.user as any).role as StaffType, status: 'active', hireDate: '' },
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  verifyOtp: async (otp) => {
    const { tempToken } = get();
    if (!tempToken) return;
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ user: { id: string; email: string; name: string; role: string }; token: string }>('/auth/verify-2fa', { tempToken, otp });
      setToken(res.token);
      const staffList = await api.get<Staff[]>('/staff');
      const matched = staffList.find((s) => s.email === res.user.email);
      set({
        currentUser: matched || { id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role, phone: '', department: '', staffType: res.user.role as StaffType, status: 'active', hireDate: '' },
        require2fa: false,
        tempToken: null,
        pendingUserId: null,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (email, password, name, phone, options) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await api.post<{ user: { id: string; email: string; name: string; role: string }; token: string }>('/auth/register', { email, password, name, role: 'headteacher', phone: phone || '', privacyConsent: options?.privacyConsent || false });
      setToken(token);
      set({ currentUser: { id: user.id, name: user.name, email: user.email, role: user.role, phone: phone || '', department: '', staffType: 'headteacher', status: 'active', hireDate: '' }, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    setToken(null);
    set({ currentUser: null, error: null, require2fa: false, tempToken: null, pendingUserId: null });
  },

  initialize: async () => {
    const token = getToken();
    if (!token) {
      try {
        const user = await api.get<{ id: string; email: string; name: string; role: string }>('/auth/me');
        const staffList = await api.get<Staff[]>('/staff');
        const matched = staffList.find((s) => s.email === user.email);
        if (matched) set({ currentUser: matched });
        return;
      } catch {
        return;
      }
    }
    try {
      const staffList = await api.get<Staff[]>('/staff');
      const user = await api.get<{ id: string; email: string; name: string; role: string }>('/auth/me');
      const matched = staffList.find((s) => s.email === user.email);
      if (matched) set({ currentUser: matched });
    } catch {
      setToken(null);
    }
  },

  clearError: () => set({ error: null }),

  cancel2fa: () => set({ require2fa: false, tempToken: null, pendingUserId: null, error: null }),
}));
