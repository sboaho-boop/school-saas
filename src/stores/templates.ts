import { create } from 'zustand';
import { api } from '@/lib/api';

export interface MessageTemplate {
  id: string;
  schoolId: string;
  name: string;
  subject: string;
  body: string;
  variables: string;
  category: string;
  createdAt: string;
}

interface TemplateStore {
  templates: MessageTemplate[];
  loading: boolean;
  fetchTemplates: () => Promise<void>;
  createTemplate: (data: { name: string; subject?: string; body: string; variables?: string[]; category?: string }) => Promise<MessageTemplate>;
  updateTemplate: (id: string, data: Partial<MessageTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  previewTemplate: (id: string, variables: Record<string, string>) => Promise<{ subject: string; body: string }>;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [],
  loading: false,

  fetchTemplates: async () => {
    set({ loading: true });
    try {
      const templates = await api.get<MessageTemplate[]>('/templates');
      set({ templates, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createTemplate: async (data) => {
    const template = await api.post<MessageTemplate>('/templates', data);
    set((s) => ({ templates: [template, ...s.templates] }));
    return template;
  },

  updateTemplate: async (id, data) => {
    await api.put(`/templates/${id}`, data);
    set((s) => ({
      templates: s.templates.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
  },

  deleteTemplate: async (id) => {
    await api.delete(`/templates/${id}`);
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
  },

  previewTemplate: async (id, variables) => {
    return api.post<{ subject: string; body: string }>(`/templates/${id}/preview`, { variables });
  },
}));
