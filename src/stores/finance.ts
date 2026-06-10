import { create } from 'zustand';
import { api } from '@/lib/api';
import type { FeeRecord } from '@/types';

interface FinanceStore {
  records: FeeRecord[];
  loading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<FeeRecord, 'id'>) => Promise<void>;
  recordPayment: (id: string, amount: number) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  records: [],
  loading: false,
  error: null,
  fetchRecords: async () => {
    set({ loading: true, error: null });
    try {
      const records = await api.get<FeeRecord[]>('/finance');
      set({ records, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  addRecord: async (record) => {
    const created = await api.post<FeeRecord>('/finance', record);
    set((s) => ({ records: [created, ...s.records] }));
  },
  recordPayment: async (id, amount) => {
    const updated = await api.post<FeeRecord>(`/finance/${id}/pay`, { amount });
    set((s) => ({ records: s.records.map((r) => (r.id === id ? updated : r)) }));
  },
  removeRecord: async (id) => {
    await api.delete(`/finance/${id}`);
    set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
  },
}));
