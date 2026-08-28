'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { audioBlobToWav } from '@/lib/audio-to-wav';

export { speakText } from '@/lib/speech';

const VOICE_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'tw', label: 'Twi' },
  { code: 'ha', label: 'Hausa' },
  { code: 'ga', label: 'Ga' },
  { code: 'ewe', label: 'Ewe' },
  { code: 'fante', label: 'Fante' },
  { code: 'dagbani', label: 'Dagbani' },
];

interface VoiceRecorderProps {
  onResult: (data: { transcribed: string; reply: string; language: string }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  endpoint?: string;
  onRecorded?: (blob: Blob, language: string, mime: string) => void;
}

export function VoiceRecorder({ onResult, onError, disabled, endpoint = '/ai/voice', onRecorded }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [language, setLanguage] = useState('en');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function sendAudio(blob: Blob, mime?: string) {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, mime === 'audio/wav' ? 'voice.wav' : 'voice.webm');
      formData.append('mime', mime || blob.type || 'audio/wav');
      formData.append('language', language);
      formData.append('history', '[]');

      const token = localStorage.getItem('edu_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Voice processing failed');
      await onResult({ transcribed: data.transcribed, reply: data.reply, language: data.language });
    } catch (err: any) {
      onError(err.message || 'Voice processing failed');
    } finally {
      setProcessing(false);
    }
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const raw = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const { blob, mime } = await audioBlobToWav(raw);
        if (onRecorded) {
          onRecorded(blob, language, mime);
        } else {
          await sendAudio(blob, mime);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      onError('Microphone access denied. Please allow microphone access and try again.');
    }
  }, [onError, language, onRecorded]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  const isActive = recording || processing;

  return (
    <div className="flex items-center gap-2">
      <Select value={language} onValueChange={(v) => v && setLanguage(v)} disabled={disabled || processing}>
        <SelectTrigger className="w-[100px] h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VOICE_LANGUAGES.map((l) => (
            <SelectItem key={l.code} value={l.code} className="text-xs">
              {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant={recording ? 'destructive' : 'outline'}
        size="icon"
        className={`shrink-0 ${recording ? 'animate-pulse' : ''}`}
        disabled={disabled || processing}
        onClick={recording ? stopRecording : startRecording}
        title={recording ? 'Stop recording' : 'Start voice message'}
      >
        {processing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : recording ? (
          <MicOff size={16} />
        ) : (
          <Mic size={16} />
        )}
      </Button>
    </div>
  );
}
