'use client';

import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/stores/locale';
import { LANGUAGES } from '@/i18n/translations';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <Globe size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('header.language')}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLang(language.code)}
            className={cn(lang === language.code && 'bg-accent font-medium')}
          >
            <span className="mr-2">{language.flag}</span>
            <span className="flex-1">
              {language.nativeLabel}
              {!compact && <span className="ml-2 text-xs text-muted-foreground">{language.label}</span>}
            </span>
            {lang === language.code && <Check size={14} className="text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
