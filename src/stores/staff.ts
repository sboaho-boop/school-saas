import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Staff } from '@/types';

interface StaffStore {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  fetchStaff: () => Promise<void>;
  addStaff: (member: Omit<Staff, 'id'>) => Promise<any>;
  updateStaff: (id: string, updates: Partial<Staff>) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffStore>((set) => ({
  staff: [],
  loading: false,
  error: null,
  fetchStaff: async () => {
    set({ loading: true, error: null });
    try {
      const staff = await api.get<Staff[]>('/staff');
      set({ staff, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  addStaff: async (member) => {
    const created = await api.post<Staff>('/staff', member);
    set((s) => ({ staff: [created, ...s.staff] }));
  },
  updateStaff: async (id, updates) => {
    const updated = await api.put<Staff>(`/staff/${id}`, updates);
    set((s) => ({ staff: s.staff.map((m) => (m.id === id ? updated : m)) }));
  },
  removeStaff: async (id) => {
    await api.delete(`/staff/${id}`);
    set((s) => ({ staff: s.staff.filter((m) => m.id !== id) }));
  },
}));
