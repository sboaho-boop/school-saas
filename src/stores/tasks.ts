import { create } from 'zustand';
import type { Task } from '@/types';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
}

const mockTasks: Task[] = [
  {
    id: '1', title: 'Submit term reports for Basic 4',
    description: 'Complete and submit all term reports for Basic 4 students.',
    assignedTo: 'Ama Mensah', assignedBy: 'Admin',
    status: 'in_progress', priority: 'high',
    dueDate: '2026-05-10', createdAt: '2026-05-01',
    attachments: [], comments: [
      { id: 'c1', userId: 'u1', userName: 'Ama Mensah', content: 'Working on it now.', createdAt: '2026-05-02' },
    ],
  },
  {
    id: '2', title: 'Prepare PTA meeting agenda',
    description: 'Create agenda for upcoming PTA meeting on May 20.',
    assignedTo: 'Admin Team', assignedBy: 'School Owner',
    status: 'pending', priority: 'medium',
    dueDate: '2026-05-15', createdAt: '2026-05-02',
    attachments: [], comments: [],
  },
  {
    id: '3', title: 'Update student fee records',
    description: 'Reconcile all fee payments for the current term.',
    assignedTo: 'Finance Dept', assignedBy: 'Admin',
    status: 'pending', priority: 'urgent',
    dueDate: '2026-05-08', createdAt: '2026-05-01',
    attachments: [], comments: [],
  },
  {
    id: '4', title: 'Science lab equipment inventory',
    description: 'Complete inventory of all science lab equipment.',
    assignedTo: 'Lab Assistant', assignedBy: 'Science HOD',
    status: 'completed', priority: 'low',
    dueDate: '2026-04-30', createdAt: '2026-04-15',
    attachments: [], comments: [
      { id: 'c2', userId: 'u2', userName: 'Lab Assistant', content: 'All items accounted for.', createdAt: '2026-04-29' },
    ],
  },
  {
    id: '5', title: 'Staff performance reviews',
    description: 'Complete mid-year performance reviews for all teaching staff.',
    assignedTo: 'HR Manager', assignedBy: 'School Owner',
    status: 'in_progress', priority: 'high',
    dueDate: '2026-05-20', createdAt: '2026-05-01',
    attachments: [], comments: [],
  },
];

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: mockTasks,
  addTask: (task) =>
    set((state) => ({
      tasks: [{
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        comments: [],
      }, ...state.tasks],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
}));
