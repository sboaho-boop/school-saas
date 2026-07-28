'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { api, getToken, setToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Send, Bot, User, Sparkles, RefreshCw, MessageCircle, LogOut, ArrowLeft, GraduationCap } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MESSAGE = "Hi there! I'm Teacher Kofi, your AI study companion 🎉\n\nI can help you with:\n• Mathematics 📐 — step-by-step working\n• English 📖 — grammar, spelling, reading\n• Science 🔬 — explained with everyday examples\n• Social Studies 🌍 — Ghanaian history and culture\n• Homework help 📝 — I'll guide you, not give answers\n• Ghanaian languages 🗣️ — Twi, Ga, Ewe, Fante, Dagbani\n\nWhat would you like to learn today?";

export default function StudentAITutorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/student/login'); return; }
  }, [router]);

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
      const res = await api.post<{ reply: string }>('/student/ai/chat', { message: userMsg, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't connect. The AI tutor may not be set up yet — ask your school to configure it." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([{ role: 'assistant', content: WELCOME_MESSAGE }]);
  };

  const handleLogout = () => { setToken(null); router.push('/student/login'); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Logo iconOnly size="sm" />
            <span className="font-semibold">Teacher Kofi</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/student/dashboard')}>
              <ArrowLeft size={14} className="mr-1" />Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut size={14} className="mr-1" />Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col">
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
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted/50 text-foreground rounded-bl-md border border-border/30'
                    }`}
                  >
                    {msg.content}
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
            <div className="flex gap-2">
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
              <Button variant="outline" onClick={resetChat} size="icon" title="New chat">
                <RefreshCw size={16} />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Teacher Kofi understands English, Twi, Ga, Ewe, Fante, and Dagbani. Responses are AI-generated — verify important information.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
