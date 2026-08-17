'use client';

import { useCallback, useEffect, useState } from 'react';
import { create } from 'zustand';
import { translations, LANGUAGES, type LangCode } from '@/i18n/translations';

function resolveLang(): LangCode {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem('eduplatform-lang');
    if (stored === 'en' || stored === 'fr' || stored === 'tw' || stored === 'ha') {
      return stored;
    }
  } catch {}
  return 'en';
}

export const useLocaleStore = create<{ lang: LangCode; setLang: (l: LangCode) => void }>()(
  (set) => ({
    lang: 'en',
    setLang: (lang) => {
      try { localStorage.setItem('eduplatform-lang', lang); } catch {}
      set({ lang });
    },
  }),
);

export function useI18n() {
  const lang = useLocaleStore((s) => s.lang);
  const setLang = useLocaleStore((s) => s.setLang);
  const [resolved, setResolved] = useState<LangCode>('en');

  useEffect(() => {
    const stored = resolveLang();
    setResolved(stored);
    if (stored !== lang) {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    setResolved(lang);
  }, [lang]);

  const t = useCallback(
    (key: string) => {
      const dict = translations[resolved] || translations.en;
      return dict[key] ?? translations.en[key] ?? key;
    },
    [resolved],
  );

  return { lang: resolved, setLang, t, languages: LANGUAGES };
}
