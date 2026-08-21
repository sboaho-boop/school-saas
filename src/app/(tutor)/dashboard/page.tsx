'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTutorAuth } from '@/stores/tutor-auth';
import { useTutorChat } from '@/stores/tutor-chat';
import { Send, Bot, User, RefreshCw, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { VoiceRecorder, speakText } from '@/components/ai/voice-recorder';
import Link from 'next/link';

export default function TutorDashboard() {
  const user = useTutorAuth((s) => s.user);
  const { messages, loading, remaining, sendMessage, sendVoice, resetChat, loadHistory } = useTutorChat();
  const [input, setInput] = useState('');
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  const handleVoiceResult = (data: { transcribed: string; reply: string; language: string }) => {
    useTutorChat.setState((s) => ({
      messages: [
        ...s.messages,
        { role: 'user', content: '🎤 ' + data.transcribed },
        { role: 'assistant', content: data.reply },
      ],
    }));
  };

  const handleVoiceError = (error: string) => {
    useTutorChat.setState((s) => ({
      messages: [...s.messages, { role: 'assistant', content: 'Voice error: ' + error }],
    }));
  };

  const handleVoiceRecorded = async (blob: Blob, language: string) => {
    await sendVoice(blob, language);
  };

  const toggleSpeak = (idx: number, text: string) => {
    if (speakingIdx === idx) {
      window.speechSynthesis?.cancel();
      setSpeakingIdx(null);
    } else {
      window.speechSynthesis?.cancel();
      speakText(text, 'en');
      setSpeakingIdx(idx);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const limitReached = remaining !== null && remaining === 0;

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Teacher Kofi
            </h1>
            <p className="text-xs text-muted-foreground">
              {remaining !== null
                ? remaining === -1 ? 'Unlimited messages today' : remaining + ' messages remaining today'
                : 'Your AI learning companion'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user?.plan === 'free' && (
            <Link href="/tutor/pricing">
              <Button variant="outline" size="sm" className="text-violet-600 border-violet-300 hover:bg-violet-50">
                Upgrade
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={resetChat}>
            <RefreshCw size={14} className="mr-2" /> New Chat
          </Button>
        </div>
      </div>

      {limitReached && (
        <Card className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-orange-500" />
              <div>
                <p className="text-sm font-medium">Daily limit reached</p>
                <p className="text-xs text-muted-foreground">Upgrade to Pro for 100 messages/day</p>
              </div>
            </div>
            <Link href="/tutor/pricing">
              <Button size="sm" className="bg-gradient-to-r from-violet-500 to-fuchsia-500">Upgrade</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card className="flex-1 border-border/50 shadow-sm overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="size-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div className="max-w-[80%] flex flex-col gap-1">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted/50 text-foreground rounded-bl-md border border-border/30'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && i > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-fit text-xs text-muted-foreground"
                      onClick={() => toggleSpeak(i, msg.content)}
                    >
                      {speakingIdx === i ? <VolumeX size={12} className="mr-1" /> : <Volume2 size={12} className="mr-1" />}
                      {speakingIdx === i ? 'Stop' : 'Read aloud'}
                    </Button>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                    <User size={16} className="text-primary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="size-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3 border border-border/30">
                <div className="flex gap-1.5">
                  <span className="size-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="size-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="size-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </CardContent>

        <div className="border-t border-border/50 p-4">
          <div className="flex gap-2 items-center">
            <VoiceRecorder
              onResult={handleVoiceResult}
              onError={handleVoiceError}
              disabled={loading || limitReached}
              endpoint="/tutor/ai/voice"
              onRecorded={handleVoiceRecorded}
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Teacher Kofi anything..."
              disabled={loading || limitReached}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading || limitReached} size="icon">
              <Send size={16} />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Tap 🎤 to speak in English, Twi, Ga, Ewe, Fante, Hausa, or Dagbani. Responses are AI-generated.
          </p>
        </div>
      </Card>
    </div>
  );
}
