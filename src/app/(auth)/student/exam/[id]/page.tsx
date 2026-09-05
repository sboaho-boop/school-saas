'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock,
  Loader2,
  LogOut,
  Send,
  XCircle,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api, getToken, setToken } from '@/lib/api';

const TYPE_LABEL: Record<string, string> = { mcq: 'Multiple Choice', truefalse: 'True/False', number: 'Short Answer', theory: 'Theory' };

function formatClock(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [phase, setPhase] = useState<'loading' | 'taking' | 'result'>('loading');
  const [error, setError] = useState('');
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [violations, setViolations] = useState(0);

  const answersRef = useRef<Record<string, string>>({});
  const examRef = useRef<any>(null);
  const startedAtRef = useRef<string>('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSubmittedRef = useRef(false);

  const setAnswersSafe = useCallback((updater: (prev: Record<string, string>) => Record<string, string>) => {
    setAnswers((prev) => {
      const next = updater(prev);
      answersRef.current = next;
      return next;
    });
  }, []);

  const persist = useCallback(async () => {
    if (!examRef.current) return;
    setSaving(true);
    try {
      await api.post(`/student/exam/${examRef.current.id}/save`, { answers: answersRef.current });
      setSaveMsg('Saved');
    } catch {
      setSaveMsg('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 2500);
    }
  }, []);

  const submitExam = useCallback(async () => {
    if (!examRef.current || autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post<any>(`/student/exam/${examRef.current.id}/submit`);
      setResult({ ...res, examId: examRef.current.id });
      setPhase('result');
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to submit the exam. Please retry.');
      autoSubmittedRef.current = false;
    } finally {
      setSubmitting(false);
      setShowSubmit(false);
    }
  }, []);

  // load exam + init
  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/student/login'); return; }
    let cancelled = false;

    (async () => {
      try {
        const data = await api.get<any>(`/student/exam/list`);
        const entry = (data.exams || []).find((e: any) => e.id === examId);
        if (!entry) throw new Error('Exam not found');
        if (entry.status === 'graded' || entry.status === 'submitted') {
          const r = await api.get<any>(`/student/exam/${examId}/result`);
          if (!cancelled) { setResult(r); setPhase('result'); }
          return;
        }

        const start = await api.post<any>(`/student/exam/${examId}/start`);
        if (cancelled) return;
        examRef.current = start;
        startedAtRef.current = start.startedAt;
        setExam(start);
        setQuestions(start.questions || []);
        const initAnswers: Record<string, string> = {};
        (start.questions || []).forEach((q: any) => initAnswers[q.id] = '');
        Object.keys(start.savedAnswers || {}).forEach((k: string) => {
          const v = start.savedAnswers[k];
          if (v !== undefined && v !== null) initAnswers[k] = String(v);
        });
        answersRef.current = initAnswers;
        setAnswers(initAnswers);
        setPhase('taking');
        const ms = new Date(start.startedAt).getTime() + (parseInt(start.duration) || 0) * 60000;
        setRemaining(Math.max(0, Math.floor((ms - Date.now()) / 1000)));
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load exam');
      }
    })();

    return () => { cancelled = true; };
  }, [examId, router]);

  // countdown + auto-submit
  useEffect(() => {
    if (phase !== 'taking') return;
    if (remaining <= 0) { submitExam(); return; }
    const t = setInterval(() => {
      setRemaining((r) => {
        if (autoSubmittedRef.current) return r;
        const next = r - 1;
        if (next <= 0) {
          clearInterval(t);
          submitExam();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, remaining, submitExam]);

  // debounced auto-save on answer change
  useEffect(() => {
    if (phase !== 'taking') return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { persist(); }, 1500);
    const interval = setInterval(() => { persist(); }, 25000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      clearInterval(interval);
    };
  }, [answers, phase, persist]);

  // anti-cheat watchers
  useEffect(() => {
    if (phase !== 'taking') return;
    const onHide = () => {
      setViolations((v) => {
        const next = v + 1;
        if (next >= 3 && !autoSubmittedRef.current) {
          setTimeout(() => submitExam(), 500);
        }
        return next;
      });
    };
    const onVis = () => { if (document.hidden) onHide(); };
    const onBlur = () => onHide();
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [phase, submitExam]);

  const answeredCount = useMemo(() => questions.filter((q) => answers[q.id] && answers[q.id].trim() !== '').length, [questions, answers]);

  const setAnswer = useCallback((qid: string, val: string) => {
    setAnswersSafe((prev) => ({ ...prev, [qid]: val }));
  }, [setAnswersSafe]);

  const handleLogout = () => { setToken(null); router.push('/student/login'); };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading exam...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="border-border/50 shadow-sm w-full max-w-sm">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><XCircle size={16} className="text-red-500" />Cannot Start Exam</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button size="sm" variant="outline" onClick={() => router.push('/student/dashboard')}><ArrowLeft size={14} className="mr-1" />Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'result' && result) {
    const theoryPending = result.pendingTheory && !result.graded;
    return (
      <div className="min-h-screen bg-background pb-16">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <Logo iconOnly size="sm" />
              <span className="font-semibold text-sm truncate">{exam?.title || result.title || 'Exam Result'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/student/dashboard')}><ArrowLeft size={14} className="mr-1" />Dashboard</Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut size={14} className="mr-1" />Sign Out</Button>
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto p-4 space-y-4">
          {theoryPending && (
            <Card className="border-amber-300/60 bg-amber-50/60">
              <CardContent className="p-4 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Your theory answers are being marked.</p>
                  <p className="text-xs mt-0.5">Your multiple-choice and short-answer questions were graded automatically. A teacher will grade your theory section soon.</p>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground mb-2">Exam complete</p>
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 size={22} className="text-green-500" />
                <p className="text-3xl font-bold tabular-nums">{result.score ?? 0}<span className="text-base text-muted-foreground font-medium"> / {result.totalScore ?? 0}</span></p>
              </div>
              <div className="flex items-center justify-center gap-2 mt-3">
                {result.grade ? <Badge className="text-sm px-3 py-1">Grade: {result.grade}</Badge> : <Badge variant="outline" className="text-sm px-3 py-1">Pending</Badge>}
                <Badge variant="secondary" className="text-sm px-3 py-1">{Math.round(((result.score ?? 0) / (result.totalScore || 1)) * 100)}%</Badge>
              </div>
              {result.status === 'submitted' && !result.graded && <p className="text-xs text-muted-foreground mt-3">Submitted for grading — check back later for your full result.</p>}
            </CardContent>
          </Card>

          <div className="space-y-2">
            {(result.questions || []).map((q: any, i: number) => {
              const isCorrect = q.correct;
              return (
                <Card key={q.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[q.type] || q.type}</Badge>
                      <span className="text-[11px] text-muted-foreground">{q.earned ?? 0} / {q.points} pts</span>
                    </div>
                    <p className="text-sm font-medium mb-2"><span className="text-muted-foreground mr-1">Q{i + 1}.</span>{q.questionText}</p>
                    <div className="flex items-start gap-2 text-sm">
                      {isCorrect ? <CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" /> : <XCircle size={15} className="text-red-500 mt-0.5 shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-muted-foreground break-words"><span className="text-muted-foreground/70">Your answer:</span> {q.answer || <span className="italic">No answer</span>}</p>
                        {q.graded === true && q.type === 'theory' ? null : !q.correct && q.correctAnswer && (
                          <p className="text-green-600 mt-0.5 break-words"><span className="text-muted-foreground/70">Correct:</span> {q.correctAnswer}</p>
                        )}
                        {q.teacherFeedback && <p className="text-primary mt-1 text-xs break-words">Feedback: {q.teacherFeedback}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button size="sm" onClick={() => router.push('/student/dashboard')}><ArrowLeft size={14} className="mr-1" />Back to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  const q = questions[current];
  const secondsLeft = remaining;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Logo iconOnly size="sm" />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{exam?.title}</p>
              <p className="text-[10px] text-muted-foreground">{exam?.totalPoints ?? 0} marks · {exam?.duration} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${secondsLeft < 60 ? 'text-red-600' : 'text-foreground'}`}>
              <Clock size={15} />{formatClock(secondsLeft)}
            </span>
            <Button size="sm" variant="outline" className="text-[11px]" onClick={() => setShowSubmit(true)} disabled={submitting}>
              <Send size={13} className="mr-1" />Submit
            </Button>
          </div>
        </div>
      </header>

      {violations > 0 && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-2 text-xs text-red-700">
            <AlertTriangle size={14} className="shrink-0" />
            <span>Leaving this window is not allowed. Violation {violations}/3 — the exam will auto-submit at 3.</span>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{answeredCount}/{questions.length} answered</span>
              <span className="font-medium tabular-nums">{Math.round(answeredCount / Math.max(questions.length, 1) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${answeredCount / Math.max(questions.length, 1) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        {q ? (
          <Card key={q.id} className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[q.type] || q.type}</Badge>
                <span className="text-[11px] text-muted-foreground">{q.points} pt{q.points !== 1 ? 's' : ''}</span>
              </div>
              <CardTitle className="text-base leading-snug pt-1"><span className="text-muted-foreground mr-1">Q{current + 1}.</span>{q.questionText}</CardTitle>
            </CardHeader>
            <CardContent>
              {(q.type === 'mcq' || q.type === 'truefalse') && (
                <div className="space-y-2">
                  {(q.options || []).map((opt: string, oi: number) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setAnswer(q.id, opt)}
                        className={`w-full text-left text-sm rounded-lg border px-3 py-2.5 transition-colors ${selected ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border/60 hover:border-primary/40'}`}
                      >
                        <span className="inline-block w-6 text-muted-foreground mr-1">{String.fromCharCode(65 + oi)}.</span>{opt}
                      </button>
                    );
                  })}
                </div>
              )}
              {q.type === 'number' && (
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Type your answer"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  className="text-sm"
                />
              )}
              {q.type === 'theory' && (
                <Textarea
                  rows={5}
                  placeholder="Write your answer here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  className="text-sm"
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No questions in this exam.</CardContent></Card>
        )}

        <div className="flex items-center justify-between">
          <Button size="sm" variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
            <ChevronLeft size={15} className="mr-1" />Previous
          </Button>
          <Button size="sm" variant="outline" disabled={current >= questions.length - 1} onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>
            Next<ArrowRight size={15} className="ml-1" />
          </Button>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-2"><ClipboardList size={14} />Question Navigator</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-1.5">
              {questions.map((qq: any, i: number) => {
                const done = answers[qq.id] && answers[qq.id].trim() !== '';
                const isCurrent = i === current;
                return (
                  <button
                    key={qq.id}
                    type="button"
                    onClick={() => setCurrent(i)}
                    className={`h-8 rounded-md text-xs font-medium transition-colors ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'} ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showSubmit} onOpenChange={(o: boolean) => !submitting && setShowSubmit(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit exam?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {questions.length} questions. {answeredCount < questions.length ? <span className="text-amber-600 font-medium">Some questions are unfinished.</span> : 'All questions have been answered.'} You cannot change your answers after submitting.
            </DialogDescription>
          </DialogHeader>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowSubmit(false)} disabled={submitting}>Keep Working</Button>
            <Button size="sm" onClick={() => submitExam()} disabled={submitting}>
              {submitting ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Send size={14} className="mr-1" />}{submitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}