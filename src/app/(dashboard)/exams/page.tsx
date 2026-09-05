'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useAcademicsStore } from '@/stores/academics';
import { useI18n } from '@/stores/locale';
import { api } from '@/lib/api';
import { FileCheck, Plus, Eye, Clock, CheckCircle, XCircle, Trash2, BarChart3, ArrowLeft, Loader2 } from 'lucide-react';

type QType = 'mcq' | 'truefalse' | 'number' | 'theory';
const TYPE_LABEL: Record<QType, string> = { mcq: 'Multiple Choice', truefalse: 'True/False', number: 'Short Answer', theory: 'Theory' };

interface Question {
  id: string;
  type: QType;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  order?: number;
}

interface Submission {
  id: string;
  student?: { firstName: string; lastName: string; indexNumber?: string };
  answers?: string;
  gradedAnswers?: string;
  score?: number;
  totalScore?: number;
  grade?: string;
  graded?: boolean;
  status: string;
  startedAt?: string;
  submittedAt?: string;
}

interface SubmissionsResponse {
  exam?: { id: string; title: string; passScore: number };
  questions?: Question[];
  submissions?: Submission[];
}

interface AnalyticsQuestion {
  id: string;
  type: QType;
  questionText: string;
  points: number;
  attempted: number;
  correctCount: number;
  accuracy: number;
  averagePoints: number;
}

interface Exam {
  id: string;
  title: string;
  classId: string;
  subjectId?: string;
  description?: string;
  duration: number;
  dueDate: string;
  totalPoints: number;
  passScore: number;
  shuffleQuestions?: boolean;
  allowRetake?: boolean;
  _count?: { questions: number };
}

