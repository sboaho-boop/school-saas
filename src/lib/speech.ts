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
