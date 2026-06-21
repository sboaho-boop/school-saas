import { create } from 'zustand';
import { api } from '@/lib/api';

export interface SubscriptionInfo {
  id: string;
  plan: string;
  status: string;
  studentLimit: number;
  staffLimit: number;
  pendingPlan: string | null;
  pendingCheckoutRef: string | null;
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
  hubtelLoading: boolean;
  fetchSubscription: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  upgradePlan: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

export const useBillingStore = create<BillingStore>((set) => ({
  subscription: null,
  plans: [],
  loading: false,
  error: null,
  hubtelLoading: false,

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

  upgradePlan: async (plan) => {
    set({ hubtelLoading: true, error: null });
    try {
      const res = await api.post<{ checkoutUrl?: string; message?: string; reference?: string }>('/billing/upgrade', { plan });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      await set({ subscription: null, hubtelLoading: false });
    } catch (err: any) {
      set({ error: err.message, hubtelLoading: false });
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
}));
