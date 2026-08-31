'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useTutorChat } from '@/stores/tutor-chat';
import { audioBlobToWav } from '@/lib/audio-to-wav';
import { speakText } from '@/lib/speech';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tw', label: 'Twi', flag: '🇬🇭' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ga', label: 'Ga', flag: '🇬🇭' },
  { code: 'ewe', label: 'Ewe', flag: '🇬🇭' },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
];

const LESSON_IDEAS = [
  { label: 'Maths quiz', emoji: '➕', prompt: 'Let us start a fun maths quiz for me. Ask me one question at a time and wait for my answer.' },
  { label: 'Fractions', emoji: '🍕', prompt: 'Teach me fractions using pizza and food. Ask me a simple question.' },
  { label: 'Spelling', emoji: '✏️', prompt: 'Give me a spelling test. Say a word and ask me to spell it.' },
  { label: 'Stories', emoji: '📖', prompt: 'Let us make up a fun story together. You start the story and ask me what happens next.' },
  { label: 'Science', emoji: '🔬', prompt: 'Teach me a simple science fact and ask me a question about it.' },
  { label: 'Counting', emoji: '🔢', prompt: 'Let us practice counting. Count with me and ask me to count along.' },
];

type Stage = 'idle' | 'listening' | 'recording' | 'thinking' | 'ready';

export function VoiceLesson() {
  const sendVoice = useTutorChat((s) => s.sendVoice);
  const sendLessonPrompt = useTutorChat((s) => s.sendLessonPrompt);
  const [stage, setStage] = useState<Stage>('idle');
  const [language, setLanguage] = useState('en');
  const [status, setStatus] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const busyRef = useRef(false);
  const sessionOpenRef = useRef(false);
  const stageRef = useRef<Stage>('idle');
  const langRef = useRef('en');

  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { langRef.current = language; }, [language]);

  function setStatusText(t: string) {
    setStatus(t);
  }

  async function ensureStream(): Promise<MediaStream | null> {
    if (streamRef.current) return streamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      return stream;
    } catch {
      setStatusText('Please allow the microphone so Teacher Kofi can hear you.');
      return null;
    }
  }

  function startRecording() {
    if (!streamRef.current) return;
    const mr = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm',
    });
    chunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => sendRecordedChunks();
    mr.start();
    mediaRecorderRef.current = mr;
    setStage('recording');
    setStatusText('I am listening… let go when you finish');
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }

  async function sendRecordedChunks() {
    if (busyRef.current || !sessionOpenRef.current) return;
    const raw = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
    if (raw.size === 0) {
      setStage(stageRef.current === 'ready' ? 'ready' : 'listening');
      return;
    }
    busyRef.current = true;
    const { blob, mime } = await audioBlobToWav(raw);
    setStage('thinking');
    setStatusText('Teacher Kofi is thinking…');
    try {
      const lang = langRef.current;
      const data = await sendVoice(blob, lang, mime);
      if (data.reply) await speakText(data.reply, data.language || lang);
    } catch {
      setStatusText('Sorry, I could not hear that. Try again.');
    }
    busyRef.current = false;
    if (stageRef.current === 'idle' || stageRef.current === 'thinking') {
      setStage('listening');
      setStatusText('Tap and hold the mic to talk');
    } else {
      setStage(stageRef.current);
    }
  }

  const beginTalk = async () => {
    if (busyRef.current) return;
    const stream = await ensureStream();
    if (!stream) return;
    if (stage === 'thinking') return;
    sessionOpenRef.current = true;
    startRecording();
  };

  const endTalk = () => {
    if (stageRef.current === 'recording') {
      stopRecording();
    }
  };

  // Tap/toggle fallback for touch devices: a short tap on the mic starts or stops.
  async function startLesson(prompt: string) {
    if (busyRef.current) return;
    sessionOpenRef.current = true;
    // Start listening so the student can then hold-to-talk.
    if (!streamRef.current) {
      const stream = await ensureStream();
      if (!stream) return;
    }
    if (stageRef.current === 'idle') {
      setStage('listening');
      setStatusText('Great! Start a lesson below, or tap the mic to talk');
    }
    busyRef.current = true;
    const lang = langRef.current;
    const reply = await sendLessonPrompt(prompt);
    if (reply) await speakText(reply, lang);
    busyRef.current = false;
    if (stageRef.current !== 'idle') {
      setStage('listening');
      setStatusText('Tap and hold the mic to talk');
    }
  }

  function endSession() {
    sessionOpenRef.current = false;
    busyRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStage('idle');
    setStatusText('');
  }

  useEffect(() => {
    return () => endSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = stage !== 'idle';

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 dark:border-violet-800/40 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
          🗣️ Talk to Teacher Kofi
        </p>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-8 rounded-lg border border-violet-300 bg-white text-xs px-2 dark:bg-card dark:border-violet-800"
            aria-label="Lesson language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>
          {active && (
            <button
              onClick={endSession}
              className="h-8 rounded-lg border border-violet-300 px-3 text-xs text-violet-700 hover:bg-violet-100 dark:text-violet-300 dark:hover:bg-violet-900/40 dark:border-violet-800"
            >
              End
            </button>
          )}
        </div>
      </div>

      {stage === 'idle' && (
        <div className="mb-3">
          <p className="text-xs text-violet-600 dark:text-violet-400 mb-2">Pick a lesson to start:</p>
          <div className="flex flex-wrap gap-2">
            {LESSON_IDEAS.map((idea) => (
              <button
                key={idea.label}
                onClick={() => startLesson(idea.prompt)}
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1.5 text-sm font-medium text-violet-700 shadow-sm hover:bg-violet-100 active:scale-95 transition dark:bg-card dark:text-violet-300 dark:border-violet-800 dark:hover:bg-violet-900/40"
              >
                <span>{idea.emoji}</span> {idea.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onPointerDown={(e) => { e.preventDefault(); beginTalk(); }}
          onPointerUp={(e) => { e.preventDefault(); endTalk(); }}
          onPointerCancel={() => endTalk()}
          onPointerLeave={() => { if (stageRef.current === 'recording') endTalk(); }}
          disabled={stage === 'thinking'}
          title={active ? 'Hold to talk, let go to send' : 'Start talking to Teacher Kofi'}
          className={[
            'relative size-20 rounded-full flex items-center justify-center transition select-none touch-none',
            stage === 'recording' ? 'bg-red-500 text-white animate-pulse' : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg hover:shadow-xl active:scale-95',
            stage === 'thinking' ? 'opacity-70' : '',
          ].join(' ')}
        >
          {stage === 'recording' ? (
            <MicOff size={30} />
          ) : stage === 'thinking' ? (
            <Loader2 size={30} className="animate-spin" />
          ) : (
            <Mic size={30} />
          )}
        </button>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
            {stage === 'idle' || stage === 'listening' ? 'Tap and hold the mic to talk' : stage === 'recording' ? 'Keep talking…' : stage === 'thinking' ? 'Teacher Kofi is answering…' : ''}
          </p>
          {status && <p className="text-xs text-violet-500 dark:text-violet-400">{status}</p>}
        </div>
        {stage === 'idle' && language !== 'en' && (
          <p className="text-xs text-violet-500 dark:text-violet-400 ml-auto">Kofi will reply in {LANGUAGES.find((l) => l.code === language)?.label}</p>
        )}
      </div>
    </div>
  );
}
