import { create } from 'zustand';
import { api } from '@/lib/api';

export interface CardOrder {
  id: string;
  schoolId: string;
  schoolName: string;
  studentIds: string;
  quantity: number;
  status: 'pending' | 'approved' | 'printing' | 'shipped' | 'delivered';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersStore {
  orders: CardOrder[];
  allOrders: CardOrder[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  createOrder: (studentIds: string[], notes?: string) => Promise<CardOrder>;
  updateStatus: (id: string, status: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: [],
  allOrders: [],
  loading: false,

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const orders = await api.get<CardOrder[]>('/orders');
      set({ orders, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchAllOrders: async () => {
    set({ loading: true });
    try {
      const allOrders = await api.get<CardOrder[]>('/orders/all');
      set({ allOrders, loading: false });
    } catch { set({ loading: false }); }
  },

  createOrder: async (studentIds, notes) => {
    const order = await api.post<CardOrder>('/orders', { studentIds, notes });
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },

  updateStatus: async (id, status) => {
    const updated = await api.patch<CardOrder>(`/orders/${id}/status`, { status });
    set((s) => ({
      orders: s.orders.map((o) => o.id === id ? updated : o),
      allOrders: s.allOrders.map((o) => o.id === id ? updated : o),
    }));
  },

  deleteOrder: async (id) => {
    await api.delete(`/orders/${id}`);
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
  },
}));
