import { create } from 'zustand';
import type { FeeRecord } from '@/types';

interface FinanceStore {
  records: FeeRecord[];
  addRecord: (record: Omit<FeeRecord, 'id'>) => void;
  recordPayment: (id: string, amount: number) => void;
  removeRecord: (id: string) => void;
}

const mockRecords: FeeRecord[] = [
  { id: '1', studentId: '1', studentName: 'Kwame Asante', amount: 2500, paid: 2500, balance: 0, dueDate: '2026-04-01', status: 'paid' },
  { id: '2', studentId: '2', studentName: 'Ama Mensah', amount: 2500, paid: 1500, balance: 1000, dueDate: '2026-04-01', status: 'partial' },
  { id: '3', studentId: '3', studentName: 'Daniel Kofi', amount: 3500, paid: 0, balance: 3500, dueDate: '2026-03-01', status: 'overdue' },
  { id: '4', studentId: '4', studentName: 'Fatima Ibrahim', amount: 2500, paid: 0, balance: 2500, dueDate: '2026-05-15', status: 'unpaid' },
  { id: '5', studentId: '5', studentName: 'Emmanuel Osei', amount: 3500, paid: 3500, balance: 0, dueDate: '2026-04-01', status: 'paid' },
];

const getStatus = (balance: number, dueDate: string): FeeRecord['status'] => {
  if (balance === 0) return 'paid';
  if (new Date(dueDate) < new Date()) return 'overdue';
  if (balance < 0) return 'paid';
  return 'unpaid';
};

export const useFinanceStore = create<FinanceStore>((set) => ({
  records: mockRecords,
  addRecord: (record) =>
    set((state) => ({
      records: [{ ...record, id: Date.now().toString() }, ...state.records],
    })),
  recordPayment: (id, amount) =>
    set((state) => ({
      records: state.records.map((r) => {
        if (r.id !== id) return r;
        const newPaid = r.paid + amount;
        const newBalance = Math.max(0, r.amount - newPaid);
        return {
          ...r,
          paid: newPaid,
          balance: newBalance,
          status: getStatus(newBalance, r.dueDate),
        };
      }),
    })),
  removeRecord: (id) =>
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
    })),
}));
