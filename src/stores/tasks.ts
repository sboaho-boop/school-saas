import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Task, TaskComment } from '@/types';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: false,
  error: null,
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await api.get<Task[]>('/tasks');
      set({ tasks, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  addTask: async (task) => {
    const created = await api.post<Task>('/tasks', task);
    set((s) => ({ tasks: [created, ...s.tasks] }));
  },
  updateTask: async (id, updates) => {
    const updated = await api.put<Task>(`/tasks/${id}`, updates);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
  },
  removeTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },
  addComment: async (taskId, content) => {
    const comment = await api.post<TaskComment>(`/tasks/${taskId}/comments`, { content });
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
      ),
    }));
  },
}));
