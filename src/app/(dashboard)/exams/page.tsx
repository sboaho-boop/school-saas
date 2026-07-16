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
import { api } from '@/lib/api';
import { FileCheck, Plus, Eye, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface Question {
  id: string;
  type: 'mcq' | 'theory';
  questionText: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface Submission {
  id: string;
  student?: { firstName: string; lastName: string };
  score?: number;
  totalScore?: number;
  status: string;
  startedAt?: string;
  submittedAt?: string;
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
}

export default function ExamsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { classes, subjects, fetchClasses, fetchSubjects } = useAcademicsStore();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<Submission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [form, setForm] = useState({ title: '', classId: '', subjectId: '', description: '', duration: 60, passScore: 0, dueDate: '' });
  const [questionForm, setQuestionForm] = useState({ type: 'theory' as 'mcq' | 'theory', questionText: '', options: ['', '', '', ''], correctAnswer: '', points: 10 });

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
      setForm({ title: '', classId: '', subjectId: '', description: '', duration: 60, passScore: 0, dueDate: '' });
      fetchExams();
    } catch {}
  };

  const handleExamClick = async (exam: Exam) => {
    setSelectedExam(exam);
    setShowSubmissions(false);
    setLoadingQuestions(true);
    try {
      const data = await api.get<{ questions: Question[] }>(`/exams/${exam.id}`);
      setExamQuestions(data.questions || []);
    } catch { setExamQuestions([]); }
    setLoadingQuestions(false);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    try {
      await api.post(`/exams/${selectedExam.id}/questions`, questionForm);
      setShowAddQuestion(false);
      setQuestionForm({ type: 'theory', questionText: '', options: ['', '', '', ''], correctAnswer: '', points: 10 });
      if (selectedExam) handleExamClick(selectedExam);
    } catch {}
  };

  const handleViewSubmissions = async () => {
    if (!selectedExam) return;
    setLoadingSubmissions(true);
    setShowSubmissions(true);
    try {
      const data = await api.get<Submission[]>(`/exams/${selectedExam.id}/submissions`);
      setExamSubmissions(data);
    } catch { setExamSubmissions([]); }
    setLoadingSubmissions(false);
  };

  const isTeaching = currentUser?.staffType === 'teaching' || currentUser?.staffType === 'headteacher' || currentUser?.staffType === 'admin';

  const getClassName = (id: string) => classes.find((c) => c.id === id)?.name || id;
  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Exams</h1>
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
                  <div className="space-y-2"><Label>Pass Score</Label><Input type="number" value={form.passScore} onChange={(e) => setForm({ ...form, passScore: parseInt(e.target.value) || 0 })} min={0} /></div>
                </div>
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
          <Button variant="ghost" size="sm" onClick={() => { setSelectedExam(null); setShowSubmissions(false); }}><ArrowLeft size={14} className="mr-1" />Back to all exams</Button>
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
                <span>Pass Score: <strong>{selectedExam.passScore}</strong></span>
              </div>
              <div className="flex gap-2 pt-2">
                <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
                  <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1"><Plus size={14} />Add Question</Button>} />
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddQuestion} className="space-y-4">
                      <div className="space-y-2"><Label>Type</Label>
                        <Select value={questionForm.type} onValueChange={(v) => setQuestionForm({ ...questionForm, type: v as 'mcq' | 'theory', correctAnswer: '', options: v === 'mcq' ? ['', '', '', ''] : ['', '', '', ''] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="theory">Theory</SelectItem>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
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
                        <div className="space-y-2"><Label>Correct Answer</Label><Input value={questionForm.correctAnswer} onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} required /></div>
                        <div className="space-y-2"><Label>Points</Label><Input type="number" value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 10 })} min={1} /></div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Question</Button>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="outline" className="gap-1" onClick={handleViewSubmissions}><FileCheck size={14} />Submissions</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <FileCheck size={14} className="text-muted-foreground" />
              Questions ({examQuestions.length})
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">Q{i + 1}.</span>
                            <Badge variant="outline" className="text-[10px]">{q.type.toUpperCase()}</Badge>
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
                          {q.type === 'theory' && (
                            <p className="text-xs text-muted-foreground mt-1">Answer: {q.correctAnswer}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {showSubmissions && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FileCheck size={14} className="text-muted-foreground" />
                Submissions
              </h3>
              {loadingSubmissions ? (
                <p className="text-sm text-muted-foreground">Loading submissions...</p>
              ) : examSubmissions.length === 0 ? (
                <Card className="border-border/50 shadow-sm"><CardContent className="p-6 text-center text-sm text-muted-foreground">No submissions yet.</CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {examSubmissions.map((sub) => (
                    <Card key={sub.id} className="border-border/50 shadow-sm">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg p-2 bg-primary/10 text-primary"><FileCheck size={16} /></div>
                          <div>
                            <p className="font-medium text-sm">{sub.student?.firstName} {sub.student?.lastName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {sub.score !== undefined && <span>Score: <strong>{sub.score}</strong>{sub.totalScore ? `/${sub.totalScore}` : ''}</span>}
                              <Badge variant="outline" className={`text-[10px] ${sub.status === 'graded' ? 'border-emerald-200 text-emerald-600' : 'text-amber-600 border-amber-200'}`}>{sub.status}</Badge>
                            </div>
                          </div>
                        </div>
                        {sub.score !== undefined && sub.score >= selectedExam.passScore ? (
                          <CheckCircle size={18} className="text-emerald-500" />
                        ) : sub.score !== undefined ? (
                          <XCircle size={18} className="text-red-500" />
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
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
                      {getClassName(exam.classId)} &middot; {exam.duration} min &middot; Due: {exam.dueDate} &middot; {exam.totalPoints} pts &middot; Pass: {exam.passScore}
                    </p>
                  </div>
                </div>
                <Eye size={16} className="text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
