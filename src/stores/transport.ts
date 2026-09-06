import { create } from 'zustand';
import { api } from '@/lib/api';
import type { TransportRoute } from '@/types';

interface TransportStore {
  routes: TransportRoute[];
  loading: boolean;
  error: string | null;
  fetchRoutes: () => Promise<void>;
  addRoute: (route: Omit<TransportRoute, 'id' | 'createdAt'> & { driverIds?: string[] }) => Promise<void>;
  updateRoute: (id: string, updates: Partial<TransportRoute> & { driverIds?: string[] }) => Promise<void>;
  removeRoute: (id: string) => Promise<void>;
  assignStudents: (routeId: string, assignments: { studentId: string; pickupStop: string }[]) => Promise<void>;
  unassignStudent: (routeId: string, studentId: string) => Promise<void>;
  fetchRouteStudents: (routeId: string) => Promise<RouteStudent[]>;
}

export interface RouteStudent {
  id: string;
  firstName: string;
  lastName: string;
  indexNumber: string | null;
  className: string;
  pickupStop: string | null;
}

export const useTransportStore = create<TransportStore>((set) => ({
  routes: [],
  loading: false,
  error: null,
  fetchRoutes: async () => {
    set({ loading: true, error: null });
    try {
      const routes = await api.get<TransportRoute[]>('/transport');
      set({ routes: Array.isArray(routes) ? routes : [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  addRoute: async (route) => {
    const created = await api.post<TransportRoute>('/transport', route);
    set((s) => ({ routes: [created, ...s.routes] }));
  },
  updateRoute: async (id, updates) => {
    const updated = await api.put<TransportRoute>(`/transport/${id}`, updates);
    set((s) => ({ routes: s.routes.map((r) => (r.id === id ? updated : r)) }));
  },
  removeRoute: async (id) => {
    await api.delete(`/transport/${id}`);
    set((s) => ({ routes: s.routes.filter((r) => r.id !== id) }));
  },
  assignStudents: async (routeId, assignments) => {
    await api.put(`/transport/${routeId}/students`, { assignments });
  },
  unassignStudent: async (routeId, studentId) => {
    await api.delete(`/transport/${routeId}/students/${studentId}`);
  },
  fetchRouteStudents: async (routeId) => {
    const students = await api.get<RouteStudent[]>(`/transport/${routeId}/students`);
    return Array.isArray(students) ? students : [];
  },
}));
