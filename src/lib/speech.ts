const VOICE_LANG_BCP47: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  tw: 'en-US',
  ha: 'ha-NG',
  ga: 'en-US',
  ewe: 'en-US',
  fante: 'en-US',
  dagbani: 'en-US',
};

export interface DeviceVoiceInfo {
  supported: boolean;
  langs: Record<string, boolean>;
  details: string[];
}

function langMatches(lang: string, base: string): boolean {
  const a = lang.replace('_', '-').toLowerCase();
  const b = base.toLowerCase();
  return a === b || a === VOICE_LANG_BCP47[base]?.toLowerCase() || a.startsWith(b);
}

function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  warmVoices();
  return window.speechSynthesis.getVoices() || [];
}

function resolveVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = getVoices();
  const base = lang.toLowerCase();
  return (
    voices.find((v) => v.lang && langMatches(v.lang, base))
    || voices.find((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith('en-'))
    || null
  );
}

export function listDeviceVoices(): string[] {
  return getVoices().map((v) => `${v.name} (${v.lang})`);
}

export function checkDeviceVoices(): DeviceVoiceInfo {
  const voices = getVoices();
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return { supported: false, langs: {}, details: [] };
  }
  const langs: Record<string, boolean> = {};
  for (const base of Object.keys(VOICE_LANG_BCP47)) {
    langs[base] = voices.some((v) => v.lang && langMatches(v.lang, base));
  }
  return {
    supported: voices.length > 0,
    langs,
    details: voices.slice(0, 12).map((v) => `${v.name} (${v.lang})`),
  };
}

let voicesLoaded = false;
function warmVoices() {
  if (voicesLoaded || typeof window === 'undefined' || !window.speechSynthesis) return;
  voicesLoaded = true;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

export async function speakText(text: string, lang: string = 'en'): Promise<void> {
  await new Promise<void>((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return resolve();
    warmVoices();
    if (!text) return resolve();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const bcp47 = VOICE_LANG_BCP47[lang] || 'en-US';
    utterance.lang = bcp47;
    const match = resolveVoice(lang);
    if (match) utterance.voice = match;

    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    let settled = false;
    const done = () => { if (!settled) { settled = true; resolve(); } };
    utterance.onend = done;
    utterance.onerror = done;
    window.speechSynthesis.speak(utterance);
    setTimeout(done, 30000);
  });
}
