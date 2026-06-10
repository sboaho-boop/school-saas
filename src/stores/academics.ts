import { create } from 'zustand';
import { api } from '@/lib/api';

export interface AcademicClass {
  id: string;
  name: string;
  section: string;
  students: number;
  teacher: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  classId: string;
}

export interface Term {
  id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface AcademicsStore {
  classes: AcademicClass[];
  subjects: Subject[];
  terms: Term[];
  loading: boolean;
  error: string | null;
  fetchClasses: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
  fetchTerms: () => Promise<void>;
  addClass: (cls: Omit<AcademicClass, 'id'>) => Promise<void>;
  removeClass: (id: string) => Promise<void>;
  addSubject: (subj: Omit<Subject, 'id'>) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  addTerm: (term: Omit<Term, 'id'>) => Promise<void>;
  setActiveTerm: (id: string) => Promise<void>;
}

export const useAcademicsStore = create<AcademicsStore>((set) => ({
  classes: [],
  subjects: [],
  terms: [],
  loading: false,
  error: null,
  fetchClasses: async () => {
    try {
      const classes = await api.get<AcademicClass[]>('/academics/classes');
      set({ classes });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  fetchSubjects: async () => {
    try {
      const subjects = await api.get<Subject[]>('/academics/subjects');
      set({ subjects });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  fetchTerms: async () => {
    try {
      const terms = await api.get<Term[]>('/academics/terms');
      set({ terms });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  addClass: async (cls) => {
    const created = await api.post<AcademicClass>('/academics/classes', cls);
    set((s) => ({ classes: [...s.classes, created] }));
  },
  removeClass: async (id) => {
    await api.delete(`/academics/classes/${id}`);
    set((s) => ({ classes: s.classes.filter((c) => c.id !== id) }));
  },
  addSubject: async (subj) => {
    const created = await api.post<Subject>('/academics/subjects', subj);
    set((s) => ({ subjects: [...s.subjects, created] }));
  },
  removeSubject: async (id) => {
    await api.delete(`/academics/subjects/${id}`);
    set((s) => ({ subjects: s.subjects.filter((s2) => s2.id !== id) }));
  },
  addTerm: async (term) => {
    const created = await api.post<Term>('/academics/terms', term);
    set((s) => ({ terms: [...s.terms, created] }));
  },
  setActiveTerm: async (id) => {
    const updated = await api.put<Term>(`/academics/terms/${id}/activate`);
    set((s) => ({ terms: s.terms.map((t) => ({ ...t, isActive: t.id === id })) }));
  },
}));
