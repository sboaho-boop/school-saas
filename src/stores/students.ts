import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Student } from '@/types';

interface StudentStore {
  students: Student[];
  loading: boolean;
  error: string | null;
  fetchStudents: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
}

export const useStudentStore = create<StudentStore>((set) => ({
  students: [],
  loading: false,
  error: null,
  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const students = await api.get<Student[]>('/students');
      set({ students, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  addStudent: async (student) => {
    const created = await api.post<Student>('/students', student);
    set((s) => ({ students: [created, ...s.students] }));
  },
  updateStudent: async (id, updates) => {
    const updated = await api.put<Student>(`/students/${id}`, updates);
    set((s) => ({ students: s.students.map((st) => (st.id === id ? updated : st)) }));
  },
  removeStudent: async (id) => {
    await api.delete(`/students/${id}`);
    set((s) => ({ students: s.students.filter((st) => st.id !== id) }));
  },
}));
