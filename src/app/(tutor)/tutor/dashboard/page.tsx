'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTutorAuth, tutorRequest } from '@/stores/tutor-auth';
import { useTutorChat, mediaSrc } from '@/stores/tutor-chat';
import { Send, Bot, User, RefreshCw, Volume2, VolumeX, AlertTriangle, CheckCircle2, Loader2, Image as ImageIcon, Camera as CameraIcon, Sparkles } from 'lucide-react';
import { KofiMessage } from '@/components/ai/kofi-message';
import { VoiceRecorder, speakText } from '@/components/ai/voice-recorder';
import { VoiceLesson } from '@/components/ai/voice-conversation';
import { TutorSubscriptionCard } from '@/components/tutor/subscription-card';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function TutorDashboardContent() {
  const user = useTutorAuth((s) => s.user);
  const fetchMe = useTutorAuth((s) => s.fetchMe);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { messages, loading, remaining, sendMessage, sendVoice, sendImage, sendPhoto, resetChat, loadHistory } = useTutorChat();
  const [input, setInput] = useState('');
  const [imageMode, setImageMode] = useState(false);
  const [imgStyle, setImgStyle] = useState<'cartoon' | 'real'>('cartoon');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [verifying, setVerifying] = useState(false);
  const [upgradeNotice, setUpgradeNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const verifyRanRef = useRef(false);

  useEffect(() => {
    if (searchParams.get('upgraded') === '1' && !verifyRanRef.current) {
      verifyRanRef.current = true;
      const reference = searchParams.get('reference') || searchParams.get('trxref') || '';
      setVerifying(true);
      (async () => {
        try {
          let plan = '';
          if (reference) {
            const res = await tutorRequest<{ plan?: string }>('/tutor/subscription/verify', {
              method: 'POST',
              body: JSON.stringify({ reference }),
            });
            plan = res.plan || '';
          }
          await fetchMe();
          const label = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : '';
          setUpgradeNotice({
            type: 'success',
            text: label ? `Welcome to Teacher Kofi ${label}! Your upgrade is active.` : 'Your upgrade is active!',
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : '';
          setUpgradeNotice({ type: 'error', text: message || 'We could not confirm your payment. If you were charged, contact support for help.' });
          await fetchMe().catch(() => {});
        } finally {
          setVerifying(false);
          router.replace('/tutor/dashboard', { scroll: false });
        }
      })();
    }
  }, [searchParams, fetchMe, router]);

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
    if (imageMode) {
      setImageMode(false);
      await sendImage(msg, imgStyle);
    } else {
      await sendMessage(msg);
    }
  };

  const handleAttachPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || loading || limitReached) return;
    const caption = input.trim();
    setInput('');
    await sendPhoto(file, caption);
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

  const handleVoiceRecorded = async (blob: Blob, language: string, mime?: string) => {
    await sendVoice(blob, language, mime);
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

      {(verifying || upgradeNotice) && (
        <Card className={`mb-4 ${upgradeNotice?.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800' : 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800'}`}>
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {verifying ? (
                <Loader2 size={20} className="animate-spin text-violet-500 shrink-0" />
              ) : (
                <CheckCircle2 size={20} className={upgradeNotice?.type === 'error' ? 'text-red-500 shrink-0' : 'text-emerald-500 shrink-0'} />
              )}
              <div>
                {verifying ? (
                  <>
                    <p className="text-sm font-medium">Confirming your subscription...</p>
                    <p className="text-xs text-muted-foreground">Please wait a moment.</p>
                  </>
                ) : (
                  <p className={`text-sm font-medium ${upgradeNotice?.type === 'error' ? 'text-red-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {upgradeNotice?.text}
                  </p>
                )}
              </div>
            </div>
            {!verifying && (
              <Button size="sm" variant="outline" onClick={() => setUpgradeNotice(null)}>Dismiss</Button>
            )}
          </CardContent>
        </Card>
      )}

      {user && <TutorSubscriptionCard />}

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

      <VoiceLesson />

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
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted/50 text-foreground rounded-bl-md border border-border/30'}`}>
                    {msg.role === 'user' ? (
                      <>
                        {msg.content}
                        {msg.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaSrc(msg.image)}
                            alt="Attached photo"
                            className="mt-2 w-full max-w-xs rounded-xl border border-black/10 shadow-sm"
                          />
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <KofiMessage content={msg.content} />
                        {msg.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaSrc(msg.image)}
                            alt="Teacher Kofi drawing"
                            className="w-full max-w-sm rounded-xl border border-border/40 shadow-sm"
                          />
                        )}
                      </div>
                    )}
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
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAttachPhoto} />
          <div className="flex gap-2 items-center">
            <VoiceRecorder
              onResult={handleVoiceResult}
              onError={handleVoiceError}
              disabled={loading || limitReached}
              endpoint="/tutor/ai/voice"
              onRecorded={handleVoiceRecorded}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || limitReached}
              title="Attach a photo for Teacher Kofi to look at"
            >
              <CameraIcon size={16} />
            </Button>
            <Button
              variant={imageMode ? 'default' : 'outline'}
              size="icon"
              onClick={() => setImageMode((v) => !v)}
              disabled={loading || limitReached}
              className={imageMode ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : ''}
              title={imageMode ? 'Back to chat' : 'Ask Teacher Kofi to draw a picture'}
            >
              <ImageIcon size={16} />
            </Button>
            {imageMode && (
              <div className="flex items-center gap-1 rounded-lg border border-border/60 p-0.5">
                <Button
                  variant={imgStyle === 'cartoon' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setImgStyle('cartoon')}
                >
                  🎨 Cartoon
                </Button>
                <Button
                  variant={imgStyle === 'real' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setImgStyle('real')}
                >
                  <Sparkles size={12} className="mr-1" /> Real photo
                </Button>
              </div>
            )}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                imageMode
                  ? imgStyle === 'real'
                    ? 'Describe a real photo for Kofi to create...'
                    : 'Describe a picture for Kofi to draw...'
                  : 'Ask Teacher Kofi anything...'
              }
              disabled={loading || limitReached}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading || limitReached} size="icon">
              {imageMode ? <ImageIcon size={16} /> : <Send size={16} />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {imageMode
              ? imgStyle === 'real'
                ? '✨ Real photo mode — e.g. "a realistic photo of our school compound at sunrise" or "a realistic photo of a jollof rice bowl".'
                : '🎨 Tell Kofi what to draw — e.g. "a fraction pizza with 4 slices" or "a diagram of the water cycle".'
              : 'Tap 🎤 to speak, add a 📷 photo for Kofi to look at, or type. Responses are AI-generated.'}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function TutorDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Loading...</div>
    }>
      <TutorDashboardContent />
    </Suspense>
  );
}
