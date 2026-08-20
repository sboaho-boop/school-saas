import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Campaign {
  id: string;
  title: string;
  message: string;
  type: string;
  recipientType: string;
  recipientFilter: string;
  sentCount: number;
  createdAt: string;
}

interface SmsStore {
  campaigns: Campaign[];
  balance: { balance?: number; currency?: string; error?: string } | null;
  loading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  sendSms: (params: { to: string; content: string }) => Promise<any>;
  sendBatchSms: (params: { recipients: string[]; content: string; title?: string; recipientType?: string }) => Promise<any>;
}

export const useSmsStore = create<SmsStore>((set) => ({
  campaigns: [],
  balance: null,
  loading: false,
  error: null,

  fetchCampaigns: async () => {
    set({ loading: true });
    try {
      const campaigns = await api.get<Campaign[]>('/campaigns');
      set({ campaigns, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchBalance: async () => {
    try {
      const balance = await api.get<any>('/sms/balance');
      set({ balance });
    } catch (err: any) {
      set({ balance: { error: err.message } });
    }
  },

  sendSms: async ({ to, content }) => {
    const result = await api.post<any>('/sms/send-and-log', { to, content });
    return result;
  },

  sendBatchSms: async ({ recipients, content, title, recipientType }) => {
    const result = await api.post<any>('/sms/batch-and-log', { recipients, content, title, recipientType });
    return result;
  },
}));
