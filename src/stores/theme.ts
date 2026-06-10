import { create } from 'zustand';
import type { ThemeConfig } from '@/types';

interface ThemeStore {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  setPrimaryColor: (color: string) => void;
  setSchoolName: (name: string) => void;
  setLogo: (logo: string) => void;
}

const defaultTheme: ThemeConfig = {
  schoolName: 'My School',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#06b6d4',
  borderRadius: 'md',
  fontFamily: 'Inter',
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: defaultTheme,
  setTheme: (updates) =>
    set((state) => ({
      theme: { ...state.theme, ...updates },
    })),
  setPrimaryColor: (color) =>
    set((state) => ({
      theme: { ...state.theme, primaryColor: color },
    })),
  setSchoolName: (name) =>
    set((state) => ({
      theme: { ...state.theme, schoolName: name },
    })),
  setLogo: (logo) =>
    set((state) => ({
      theme: { ...state.theme, logo },
    })),
}));
