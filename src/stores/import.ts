import { create } from 'zustand';
import { api } from '@/lib/api';

interface ImportResult {
  imported: number;
  errors: { row: number; error: string }[];
}

interface ImportStore {
  importing: boolean;
  result: ImportResult | null;
  error: string | null;
  importStudents: (records: any[]) => Promise<ImportResult>;
  importStaff: (records: any[]) => Promise<ImportResult>;
  importMarks: (records: any[]) => Promise<ImportResult>;
  clearResult: () => void;
}

export const useImportStore = create<ImportStore>((set) => ({
  importing: false,
  result: null,
  error: null,

  importStudents: async (records) => {
    set({ importing: true, error: null, result: null });
    try {
      const result = await api.post<ImportResult>('/import/students', { records });
      set({ importing: false, result });
      return result;
    } catch (err: any) {
      set({ error: err.message, importing: false });
      throw err;
    }
  },

  importStaff: async (records) => {
    set({ importing: true, error: null, result: null });
    try {
      const result = await api.post<ImportResult>('/import/staff', { records });
      set({ importing: false, result });
      return result;
    } catch (err: any) {
      set({ error: err.message, importing: false });
      throw err;
    }
  },

  importMarks: async (records) => {
    set({ importing: true, error: null, result: null });
    try {
      const result = await api.post<ImportResult>('/import/marks', { records });
      set({ importing: false, result });
      return result;
    } catch (err: any) {
      set({ error: err.message, importing: false });
      throw err;
    }
  },

  clearResult: () => set({ result: null, error: null }),
}));
