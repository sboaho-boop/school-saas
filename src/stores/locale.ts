'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { translations, LANGUAGES, type LangCode } from '@/i18n/translations';

let lang: LangCode = 'en';
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function getSnapshot() {
  return lang;
}

function getServerSnapshot(): LangCode {
  return 'en';
}

function persistLang(value: LangCode) {
  try { localStorage.setItem('eduplatform-lang', value); } catch {}
}

function initFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('eduplatform-lang');
    if (stored === 'fr' || stored === 'tw' || stored === 'ha') {
      lang = stored;
    }
  } catch {}
}

initFromStorage();

export function useI18n() {
  const currentLang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((value: LangCode) => {
    lang = value;
    persistLang(value);
    listeners.forEach((l) => l());
  }, []);

  const t = useCallback(
    (key: string) => {
      const dict = translations[currentLang] || translations.en;
      return dict[key] ?? translations.en[key] ?? key;
    },
    [currentLang],
  );

  return { lang: currentLang, setLang, t, languages: LANGUAGES };
}
