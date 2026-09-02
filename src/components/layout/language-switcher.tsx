'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/stores/locale';
import { LANGUAGES } from '@/i18n/translations';
import { getTutorToken } from '@/stores/tutor-auth';

export function LanguageSwitcher({ compact = false, persistToBackend = false }: { compact?: boolean; persistToBackend?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const changeLang = (code: typeof lang) => {
    setLang(code);
    setOpen(false);
    if (persistToBackend && getTutorToken()) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      fetch(apiUrl + '/tutor/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getTutorToken() },
        body: JSON.stringify({ preferredLanguage: code }),
      }).catch(() => {});
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Globe size={20} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-border/50 bg-popover shadow-lg">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
            {t('header.language')}
          </div>
          <div className="border-t border-border/50" />
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => changeLang(language.code)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent',
                lang === language.code && 'bg-accent font-medium'
              )}
            >
              <span>{language.flag}</span>
              <span className="flex-1 text-left">
                {language.nativeLabel}
                {!compact && <span className="ml-2 text-xs text-muted-foreground">{language.label}</span>}
              </span>
              {lang === language.code && <Check size={14} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
