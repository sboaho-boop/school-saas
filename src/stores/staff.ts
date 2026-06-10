import { create } from 'zustand';
import type { Staff } from '@/types';

interface StaffStore {
  staff: Staff[];
  addStaff: (member: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, member: Partial<Staff>) => void;
  removeStaff: (id: string) => void;
}

const mockStaff: Staff[] = [
  { id: '1', name: 'Mr. Kwame Asante', email: 'kwame@school.edu', phone: '+233 24 123 4567', role: 'Head Teacher', department: 'Administration', staffType: 'headteacher', status: 'active', hireDate: '2020-09-01' },
  { id: '2', name: 'Mrs. Ama Mensah', email: 'ama@school.edu', phone: '+233 20 987 6543', role: 'Mathematics Teacher', department: 'Mathematics', staffType: 'teaching', assignedClass: 'Basic 5B', assignedSubjects: ['Mathematics', 'Algebra'], status: 'active', hireDate: '2021-09-01' },
  { id: '3', name: 'Mr. Daniel Kofi', email: 'daniel@school.edu', phone: '+233 27 456 7890', role: 'Science Teacher', department: 'Science', staffType: 'teaching', assignedClass: 'SHS 1A', assignedSubjects: ['Physics', 'Chemistry'], status: 'active', hireDate: '2022-01-15' },
  { id: '4', name: 'Ms. Fatima Ibrahim', email: 'fatima@school.edu', phone: '+233 24 321 0987', role: 'English Teacher', department: 'Languages', staffType: 'teaching', assignedClass: 'Basic 3A', assignedSubjects: ['English', 'Literature'], status: 'active', hireDate: '2023-09-01' },
  { id: '5', name: 'Mr. Emmanuel Osei', email: 'emmanuel@school.edu', phone: '+233 20 654 3210', role: 'Accountant', department: 'Finance', staffType: 'non-teaching', status: 'inactive', hireDate: '2019-03-01' },
];

export const useStaffStore = create<StaffStore>((set) => ({
  staff: mockStaff,
  addStaff: (member) =>
    set((state) => ({
      staff: [{ ...member, id: Date.now().toString() }, ...state.staff],
    })),
  updateStaff: (id, updates) =>
    set((state) => ({
      staff: state.staff.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  removeStaff: (id) =>
    set((state) => ({
      staff: state.staff.filter((m) => m.id !== id),
    })),
}));
