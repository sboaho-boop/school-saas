import { create } from 'zustand';
import type { Staff, StaffType } from '@/types';

interface AuthStore {
  currentUser: Staff | null;
  login: (staff: Staff) => void;
  logout: () => void;
}

const demoUsers: Record<string, Staff> = {
  headteacher: { id: '1', name: 'Mr. Kwame Asante', email: 'kwame@school.edu', phone: '+233 24 123 4567', role: 'Head Teacher', department: 'Administration', staffType: 'headteacher', status: 'active', hireDate: '2020-09-01' },
  admin: { id: '99', name: 'Admin User', email: 'admin@school.edu', phone: '+233 20 111 2222', role: 'System Admin', department: 'Administration', staffType: 'admin', status: 'active', hireDate: '2021-01-01' },
  accountant: { id: '5', name: 'Mr. Emmanuel Osei', email: 'emmanuel@school.edu', phone: '+233 20 654 3210', role: 'Accountant', department: 'Finance', staffType: 'accountant', status: 'active', hireDate: '2019-03-01' },
  teaching: { id: '2', name: 'Mrs. Ama Mensah', email: 'ama@school.edu', phone: '+233 20 987 6543', role: 'Mathematics Teacher', department: 'Mathematics', staffType: 'teaching', assignedClass: 'Basic 5B', assignedSubjects: ['Mathematics', 'Algebra'], status: 'active', hireDate: '2021-09-01' },
  'non-teaching': { id: '6', name: 'Mr. John Doe', email: 'john@school.edu', phone: '+233 24 555 6666', role: 'Librarian', department: 'Library', staffType: 'non-teaching', status: 'active', hireDate: '2022-06-01' },
};

export const ROLE_NAV_ITEMS: Record<StaffType, string[]> = {
  headteacher: ['dashboard', 'students', 'staff', 'academics', 'attendance', 'tasks', 'transport', 'finance', 'communication', 'reports', 'settings'],
  admin: ['dashboard', 'students', 'staff', 'academics', 'attendance', 'tasks', 'transport', 'finance', 'communication', 'reports', 'settings'],
  accountant: ['dashboard', 'finance', 'tasks', 'communication', 'reports'],
  teaching: ['dashboard', 'students', 'academics', 'attendance', 'tasks', 'communication'],
  'non-teaching': ['dashboard', 'tasks', 'communication'],
};

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  login: (staff) => set({ currentUser: staff }),
  logout: () => set({ currentUser: null }),
}));

export { demoUsers };
