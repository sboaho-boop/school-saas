'use client';

import { create } from 'zustand';
import { translations, LANGUAGES, type LangCode } from '@/i18n/translations';

interface LocaleStore {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
}

function readStoredLang(): LangCode {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem('eduplatform-lang');
    if (stored && (stored === 'en' || stored === 'fr' || stored === 'tw' || stored === 'ha')) {
      return stored as LangCode;
    }
  } catch {}
  return 'en';
}

export const useLocaleStore = create<LocaleStore>((set, get) => ({
  lang: readStoredLang(),
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

export function useI18n() {
  const lang = useLocaleStore((s) => s.lang);
  const setLang = useLocaleStore((s) => s.setLang);
  const t = useLocaleStore((s) => s.t);
  return { lang, setLang, t, languages: LANGUAGES };
}
