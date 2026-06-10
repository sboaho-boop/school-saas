import { create } from 'zustand';
import type { Student } from '@/types';

interface StudentStore {
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  removeStudent: (id: string) => void;
}

const mockStudents: Student[] = [
  {
    id: '1', firstName: 'Kwame', lastName: 'Asante',
    email: 'kwame.asante@school.edu', classId: '1', className: 'Basic 4A',
    dateOfBirth: '2014-03-15', gender: 'male',
    parentName: 'Mr. Asante', parentPhone: '+233 24 123 4567',
    parentEmail: 'parent@email.com', enrollmentDate: '2024-09-01', status: 'active',
  },
  {
    id: '2', firstName: 'Ama', lastName: 'Mensah',
    email: 'ama.mensah@school.edu', classId: '2', className: 'Basic 5B',
    dateOfBirth: '2013-07-22', gender: 'female',
    parentName: 'Mrs. Mensah', parentPhone: '+233 20 987 6543',
    parentEmail: 'parent2@email.com', enrollmentDate: '2024-09-01', status: 'active',
  },
  {
    id: '3', firstName: 'Daniel', lastName: 'Kofi',
    email: 'daniel.kofi@school.edu', classId: '3', className: 'SHS 1A',
    dateOfBirth: '2010-11-08', gender: 'male',
    parentName: 'Mr. Kofi', parentPhone: '+233 27 456 7890',
    parentEmail: 'parent3@email.com', enrollmentDate: '2024-09-01', status: 'active',
  },
  {
    id: '4', firstName: 'Fatima', lastName: 'Ibrahim',
    email: 'fatima.ibrahim@school.edu', classId: '4', className: 'Basic 3A',
    dateOfBirth: '2015-01-30', gender: 'female',
    parentName: 'Mr. Ibrahim', parentPhone: '+233 24 321 0987',
    parentEmail: 'parent4@email.com', enrollmentDate: '2025-01-15', status: 'active',
  },
  {
    id: '5', firstName: 'Emmanuel', lastName: 'Osei',
    email: 'emmanuel.osei@school.edu', classId: '5', className: 'SHS 2B',
    dateOfBirth: '2009-06-12', gender: 'male',
    parentName: 'Mrs. Osei', parentPhone: '+233 20 654 3210',
    parentEmail: 'parent5@email.com', enrollmentDate: '2023-09-01', status: 'inactive',
  },
];

export const useStudentStore = create<StudentStore>((set) => ({
  students: mockStudents,
  addStudent: (student) =>
    set((state) => ({
      students: [{ ...student, id: Date.now().toString() }, ...state.students],
    })),
  updateStudent: (id, updates) =>
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  removeStudent: (id) =>
    set((state) => ({
      students: state.students.filter((s) => s.id !== id),
    })),
}));
