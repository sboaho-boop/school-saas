'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTutorChat } from '@/stores/tutor-chat';
import { audioBlobToWav } from '@/lib/audio-to-wav';

const SILENCE_MS = 1100;      // how long of quiet before we send the utterance
const RMS_THRESHOLD = 0.012;  // below this = "silence"

type SessionState = 'idle' | 'listening' | 'thinking' | 'paused';

function isSession(s: SessionState | string | undefined, value: SessionState): boolean {
  return (s as SessionState) === value;
}

interface ActiveRecorder {
  mediaRecorder: MediaRecorder;
  chunks: Blob[];
  stream: MediaStream;
}

interface ActiveLoop {
  audioContext: AudioContext;
  stopNode: () => void;
  recorder: ActiveRecorder | null;
}

export function VoiceConversation() {
  const sendVoice = useTutorChat((s) => s.sendVoice);
  const [session, setSession] = useState<SessionState>('idle');
  const [status, setStatus] = useState('');
  const loopRef = useRef<ActiveLoop | null>(null);
  const sessionRef = useRef<SessionState>('idle');
  const thinkingRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const silenceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  function clearTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    if (silenceTimerRef.current) { window.clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
  }

  function setStatusText(t: string) {
    setStatus(t);
  }

  // Safely finish the current utterance via its MediaRecorder (triggers onstop → send).
  function finalizeUtterance() {
    const rec = loopRef.current?.recorder;
    if (rec && rec.mediaRecorder.state === 'recording') {
      rec.mediaRecorder.stop();
      loopRef.current!.recorder = null;
    }
  }

  async function start() {
    if (loopRef.current) return;
    setStatusText('Starting…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AC();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const dataArray = new Float32Array(analyser.fftSize);

      let recorder: ActiveRecorder | null = null;
      let lastActivityMs = Date.now();
      let hadSpeech = false;
      let streamOn = true;

      async function processActiveUtterance(rec: ActiveRecorder, language: string) {
        if (isSession(sessionRef.current, 'paused') || isSession(sessionRef.current, 'idle')) return;
        if (thinkingRef.current) return;
        const raw = new Blob(rec.chunks, { type: rec.mediaRecorder.mimeType });
        const { blob, mime } = await audioBlobToWav(raw);
        thinkingRef.current = true;
        setSession('thinking');
        setStatusText('Teacher Kofi is thinking…');
        try {
          await sendVoice(blob, language, mime);
        } catch {
          setStatusText('Sorry, there was a problem. Try again.');
        }
        thinkingRef.current = false;
        if (isSession(sessionRef.current, 'paused') || isSession(sessionRef.current, 'idle')) return;
        if (loopRef.current && !loopRef.current.recorder) {
          armRecorder();
        }
        setSession('listening');
        setStatusText('Listening… speak when ready');
      }

      function armRecorder() {
        if (!streamOn) return;
        const mr = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm',
        });
        const rec: ActiveRecorder = { mediaRecorder: mr, chunks: [], stream };
        mr.ondataavailable = (e) => { if (e.data.size > 0) rec.chunks.push(e.data); };
        mr.onstop = async () => {
          const isThinking = thinkingRef.current;
          if (!isThinking && sessionRef.current !== 'idle' && rec.chunks.length > 0) {
            await processActiveUtterance(rec, 'en');
          }
        };
        mr.start();
        recorder = rec;
        loopRef.current!.recorder = rec;
      }

      function teardown() {
        clearTimers();
        streamOn = false;
        if (recorder && recorder.mediaRecorder.state !== 'inactive') {
          try { recorder.mediaRecorder.stop(); } catch {}
        }
        source.disconnect();
        audioContext.close().catch(() => {});
        stream.getTracks().forEach((t) => t.stop());
        loopRef.current = null;
        recorder = null;
      }

      loopRef.current = { audioContext, recorder: null, stopNode: teardown };

      // VAD loop: sample RMS; when quiet follows speech, finalize the utterance.
      function tick() {
        if (!streamOn) return;
        analyser.getFloatTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i] * dataArray[i];
        const rms = Math.sqrt(sum / dataArray.length);
        const now = Date.now();

        if (rms >= RMS_THRESHOLD) {
          lastActivityMs = now;
          hadSpeech = true;
        } else if (hadSpeech && (now - lastActivityMs) >= SILENCE_MS) {
          hadSpeech = false;
          finalizeUtterance();
          lastActivityMs = now;
        }

        // Ensure a recorder is armed whenever we're actively listening.
        if (
          sessionRef.current === 'listening' &&
          !thinkingRef.current &&
          loopRef.current &&
          !loopRef.current.recorder
        ) {
          armRecorder();
        }
      }

      const interval = window.setInterval(tick, 60);
      timersRef.current.push(interval);
      armRecorder();
      setSession('listening');
      setStatusText('Listening… speak when ready');
    } catch {
      setStatusText('Microphone access denied. Please allow mic access and try again.');
      setSession('idle');
    }
  }

  function stop() {
    clearTimers();
    const loop = loopRef.current;
    if (loop) {
      loop.stopNode();
    }
    thinkingRef.current = false;
    loopRef.current = null;
    setSession('idle');
    setStatusText('');
  }

  function togglePause() {
    if (session !== 'listening' && session !== 'paused') return;
    if (sessionRef.current === 'listening') {
      setSession('paused');
      setStatusText('Paused — tap play to continue');
    } else if (sessionRef.current === 'paused') {
      setSession('listening');
      setStatusText('Listening… speak when ready');
    }
  }

  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = session !== 'idle';

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={active ? 'destructive' : 'outline'}
        size="icon"
        className={`shrink-0 ${active ? 'animate-pulse' : ''}`}
        onClick={active ? stop : start}
        title={active ? 'End voice conversation' : 'Start a voice conversation with Teacher Kofi'}
      >
        {session === 'thinking' ? <Loader2 size={16} className="animate-spin" /> : active ? <MicOff size={16} /> : <Mic size={16} />}
      </Button>
      {active && (
        <>
          <Button variant="outline" size="icon" onClick={togglePause} title={session === 'paused' ? 'Continue' : 'Pause'}>
            {session === 'paused' ? <Play size={16} /> : <Pause size={16} />}
          </Button>
          <span className="text-xs text-muted-foreground min-w-[0] max-w-[140px] truncate">{status}</span>
        </>
      )}
    </div>
  );
}
