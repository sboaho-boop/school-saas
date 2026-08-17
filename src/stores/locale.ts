'use client';

import { create } from 'zustand';
import { translations, LANGUAGES, type LangCode } from '@/i18n/translations';

interface LocaleStore {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
}

export const useLocaleStore = create<LocaleStore>()((set, get) => ({
  lang: 'en',
  setLang: (lang) => {
    try { localStorage.setItem('eduplatform-lang', lang); } catch {}
    set({ lang });
  },
  t: (key) => {
    const { lang } = get();
    const dict = translations[lang] || translations.en;
    return dict[key] ?? translations.en[key] ?? key;
  },
}));

if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('eduplatform-lang');
    if (stored === 'fr' || stored === 'tw' || stored === 'ha') {
      useLocaleStore.getState().setLang(stored);
    }
  } catch {}
}

export function useI18n() {
  const lang = useLocaleStore((s) => s.lang);
  const setLang = useLocaleStore((s) => s.setLang);
  const t = useLocaleStore((s) => s.t);
  return { lang, setLang, t, languages: LANGUAGES };
}
