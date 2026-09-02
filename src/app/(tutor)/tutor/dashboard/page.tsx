'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTutorAuth, tutorRequest } from '@/stores/tutor-auth';
import { useTutorChat } from '@/stores/tutor-chat';
import { Send, RefreshCw, AlertTriangle, CheckCircle2, Loader2, Image as ImageIcon, Camera as CameraIcon, Sparkles } from 'lucide-react';
import { KofiAvatar } from '@/components/ai/kofi-avatar';
import { ClassroomBoard } from '@/components/ai/classroom-board';
import { VoiceRecorder, speakText } from '@/components/ai/voice-recorder';
import { VoiceLesson } from '@/components/ai/voice-conversation';
import { TutorSubscriptionCard } from '@/components/tutor/subscription-card';
import { TutorProgressCard } from '@/components/tutor/progress-card';
import { TutorCurriculumCard } from '@/components/tutor/curriculum-card';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/stores/locale';

function TutorDashboardContent() {
  const user = useTutorAuth((s) => s.user);
  const fetchMe = useTutorAuth((s) => s.fetchMe);
  const { t, lang } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { messages, loading, remaining, sendMessage, sendVoice, sendImage, sendPhoto, resetChat, loadHistory } = useTutorChat();
  const [input, setInput] = useState('');
  const [imageMode, setImageMode] = useState(false);
  const [imgStyle, setImgStyle] = useState<'cartoon' | 'real'>('cartoon');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
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
            text: label ? t('tutor.welcomeToPlan').replace('{plan}', label) : t('tutor.upgradeActive'),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : '';
          setUpgradeNotice({ type: 'error', text: message || t('tutor.upgradeError') });
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
      speakText(text, lang);
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

  const quickActions = [
    { label: '📚 ' + t('tutor.quizMe'), prompt: 'Give me a short quiz on the last topic we just covered. 3-5 questions with A/B/C/D options. I will answer and you grade me.' },
    { label: '📝 ' + t('tutor.summarize'), prompt: 'Summarize the last lesson we covered into a short, clear study note I can revise from (key points only, easy to remember).' },
    { label: '⬆️ ' + t('tutor.nextLevel'), prompt: 'I understood the last topic. Teach me the next level / more advanced part of it, a little harder this time.' },
    { label: '✏️ ' + t('tutor.checkMyWork'), prompt: 'I am going to show you my schoolwork/answers. Please check it kindly, point out any mistakes gently, and show me how to fix them.' },
  ];

  const runQuickAction = async (prompt: string) => {
    if (loading || limitReached) return;
    await sendMessage(prompt);
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <KofiAvatar size={24} title="Teacher Kofi" />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Teacher Kofi
            </h1>
            <p className="text-xs text-muted-foreground">
              {remaining !== null
                ? remaining === -1 ? t('tutor.unlimitedMessages') : t('tutor.messagesRemaining').replace('{count}', String(remaining))
                : t('tutor.yourCompanionShort')
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user?.plan === 'free' && (
            <Link href="/tutor/pricing">
              <Button variant="outline" size="sm" className="text-violet-600 border-violet-300 hover:bg-violet-50">
                {t('tutor.upgrade')}
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={resetChat}>
            <RefreshCw size={14} className="mr-2" /> {t('tutor.newChat')}
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
                    <p className="text-sm font-medium">{t('tutor.confirmingSubscription')}</p>
                    <p className="text-xs text-muted-foreground">{t('tutor.pleaseWait')}</p>
                  </>
                ) : (
                  <p className={`text-sm font-medium ${upgradeNotice?.type === 'error' ? 'text-red-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {upgradeNotice?.text}
                  </p>
                )}
              </div>
            </div>
            {!verifying && (
              <Button size="sm" variant="outline" onClick={() => setUpgradeNotice(null)}>{t('common.close')}</Button>
            )}
          </CardContent>
        </Card>
      )}

      {user && <TutorSubscriptionCard />}
      {user && <TutorProgressCard />}
      {user && <TutorCurriculumCard />}

      {limitReached && (
        <Card className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-orange-500" />
              <div>
                <p className="text-sm font-medium">{t('tutor.dailyLimitReached')}</p>
                <p className="text-xs text-muted-foreground">{t('tutor.upgradeForMore')}</p>
              </div>
            </div>
            <Link href="/tutor/pricing">
              <Button size="sm" className="bg-gradient-to-r from-violet-500 to-fuchsia-500">{t('tutor.upgrade')}</Button>
            </Link>
          </CardContent>
      </Card>
        )}

      <VoiceLesson />

      <div className="flex-1 flex flex-col min-h-[60vh]">
        <ClassroomBoard
          messages={messages}
          loading={loading}
          speakingIdx={speakingIdx}
          onToggleSpeak={toggleSpeak}
        />

        <div className="mt-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => runQuickAction(a.prompt)}
                disabled={loading || limitReached}
                className="chalk-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
              >
                {a.label}
              </button>
            ))}
          </div>
          <div className="chalk-tray rounded-xl px-3 py-3">
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
                title={t('tutor.attachPhoto')}
                className="bg-white/10 border-white/25 text-white hover:bg-white/20 hover:text-white"
              >
                <CameraIcon size={16} />
              </Button>
              <Button
                variant={imageMode ? 'default' : 'outline'}
                size="icon"
                onClick={() => setImageMode((v) => !v)}
                disabled={loading || limitReached}
                className={imageMode ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' : 'bg-white/10 border-white/25 text-white hover:bg-white/20 hover:text-white'}
                title={imageMode ? t('tutor.backToChat') : t('tutor.askKofiDraw')}
              >
                <ImageIcon size={16} />
              </Button>
              {imageMode && (
                <div className="flex items-center gap-1 rounded-lg border border-white/25 p-0.5 bg-black/20">
                  <Button
                    variant={imgStyle === 'cartoon' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setImgStyle('cartoon')}
                  >
                    {t('tutor.cartoonMode')}
                  </Button>
                  <Button
                    variant={imgStyle === 'real' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setImgStyle('real')}
                  >
                    <Sparkles size={12} className="mr-1" /> {t('tutor.realPhoto')}
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
                      ? t('tutor.describePhoto')
                      : t('tutor.describePicture')
                    : t('tutor.askAnything')
                }
                disabled={loading || limitReached}
                className="flex-1 bg-black/25 border-white/25 text-white placeholder:text-white/60"
              />
              <Button onClick={handleSend} disabled={!input.trim() || loading || limitReached} size="icon" className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-300 hover:to-amber-400">
                {imageMode ? <ImageIcon size={16} /> : <Send size={16} />}
              </Button>
            </div>
            <p className="text-[10px] text-emerald-100/60 mt-2 text-center">
              {imageMode
                ? imgStyle === 'real'
                  ? t('tutor.realPhotoHint')
                  : t('tutor.cartoonHint')
                : t('tutor.tapMicHint')}
            </p>
          </div>
        </div>
      </div>
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
