import { create } from 'zustand';
import { api } from '@/lib/api';

export interface SubscriptionInfo {
  id: string;
  plan: string;
  status: string;
  studentLimit: number;
  staffLimit: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  studentCount: number;
  staffCount: number;
  planName: string;
}

export interface Plan {
  id: string;
  name: string;
  studentLimit: number;
  staffLimit: number;
  priceId: string | null;
  amount: number;
}

interface BillingStore {
  subscription: SubscriptionInfo | null;
  plans: Plan[];
  loading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  createCheckoutSession: (plan: string) => Promise<string | null>;
  cancelSubscription: () => Promise<void>;
  createPortalSession: () => Promise<string | null>;
}

export const useBillingStore = create<BillingStore>((set) => ({
  subscription: null,
  plans: [],
  loading: false,
  error: null,

  fetchSubscription: async () => {
    set({ loading: true, error: null });
    try {
      const sub = await api.get<SubscriptionInfo>('/billing/subscription');
      set({ subscription: sub, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchPlans: async () => {
    try {
      const plans = await api.get<Plan[]>('/billing/plans');
      set({ plans });
    } catch {}
  },

  createCheckoutSession: async (plan) => {
    try {
      const { url } = await api.post<{ url: string }>('/billing/create-checkout-session', { plan });
      return url;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  cancelSubscription: async () => {
    try {
      await api.post('/billing/cancel');
      await set({ subscription: null });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createPortalSession: async () => {
    try {
      const { url } = await api.post<{ url: string }>('/billing/create-portal-session');
      return url;
    } catch {
      return null;
    }
  },
}));
