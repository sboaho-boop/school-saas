import { create } from 'zustand';

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
  addClass: (cls: Omit<AcademicClass, 'id'>) => void;
  removeClass: (id: string) => void;
  addSubject: (subj: Omit<Subject, 'id'>) => void;
  removeSubject: (id: string) => void;
  addTerm: (term: Omit<Term, 'id'>) => void;
  setActiveTerm: (id: string) => void;
}

const mockClasses: AcademicClass[] = [
  { id: '1', name: 'KG 1', section: 'Kindergarten', students: 45, teacher: 'Ms. Adwoa' },
  { id: '2', name: 'KG 2', section: 'Kindergarten', students: 38, teacher: 'Ms. Esi' },
  { id: '3', name: 'Basic 1A', section: 'Lower Primary', students: 42, teacher: 'Mr. Mensah' },
  { id: '4', name: 'Basic 2A', section: 'Lower Primary', students: 38, teacher: 'Mrs. Ofori' },
  { id: '5', name: 'Basic 3A', section: 'Lower Primary', students: 40, teacher: 'Mr. Kofi' },
  { id: '6', name: 'Basic 4A', section: 'Upper Primary', students: 35, teacher: 'Mrs. Ama' },
  { id: '7', name: 'Basic 5B', section: 'Upper Primary', students: 32, teacher: 'Mrs. Mensah' },
  { id: '8', name: 'Basic 6A', section: 'Upper Primary', students: 30, teacher: 'Mr. Daniel' },
  { id: '9', name: 'Basic 7A', section: 'Junior High', students: 28, teacher: 'Mr. Asante' },
  { id: '10', name: 'Basic 8B', section: 'Junior High', students: 25, teacher: 'Ms. Fatima' },
  { id: '11', name: 'Basic 9A', section: 'Junior High', students: 22, teacher: 'Mr. Owusu' },
  { id: '12', name: 'SHS 1A', section: 'Senior High', students: 40, teacher: 'Dr. Nkrumah' },
  { id: '13', name: 'SHS 2B', section: 'Senior High', students: 35, teacher: 'Mrs. Sarpong' },
  { id: '14', name: 'SHS 3A', section: 'Senior High', students: 30, teacher: 'Mr. Ampomah' },
];

const mockSubjects: Subject[] = [
  { id: '1', name: 'Mathematics', code: 'MATH', teacher: 'Mrs. Mensah', classId: '6' },
  { id: '2', name: 'English', code: 'ENG', teacher: 'Ms. Fatima', classId: '6' },
  { id: '3', name: 'Science', code: 'SCI', teacher: 'Mr. Daniel', classId: '7' },
  { id: '4', name: 'Social Studies', code: 'SOS', teacher: 'Mr. Kofi', classId: '7' },
  { id: '5', name: 'French', code: 'FREN', teacher: 'Ms. Adwoa', classId: '1' },
  { id: '6', name: 'ICT', code: 'ICT', teacher: 'Mr. Ampomah', classId: '12' },
  { id: '7', name: 'Physics', code: 'PHY', teacher: 'Mr. Daniel', classId: '12' },
  { id: '8', name: 'Chemistry', code: 'CHEM', teacher: 'Dr. Nkrumah', classId: '12' },
  { id: '9', name: 'Literature', code: 'LIT', teacher: 'Ms. Fatima', classId: '9' },
  { id: '10', name: 'Algebra', code: 'ALG', teacher: 'Mrs. Mensah', classId: '6' },
  { id: '11', name: 'Geography', code: 'GEO', teacher: 'Mr. Owusu', classId: '11' },
  { id: '12', name: 'History', code: 'HIS', teacher: 'Mr. Asante', classId: '11' },
];

const mockTerms: Term[] = [
  { id: '1', name: 'Term 1', academicYear: '2025/2026', startDate: '2025-09-01', endDate: '2025-12-15', isActive: false },
  { id: '2', name: 'Term 2', academicYear: '2025/2026', startDate: '2026-01-10', endDate: '2026-04-10', isActive: false },
  { id: '3', name: 'Term 3', academicYear: '2025/2026', startDate: '2026-05-01', endDate: '2026-08-15', isActive: true },
];

export const useAcademicsStore = create<AcademicsStore>((set) => ({
  classes: mockClasses,
  subjects: mockSubjects,
  terms: mockTerms,
  addClass: (cls) => set((s) => ({ classes: [...s.classes, { ...cls, id: Date.now().toString() }] })),
  removeClass: (id) => set((s) => ({ classes: s.classes.filter((c) => c.id !== id) })),
  addSubject: (subj) => set((s) => ({ subjects: [...s.subjects, { ...subj, id: Date.now().toString() }] })),
  removeSubject: (id) => set((s) => ({ subjects: s.subjects.filter((s2) => s2.id !== id) })),
  addTerm: (term) => set((s) => ({ terms: [...s.terms, { ...term, id: Date.now().toString() }] })),
  setActiveTerm: (id) => set((s) => ({ terms: s.terms.map((t) => ({ ...t, isActive: t.id === id })) })),
}));
