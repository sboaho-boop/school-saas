import { create } from 'zustand';
import type { TransportRoute } from '@/types';

interface TransportStore {
  routes: TransportRoute[];
  addRoute: (route: Omit<TransportRoute, 'id' | 'createdAt'>) => void;
  updateRoute: (id: string, updates: Partial<TransportRoute>) => void;
  removeRoute: (id: string) => void;
}

const mockRoutes: TransportRoute[] = [
  {
    id: '1', name: 'North Route',
    description: 'Covers the northern residential areas including Zongo and Dorwulu.',
    stops: ['Main Gate', 'Zongo Junction', 'Dorwulu', 'Abofu', 'School'],
    driverName: 'Mr. Daniel Kofi', driverPhone: '+233 27 456 7890',
    capacity: 45, status: 'active', createdAt: '2026-01-15',
  },
  {
    id: '2', name: 'East Route',
    description: 'Covers the eastern suburbs including Madina and Adjiriganor.',
    stops: ['Main Gate', 'Madina Market', 'Adjiriganor', 'Pantang', 'School'],
    driverName: 'Unassigned', driverPhone: '',
    capacity: 35, status: 'active', createdAt: '2026-01-15',
  },
  {
    id: '3', name: 'West Route',
    description: 'Covers western areas including Awoshie and Pokuase.',
    stops: ['Main Gate', 'Awoshie', 'Pokuase', 'School'],
    driverName: 'Unassigned', driverPhone: '',
    capacity: 30, status: 'inactive', createdAt: '2026-02-01',
  },
];

export const useTransportStore = create<TransportStore>((set) => ({
  routes: mockRoutes,
  addRoute: (route) =>
    set((state) => ({
      routes: [{ ...route, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] }, ...state.routes],
    })),
  updateRoute: (id, updates) =>
    set((state) => ({
      routes: state.routes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  removeRoute: (id) =>
    set((state) => ({
      routes: state.routes.filter((r) => r.id !== id),
    })),
}));
