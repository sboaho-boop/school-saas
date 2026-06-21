import { create } from 'zustand';
import { api } from '@/lib/api';

export interface WalletInfo {
  id: string;
  studentId: string;
  studentName: string;
  balance: number;
  totalSpent: number;
  cardUid: string | null;
  wristbandUid: string | null;
  transactionPin: string | null;
  dailyLimit: number;
  todaySpent: number;
  lastSpentReset: string;
  frozen: boolean;
  student?: any;
  transactions?: any[];
}

interface WalletStore {
  wallets: WalletInfo[];
  loading: boolean;
  error: string | null;
  fetchWallets: () => Promise<void>;
  getWallet: (studentId: string) => Promise<WalletInfo>;
  createWallet: (studentId: string, cardUid?: string) => Promise<void>;
  topUp: (studentId: string, amount: number, method?: string) => Promise<void>;
  freezeCard: (studentId: string) => Promise<void>;
  unfreezeCard: (studentId: string) => Promise<void>;
  linkCard: (studentId: string, cardUid: string) => Promise<void>;
  linkWristband: (studentId: string, wristbandUid: string) => Promise<void>;
  generateCard: (studentId: string) => Promise<{ cardUid: string }>;
  setPin: (studentId: string, pin: string) => Promise<void>;
  setDailyLimit: (studentId: string, dailyLimit: number) => Promise<void>;
  tapCard: (uid: string, service: string, amount?: number, terminalId?: string) => Promise<any>;
  tapConfirm: (tapToken: string, pin: string) => Promise<any>;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallets: [],
  loading: false,
  error: null,

  fetchWallets: async () => {
    set({ loading: true });
    try {
      const wallets = await api.get<WalletInfo[]>('/wallet');
      set({ wallets, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  getWallet: async (studentId) => {
    return api.get<WalletInfo>(`/wallet/${studentId}`);
  },

  createWallet: async (studentId, cardUid) => {
    await api.post('/wallet/create', { studentId, cardUid });
    await set({});
  },

  topUp: async (studentId, amount, method) => {
    const { wallet } = await api.post<{ wallet: WalletInfo }>('/wallet/top-up', { studentId, amount, method });
    set((s) => ({ wallets: s.wallets.map((w) => w.studentId === studentId ? { ...w, ...wallet } : w) }));
  },

  freezeCard: async (studentId) => {
    await api.post(`/wallet/freeze/${studentId}`);
    set((s) => ({ wallets: s.wallets.map((w) => w.studentId === studentId ? { ...w, frozen: true } : w) }));
  },

  unfreezeCard: async (studentId) => {
    await api.post(`/wallet/unfreeze/${studentId}`);
    set((s) => ({ wallets: s.wallets.map((w) => w.studentId === studentId ? { ...w, frozen: false } : w) }));
  },

  linkCard: async (studentId, cardUid) => {
    await api.post('/wallet/link-card', { studentId, cardUid });
    await set({});
  },

  linkWristband: async (studentId, wristbandUid) => {
    await api.post('/wallet/link-wristband', { studentId, wristbandUid });
    await set({});
  },

  generateCard: async (studentId) => {
    const res = await api.post<{ cardUid: string }>('/wallet/generate-card', { studentId });
    await set({});
    return res;
  },

  setPin: async (studentId, pin) => {
    await api.put('/wallet/pin', { studentId, pin });
  },

  setDailyLimit: async (studentId, dailyLimit) => {
    await api.put('/wallet/daily-limit', { studentId, dailyLimit });
  },

  tapCard: async (uid, service, amount, terminalId) => {
    return api.post('/wallet/tap', { uid, service, amount, terminalId });
  },

  tapConfirm: async (tapToken, pin) => {
    return api.post('/wallet/tap/confirm', { tapToken, pin });
  },
}));