function parseJson<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export default function ExamsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { classes, subjects, fetchClasses, fetchSubjects } = useAcademicsStore();
  const { t } = useI18n();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<Submission[]>([]);
  const [examQuestionsMeta, setExamQuestionsMeta] = useState<Question[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [analytics, setAnalytics] = useState<{ totalSubmissions: number; average: number; max: number; min: number; passCount: number; passRate: number; perQuestion: AnalyticsQuestion[] } | null>(null);
  const [gradeTarget, setGradeTarget] = useState<Submission | null>(null);
  const [gradeDraft, setGradeDraft] = useState<Record<string, { points: string; feedback: string }>>({});
  const [savingGrade, setSavingGrade] = useState(false);
  const [note, setNote] = useState('');

  const [form, setForm] = useState({ title: '', classId: '', subjectId: '', description: '', duration: 60, passScore: 50, dueDate: '', shuffleQuestions: false, allowRetake: false });
  const [questionForm, setQuestionForm] = useState<{ type: QType; questionText: string; options: string[]; correctAnswer: string; points: number }>({ type: 'mcq', questionText: '', options: ['', '', '', ''], correctAnswer: '', points: 5 });

  useEffect(() => { fetchClasses(); fetchSubjects(); fetchExams(); }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await api.get<Exam[]>('/exams');
      setExams(data);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/exams', form);
      setShowCreate(false);
      setForm({ title: '', classId: '', subjectId: '', description: '', duration: 60, passScore: 50, dueDate: '', shuffleQuestions: false, allowRetake: false });
      fetchExams();
    } catch {}
  };

  const handleExamClick = async (exam: Exam) => {
    setSelectedExam(exam);
    setShowSubmissions(false);
    setAnalytics(null);
    setLoadingQuestions(true);
    try {
      const data = await api.get<{ questions: Question[] }>(`/exams/${exam.id}`);
      setExamQuestions(data.questions || []);
    } catch { setExamQuestions([]); }
    setLoadingQuestions(false);
  };

  const handleDeleteQuestion = async (qid: string) => {
    if (!selectedExam) return;
    try {
      await api.delete(`/exams/${selectedExam.id}/questions/${qid}`);
      if (selectedExam) {
        const data = await api.get<{ questions: Question[]; totalPoints: number }>(`/exams/${selectedExam.id}`);
        setExamQuestions(data.questions || []);
        setSelectedExam({ ...selectedExam, totalPoints: data.totalPoints });
      }
    } catch {}
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    try {
      await api.post(`/exams/${selectedExam.id}/questions`, questionForm);
      setShowAddQuestion(false);
      setQuestionForm({ type: 'mcq', questionText: '', options: ['', '', '', ''], correctAnswer: '', points: 5 });
      if (selectedExam) {
        const data = await api.get<{ questions: Question[]; totalPoints: number }>(`/exams/${selectedExam.id}`);
        setExamQuestions(data.questions || []);
        setSelectedExam((prev) => prev ? { ...prev, totalPoints: data.totalPoints } : prev);
      }
    } catch {}
  };

  const handleViewSubmissions = async () => {
    if (!selectedExam) return;
    setLoadingSubmissions(true);
    setShowSubmissions(true);
    try {
      const data = await api.get<SubmissionsResponse>(`/exams/${selectedExam.id}/submissions`);
      setExamSubmissions(data.submissions || []);
      setExamQuestionsMeta(data.questions || []);
    } catch { setExamSubmissions([]); setExamQuestionsMeta([]); }
    setLoadingSubmissions(false);
  };

  const handleViewAnalytics = async () => {
    if (!selectedExam) return;
    try {
      const data = await api.get<typeof analytics>(`/exams/${selectedExam.id}/analytics`);
      setAnalytics(data);
    } catch { setAnalytics(null); }
  };

  const openGrading = (sub: Submission) => {
    setGradeTarget(sub);
    const draft: Record<string, { points: string; feedback: string }> = {};
    ((examQuestionsMeta && examQuestionsMeta.length ? examQuestionsMeta : examQuestions) || [])
      .filter((q) => q.type === 'theory')
      .forEach((q) => {
        const prev = parseJson<Record<string, { points: number; feedback: string }>>(sub.gradedAnswers, {})[q.id];
        draft[q.id] = { points: prev ? String(prev.points) : '0', feedback: prev ? prev.feedback : '' };
      });
    setGradeDraft(draft);
  };

  const saveGrade = async () => {
    if (!selectedExam || !gradeTarget) return;
    setSavingGrade(true);
    setNote('');
    try {
      const answers: Record<string, { points: number; feedback: string }> = {};
      Object.keys(gradeDraft).forEach((qid) => {
        answers[qid] = { points: parseFloat(gradeDraft[qid].points) || 0, feedback: gradeDraft[qid].feedback };
      });
      await api.put(`/exams/${selectedExam.id}/submissions/${gradeTarget.id}/grade`, { answers });
      setGradeTarget(null);
      handleViewSubmissions();
    } catch { setNote('Failed to save grade. Please try again.'); }
    setSavingGrade(false);
  };

  const isTeaching = currentUser?.staffType === 'teaching' || currentUser?.staffType === 'headteacher' || currentUser?.staffType === 'admin';
  const getClassName = (id: string) => classes.find((c) => c.id === id)?.name || id;
  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || id;

  const toggleTruthy = (key: 'shuffleQuestions' | 'allowRetake') => {
    setForm((f) => ({ ...f, [key]: !f[key] }));
  };

  const setQuestionType = (v: QType) => {
    setQuestionForm((pf) => ({
      ...pf,
      type: v,
      options: v === 'truefalse' ? ['True', 'False'] : v === 'mcq' ? ['', '', '', ''] : [],
      correctAnswer: '',
    }));
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('pages.exams')}</h1>
          <p className="text-muted-foreground">Create and manage school examinations.</p>
        </div>
        {isTeaching && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger render={<Button className="gap-2"><Plus size={16} />Create Exam</Button>} />
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Create Exam</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Class</Label>
                    <Select value={form.classId} onValueChange={(v) => v && setForm({ ...form, classId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Subject</Label>
                    <Select value={form.subjectId} onValueChange={(v) => v && setForm({ ...form, subjectId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>{subjects.filter((s) => !form.classId || s.classId === form.classId).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Duration (mins)</Label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })} min={1} /></div>
                  <div className="space-y-2"><Label>Pass Score (%)</Label><Input type="number" value={form.passScore} onChange={(e) => setForm({ ...form, passScore: parseInt(e.target.value) || 0 })} min={0} max={100} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.shuffleQuestions} onChange={() => toggleTruthy('shuffleQuestions')} className="h-4 w-4 accent-primary" />
                    <span>Shuffle questions</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.allowRetake} onChange={() => toggleTruthy('allowRetake')} className="h-4 w-4 accent-primary" />
                    <span>Allow retake</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Pass score is a percentage of the total marks (e.g. 50 means students need 50% to pass).</p>
                <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <DialogFooter>
                  <Button type="submit">Create Exam</Button>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {selectedExam ? (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedExam(null); setShowSubmissions(false); setAnalytics(null); }}><ArrowLeft size={14} className="mr-1" />Back to all exams</Button>
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>{selectedExam.title}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {selectedExam.description && <p className="text-sm text-muted-foreground">{selectedExam.description}</p>}
              <div className="flex flex-wrap gap-4 text-sm">
                <span>Class: <strong>{getClassName(selectedExam.classId)}</strong></span>
                {selectedExam.subjectId && <span>Subject: <strong>{getSubjectName(selectedExam.subjectId)}</strong></span>}
                <span className="flex items-center gap-1"><Clock size={14} />Duration: <strong>{selectedExam.duration} min</strong></span>
                <span>Due: <strong>{selectedExam.dueDate}</strong></span>
                <span>Total Points: <strong>{selectedExam.totalPoints}</strong></span>
                <span>Pass: <strong>{selectedExam.passScore}%</strong></span>
                <span>Shuffle: <strong>{selectedExam.shuffleQuestions ? 'Yes' : 'No'}</strong></span>
                <span>Retake: <strong>{selectedExam.allowRetake ? 'Yes' : 'No'}</strong></span>
              </div>
              <div className="flex gap-2 pt-2">
                <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
                  <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1"><Plus size={14} />Add Question</Button>} />
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddQuestion} className="space-y-4">
                      <div className="space-y-2"><Label>Type</Label>
                        <Select value={questionForm.type} onValueChange={(v) => v && setQuestionType(v as QType)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(Object.keys(TYPE_LABEL) as QType[]).map((k) => <SelectItem key={k} value={k}>{TYPE_LABEL[k]}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label>Question Text</Label><Textarea rows={3} value={questionForm.questionText} onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })} required /></div>
                      {questionForm.type === 'mcq' && (
                        <div className="grid gap-3">
                          <Label>Options</Label>
                          {questionForm.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-xs font-mono w-5 text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                              <Input value={opt} onChange={(e) => {
                                const opts = [...questionForm.options];
                                opts[i] = e.target.value;
                                setQuestionForm({ ...questionForm, options: opts });
                              }} placeholder={`Option ${String.fromCharCode(65 + i)}`} required />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>{questionForm.type === 'number' ? 'Correct Value' : questionForm.type === 'truefalse' ? 'Correct Answer' : questionForm.type === 'mcq' ? 'Correct Option' : 'Model Answer (for reference)'}</Label>
                          {questionForm.type === 'truefalse' ? (
                            <Select value={questionForm.correctAnswer} onValueChange={(v) => v && setQuestionForm({ ...questionForm, correctAnswer: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="True">True</SelectItem><SelectItem value="False">False</SelectItem></SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={questionForm.correctAnswer}
                              onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                              placeholder={questionForm.type === 'mcq' ? `Type the exact option text (e.g. ${'Accra'})` : questionForm.type === 'number' ? 'e.g. 12 or 3.5' : 'Optional reference answer'}
                              required={questionForm.type !== 'theory'}
                            />
                          )}
                          {questionForm.type === 'mcq' && <p className="text-xs text-muted-foreground">Match the correct option text exactly.</p>}
                        </div>
                        <div className="space-y-2"><Label>Points</Label><Input type="number" value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: parseFloat(e.target.value) || 1 })} min={0.5} step={0.5} /></div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Question</Button>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="outline" className="gap-1" onClick={handleViewSubmissions}><FileCheck size={14} />Submissions</Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={handleViewAnalytics}><BarChart3 size={14} />Analytics</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <FileCheck size={14} className="text-muted-foreground" />
              Questions ({examQuestions.length}) · {selectedExam.totalPoints} pts
            </h3>
            {loadingQuestions ? (
              <p className="text-sm text-muted-foreground">Loading questions...</p>
            ) : examQuestions.length === 0 ? (
              <Card className="border-border/50 shadow-sm"><CardContent className="p-6 text-center text-sm text-muted-foreground">No questions yet. Click "Add Question" to add one.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {examQuestions.map((q, i) => (
                  <Card key={q.id} className="border-border/50 shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">Q{i + 1}.</span>
                            <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[q.type] || q.type}</Badge>
                            <Badge variant="secondary" className="text-[10px]">{q.points} pts</Badge>
                          </div>
                          <p className="text-sm">{q.questionText}</p>
                          {q.type === 'mcq' && q.options && (
                            <div className="mt-2 space-y-1">
                              {q.options.map((opt, j) => (
                                <div key={j} className={`text-xs flex items-center gap-1 ${opt === q.correctAnswer ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}`}>
                                  {opt === q.correctAnswer ? <CheckCircle size={10} className="text-emerald-500" /> : <XCircle size={10} />}
                                  {String.fromCharCode(65 + j)}. {opt}
                                </div>
                              ))}
                            </div>
                          )}
                          {(q.type === 'truefalse' || q.type === 'number') && (
                            <p className="text-xs text-muted-foreground mt-1">Answer: {q.correctAnswer}</p>
                          )}
                          {q.type === 'theory' && (
                            <p className="text-xs text-muted-foreground mt-1">Model answer: {q.correctAnswer || '—'}</p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-500 shrink-0" onClick={() => handleDeleteQuestion(q.id)}><Trash2 size={14} /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {analytics && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2"><BarChart3 size={14} className="text-muted-foreground" />Class Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{analytics.totalSubmissions}</p><p className="text-[10px] text-muted-foreground">Submissions</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{analytics.average}</p><p className="text-[10px] text-muted-foreground">Average pts</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{analytics.max}</p><p className="text-[10px] text-muted-foreground">Max</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{analytics.min}</p><p className="text-[10px] text-muted-foreground">Min</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-emerald-600">{analytics.passRate}%</p><p className="text-[10px] text-muted-foreground">Pass rate ({analytics.passCount})</p></CardContent></Card>
              </div>
              {analytics.perQuestion.length > 0 && (
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="p-3 space-y-2">
                    {analytics.perQuestion.map((aq, i) => (
                      <div key={aq.id} className="text-sm py-1.5 border-b border-border/30 last:border-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="min-w-0 truncate font-medium"><span className="text-muted-foreground mr-1">Q{i + 1}.</span>{aq.questionText}</p>
                          <span className="text-xs text-muted-foreground shrink-0">{aq.correctCount}/{aq.attempted} correct · {aq.accuracy}% · avg {aq.averagePoints} pts</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {showSubmissions && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FileCheck size={14} className="text-muted-foreground" />
                Submissions {examSubmissions.length > 0 && `(${examSubmissions.length})`}
              </h3>
              {loadingSubmissions ? (
                <p className="text-sm text-muted-foreground">Loading submissions...</p>
              ) : examSubmissions.length === 0 ? (
                <Card className="border-border/50 shadow-sm"><CardContent className="p-6 text-center text-sm text-muted-foreground">No submissions yet.</CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {examSubmissions.map((sub) => {
                    const pct = (sub.totalScore && sub.totalScore > 0 && sub.score != null) ? Math.round((sub.score / sub.totalScore) * 100) : null;
                    const passed = pct != null ? pct >= (selectedExam.passScore || 0) : null;
                    return (
                      <Card key={sub.id} className="border-border/50 shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="rounded-lg p-2 bg-primary/10 text-primary shrink-0"><FileCheck size={16} /></div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{sub.student?.firstName} {sub.student?.lastName}</p>
                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                  {sub.score != null && <span className="tabular-nums">Score: <strong>{sub.score}</strong>{sub.totalScore ? `/${sub.totalScore}` : ''}</span>}
                                  {sub.grade && <Badge variant="secondary" className="text-[10px]">Grade {sub.grade}</Badge>}
                                  <Badge variant="outline" className={`text-[10px] ${sub.status === 'graded' ? 'border-emerald-200 text-emerald-600' : sub.status === 'started' ? 'text-muted-foreground' : 'border-amber-200 text-amber-600'}`}>{sub.status}</Badge>
                                  {passed != null && (passed ? <CheckCircle size={13} className="text-emerald-500" /> : <XCircle size={13} className="text-red-500" />)}
                                </div>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="text-[11px] shrink-0" onClick={() => openGrading(sub)}><Eye size={13} className="mr-1" />Review</Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : exams.length === 0 ? (
            <Card className="border-border/50 shadow-sm"><CardContent className="p-8 text-center text-sm text-muted-foreground">No exams yet. {isTeaching ? 'Click "Create Exam" to create one.' : ''}</CardContent></Card>
          ) : exams.map((exam) => (
            <Card key={exam.id} className="border-border/50 shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleExamClick(exam)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-primary/10 text-primary"><FileCheck size={18} /></div>
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {getClassName(exam.classId)} &middot; {exam.duration} min &middot; Due: {exam.dueDate} &middot; <span className="tabular-nums">{exam.totalPoints} pts</span> &middot; Pass: {exam.passScore}% &middot; Q: {exam._count?.questions ?? 0}
                    </p>
                  </div>
                </div>
                <Eye size={16} className="text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {gradeTarget && (
        <Dialog open={!!gradeTarget} onOpenChange={(o: boolean) => !o && !savingGrade && setGradeTarget(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Review Submission — {gradeTarget.student?.firstName} {gradeTarget.student?.lastName}</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <p className="text-xs text-muted-foreground">Score: {gradeTarget.score != null ? `${gradeTarget.score}/${gradeTarget.totalScore}` : '—'} · Status: {gradeTarget.status}</p>
              {note && <p className="text-sm text-red-600">{note}</p>}
              {gradeTarget.graded && <p className="text-xs text-emerald-600">This submission has been graded. Saving will update it.</p>}
              {((examQuestionsMeta.length ? examQuestionsMeta : examQuestions) || []).map((q, i) => {
                const ansMap = parseJson<Record<string, string>>(gradeTarget.answers, {});
                const answer = ansMap[q.id];
                const isAuto = q.type === 'mcq' || q.type === 'truefalse' || q.type === 'number';
                let correct = false;
                if (isAuto) correct = q.type === 'number' ? Math.abs((parseFloat(answer) || NaN) - parseFloat(q.correctAnswer)) < 1e-9 || answer === q.correctAnswer : answer === q.correctAnswer;
                const draft = gradeDraft[q.id];
                return (
                  <Card key={q.id} className="border-border/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[q.type]}</Badge>
                        <span className="text-[10px] text-muted-foreground">{q.points} pts</span>
                      </div>
                      <p className="text-sm font-medium mb-1"><span className="text-muted-foreground mr-1">Q{i + 1}.</span>{q.questionText}</p>
                      <p className="text-xs mb-2"><span className="text-muted-foreground">Answer:</span> {answer || <span className="italic">No answer</span>}</p>
                      {isAuto ? (
                        <p className={`text-xs ${correct ? 'text-emerald-600' : 'text-red-500'}`}>{correct ? 'Correct' : `Incorrect — correct answer: ${q.correctAnswer}`}</p>
                      ) : draft ? (
                        <div className="grid gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs w-10 shrink-0">Points</Label>
                            <Input type="number" className="h-8 text-sm" value={draft.points} max={q.points} step={0.5} onChange={(e) => setGradeDraft({ ...gradeDraft, [q.id]: { ...draft, points: e.target.value } })} />
                            <span className="text-[10px] text-muted-foreground">/ {q.points}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs w-10 shrink-0">Feedback</Label>
                            <Input className="h-8 text-sm" value={draft.feedback} placeholder="Optional feedback" onChange={(e) => setGradeDraft({ ...gradeDraft, [q.id]: { ...draft, feedback: e.target.value } })} />
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <DialogFooter>
              <Button size="sm" onClick={saveGrade} disabled={savingGrade}>
                {savingGrade ? <Loader2 size={14} className="mr-1 animate-spin" /> : <CheckCircle size={14} className="mr-1" />}Save Grade
              </Button>
              <Button size="sm" variant="outline" onClick={() => setGradeTarget(null)} disabled={savingGrade}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}