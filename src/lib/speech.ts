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

// Ghanaian languages that need cloud voices for correct pronunciation.
const CLOUD_FIRST = ['tw', 'fante', 'ewe', 'ha', 'ga', 'dagbani'];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

let voicesLoaded = false;
function warmVoices() {
  if (voicesLoaded || typeof window === 'undefined' || !window.speechSynthesis) return;
  voicesLoaded = true;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

function hasLocalVoice(lang: string): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  const voices = window.speechSynthesis.getVoices() || [];
  const base = lang.toLowerCase();
  return voices.some((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(base));
}

async function speakCloud(text: string, lang: string): Promise<boolean> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tutor_token') : null;
    if (!token) return false;
    const res = await fetch(`${API_URL}/tutor/ai/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ text, lang }),
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    if (!blob || blob.size === 0) return false;
    return await new Promise<boolean>((resolve) => {
      const url = URL.createObjectURL(blob);
      const audio = new window.Audio();
      audio.src = url;
      audio.onended = () => { URL.revokeObjectURL(url); resolve(true); };
      audio.onerror = () => { URL.revokeObjectURL(url); resolve(false); };
      audio.play().catch(() => { URL.revokeObjectURL(url); resolve(false); });
    });
  } catch {
    return false;
  }
}

async function speakBrowser(text: string, lang: string): Promise<void> {
  await new Promise<void>((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return resolve();
    warmVoices();
    if (!text) return resolve();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const bcp47 = VOICE_LANG_BCP47[lang] || 'en-US';
    utterance.lang = bcp47;

    const voices = window.speechSynthesis.getVoices() || [];
    const base = lang.toLowerCase();
    const match =
      voices.find((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(base))
      || voices.find((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith('en-'));
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

export async function speakText(text: string, lang: string = 'en'): Promise<void> {
  if (!text) return;
  const preferCloud = CLOUD_FIRST.includes(lang.toLowerCase()) || !hasLocalVoice(lang);
  if (preferCloud) {
    const ok = await speakCloud(text, lang);
    if (ok) return;
  }
  await speakBrowser(text, lang);
}
