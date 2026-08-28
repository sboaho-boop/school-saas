'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';
import { Send, Bot, User, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { VoiceRecorder, speakText } from '@/components/ai/voice-recorder';
import { KofiMessage } from '@/components/ai/kofi-message';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MESSAGE = "Hi! I'm Teacher Kofi, your AI learning companion 🎉\n\nI can help you with:\n• Mathematics 📐\n• English 📖\n• Science 🔬\n• Ghanaian languages (Twi, Ga, Ewe, Fante, Dagbani) 🗣️\n• Homework help 📝\n• Quizzes and learning games 🎮\n\nWhat would you like to learn today?";

export default function AITutorPage() {
  const user = useAuthStore((s) => s.currentUser);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await api.post<{ reply: string }>('/ai/chat', {
        message: userMsg,
        history,
        studentContext: user ? { grade: user.role, age: null, language: 'English' } : null,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (data: { transcribed: string; reply: string; language: string }) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: `🎤 ${data.transcribed}` },
      { role: 'assistant', content: data.reply },
    ]);
  };

  const handleVoiceError = (error: string) => {
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `Voice error: ${error}` },
    ]);
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

  const resetChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingIdx(null);
    setMessages([{ role: 'assistant', content: WELCOME_MESSAGE }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Teacher Kofi</h1>
            <p className="text-xs text-muted-foreground">Your AI learning companion</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={resetChat}>
          <RefreshCw size={14} className="mr-2" /> New Chat
        </Button>
      </div>

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
                    {msg.role === 'user' ? msg.content : <KofiMessage content={msg.content} />}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
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
            <VoiceRecorder onResult={handleVoiceResult} onError={handleVoiceError} disabled={loading} />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Teacher Kofi anything..."
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading} size="icon">
              <Send size={16} />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Tap 🎤 to speak in English, Twi, Ga, Ewe, Fante, Hausa, or Dagbani. Responses are AI-generated — verify important information.
          </p>
        </div>
      </Card>
    </div>
  );
}
