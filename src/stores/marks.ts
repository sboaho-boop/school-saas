import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  termId: string;
  score: number;
  grade: string;
  remarks: string;
}

interface MarksStore {
  grades: Grade[];
  loading: boolean;
  error: string | null;
  fetchGrades: (params?: { classId?: string; subjectId?: string; termId?: string }) => Promise<void>;
  saveGrade: (grade: Omit<Grade, 'id'>) => Promise<void>;
  saveAll: (grades: Omit<Grade, 'id'>[]) => Promise<void>;
}

export const useMarksStore = create<MarksStore>((set) => ({
  grades: [],
  loading: false,
  error: null,
  fetchGrades: async (params) => {
    set({ loading: true, error: null });
    try {
      const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
      const grades = await api.get<Grade[]>(`/marks${qs}`);
      set({ grades, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  saveGrade: async (grade) => {
    const saved = await api.post<Grade>('/marks', grade);
    set((s) => {
      const idx = s.grades.findIndex((g) => g.studentId === grade.studentId && g.subjectId === grade.subjectId);
      if (idx >= 0) {
        const updated = [...s.grades];
        updated[idx] = saved;
        return { grades: updated };
      }
      return { grades: [...s.grades, saved] };
    });
  },
  saveAll: async (grades) => {
    const results = await api.post<Grade[]>('/marks/batch', { grades });
    set((s) => {
      const filtered = s.grades.filter((g) => !grades.some((ng) => ng.studentId === g.studentId && ng.subjectId === g.subjectId));
      return { grades: [...filtered, ...results] };
    });
  },
}));
