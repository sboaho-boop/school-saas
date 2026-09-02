import { LANGUAGES } from '@/i18n/translations';

export const VOICE_LANGUAGES = LANGUAGES.map((l) => ({
  code: l.code,
  label: l.nativeLabel,
  flag: l.flag,
}));
