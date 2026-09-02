'use client';

import { create } from 'zustand';
import { translations, LANGUAGES, type LangCode } from '@/i18n/translations';

const VALID_CODES = new Set<string>(LANGUAGES.map((l) => l.code));

interface LocaleState {
  lang: LangCode;
  setLang: (value: LangCode) => void;
  t: (key: string) => string;
}

function readStoredLang(): LangCode {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem('eduplatform-lang');
    if (stored && VALID_CODES.has(stored)) return stored as LangCode;
  } catch {}
  return 'en';
}

function persistLang(value: LangCode) {
  try {
    localStorage.setItem('eduplatform-lang', value);
  } catch {}
}

function applyDocumentLang(value: LangCode) {
  try {
    document.documentElement.setAttribute('lang', value);
  } catch {}
}

export const useLocale = create<LocaleState>((set, get) => ({
  lang: readStoredLang(),
  setLang: (value) => {
    persistLang(value);
    if (typeof document !== 'undefined') applyDocumentLang(value);
    set({ lang: value });
  },
  t: (key) => {
    const dict = translations[get().lang] || translations.en;
    return dict[key] ?? translations.en[key] ?? key;
  },
}));

export function useI18n() {
  const lang = useLocale((s) => s.lang);
  const setLang = useLocale((s) => s.setLang);
  const t = useLocale((s) => s.t);
  return { lang, setLang, t, languages: LANGUAGES };
}

export function getCurrentLang(): LangCode {
  return useLocale.getState().lang;
}

export function setLocaleLanguage(value: LangCode) {
  persistLang(value);
  if (typeof document !== 'undefined') applyDocumentLang(value);
  useLocale.setState({ lang: value });
}
