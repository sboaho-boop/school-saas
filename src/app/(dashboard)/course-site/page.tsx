'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/stores/locale';
import { api } from '@/lib/api';
import { Users, BookOpen, FileText, Pencil, CalendarDays, Megaphone, ArrowLeft, Send, RotateCcw } from 'lucide-react';

interface CourseSiteSummary {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  subjectCount: number;
  assignmentCount: number;
  examCount: number;
  lessonPlanCount: number;
  announcementCount: number;
  meetingCount: number;
}

interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  teacher: string;
  classId: string;
}

interface GradebookRow {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacher: string;
  average: number;
  max: number;
  min: number;
  gradedStudents: number;
  totalStudents: number;
}

interface CourseSiteBundle {
  class: { id: string; name: string; section: string };
  subjects: SubjectInfo[];
  assignments: any[];
  exams: any[];
  lessonPlans: any[];
  announcements: any[];
  students: any[];
  meetings: any[];
  term: { id: string; name: string; academicYear: string } | null;
  weights: Record<string, number>;
  gradebook: GradebookRow[];
  stats: Record<string, number>;
}

function CourseSiteContent() {
  const searchParams = useSearchParams();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { t } = useI18n();

  const [sites, setSites] = useState<CourseSiteSummary[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [site, setSite] = useState<CourseSiteBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [feedbackBySub, setFeedbackBySub] = useState<Record<string, string>>({});

  const isStaff = currentUser?.staffType === 'headteacher' || currentUser?.staffType === 'admin' || currentUser?.staffType === 'teaching';

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<CourseSiteSummary[]>('/course-sites');
        setSites(Array.isArray(data) ? data : []);
        const qs = searchParams.get('classId');
        const initial = qs && data.find((c) => c.id === qs) ? qs : data.length > 0 ? data[0].id : '';
        setSelectedId(initial);
      } catch {}
      setLoading(false);
    })();
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) return;
    setBundleLoading(true);
    (async () => {
      try {
        const data = await api.get<CourseSiteBundle>(`/course-sites/${selectedId}`);
        setSite(data);
      } catch { setSite(null); }
      setBundleLoading(false);
    })();
  }, [selectedId]);

  const handleGrade = async (submission: any, score: string) => {
    if (!score) return;
    try {
      await api.put(`/submissions/${submission.id}/grade`, { grade: parseFloat(score), feedback: feedbackBySub[submission.id] || '' });
      const data = await api.get<CourseSiteBundle>(`/course-sites/${selectedId}`);
      setSite(data);
    } catch {}
  };

  const handleReturn = async (submission: any) => {
    try {
      await api.put(`/submissions/${submission.id}/return`, { feedback: feedbackBySub[submission.id] || 'Please revise and resubmit.' });
      const data = await api.get<CourseSiteBundle>(`/course-sites/${selectedId}`);
      setSite(data);
    } catch {}
  };

  const selected = sites.find((s) => s.id === selectedId);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('pages.courseSites')}</h1>
          <p className="text-muted-foreground">Course site for each class: announcements, subjects, assignments, exams and gradebook at a glance.</p>
        </div>
        <Select value={selectedId} onValueChange={(v) => v && setSelectedId(v)}>
          <SelectTrigger className="w-[240px]"><SelectValue placeholder="Select a class" /></SelectTrigger>
          <SelectContent>
            {sites.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : sites.length === 0 ? (
        <Card className="border-border/50 shadow-sm"><CardContent className="p-8 text-center text-sm text-muted-foreground">No classes available. Create a class under Academics first.</CardContent></Card>
      ) : selected && !site ? (
        <Card className="border-border/50 shadow-sm"><CardContent className="p-8 text-center text-sm text-muted-foreground">{bundleLoading ? 'Loading course site...' : 'Could not load this course site.'}</CardContent></Card>
      ) : site ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={<Users size={18} className="text-primary" />} label="Students" value={site.stats.studentCount?.toString() || '0'} />
            <StatCard icon={<BookOpen size={18} className="text-primary" />} label="Subjects" value={site.stats.subjectCount?.toString() || '0'} />
            <StatCard icon={<FileText size={18} className="text-primary" />} label="Assignments" value={site.stats.assignmentCount?.toString() || '0'} />
            <StatCard icon={<Pencil size={18} className="text-primary" />} label="Exams" value={site.stats.examCount?.toString() || '0'} />
            <StatCard icon={<CalendarDays size={18} className="text-primary" />} label="Lesson Plans" value={site.stats.lessonPlanCount?.toString() || '0'} />
            <StatCard icon={<Megaphone size={18} className="text-primary" />} label="Announcements" value={site.stats.announcementCount?.toString() || '0'} />
          </div>

          {site.term && (
            <p className="text-sm text-muted-foreground">
              Term: <span className="font-medium text-foreground">{site.term.name} {site.term.academicYear}</span>
            </p>
          )}

          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="lessonplans">Lesson Plans</TabsTrigger>
              <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Announcements</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {site.announcements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No announcements for this class yet.</p>
                  ) : site.announcements.map((a) => (
                    <div key={a.id} className="rounded-lg border border-border/50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{a.title}</p>
                        <Badge variant="outline" className="text-[10px]">{a.classId ? 'Class' : 'School'}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
                      {a.author?.name && <p className="mt-1 text-[10px] text-muted-foreground/70">by {a.author.name}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-3 lg:grid-cols-2">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Students in {site.class.name}</CardTitle></CardHeader>
                  <CardContent className="max-h-72 overflow-y-auto space-y-1">
                    {site.students.length === 0 ? <p className="text-sm text-muted-foreground">No students enrolled yet.</p> : site.students.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-muted/50">
                        <span>{s.firstName} {s.lastName}</span>
                        {s.gender && <span className="text-xs text-muted-foreground">{s.gender}</span>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Subjects</CardTitle></CardHeader>
                  <CardContent className="space-y-1">
                    {site.subjects.length === 0 ? <p className="text-sm text-muted-foreground">No subjects yet.</p> : site.subjects.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between rounded px-2 py-1 text-sm">
                        <span className="font-medium">{sub.name} <span className="text-xs text-muted-foreground">({sub.code})</span></span>
                        {sub.teacher && <span className="text-xs text-muted-foreground">{sub.teacher}</span>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-2">
              {site.subjects.length === 0 ? <p className="text-sm text-muted-foreground">No subjects for this class.</p> : site.subjects.map((sub) => (
                <Card key={sub.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2 bg-primary/10 text-primary"><BookOpen size={18} /></div>
                      <div>
                        <p className="font-medium">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.code}</p>
                      </div>
                    </div>
                    {sub.teacher && <span className="text-xs text-muted-foreground">{sub.teacher}</span>}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="assignments" className="space-y-3">
              {site.assignments.length === 0 ? <p className="text-sm text-muted-foreground">No assignments for this class.</p> : site.assignments.map((a) => (
                <Card key={a.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {a.dueDate} · Points: {a.totalPoints}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-[10px]">{a.submittedCount}/{a.students?.length ?? site.students.length} submitted</Badge>
                        {a.gradedCount > 0 && <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-600">{a.gradedCount} graded</Badge>}
                        {a.returnedCount > 0 && <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600">{a.returnedCount} returned</Badge>}
                      </div>
                    </div>
                    {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                    {a.submissions && a.submissions.length > 0 && (
                      <div className="space-y-2">
                        {a.submissions.map((sub: any) => (
                          <div key={sub.id} className="rounded-lg border border-border/40 p-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{sub.studentName || 'Student'}</span>
                                <Badge variant="outline" className={`text-[10px] ${sub.status === 'graded' ? 'border-emerald-200 text-emerald-600' : sub.status === 'returned' ? 'border-amber-200 text-amber-600' : 'border-primary/40 text-primary'}`}>{sub.status}</Badge>
                                {sub.grade != null && <span className="text-xs text-muted-foreground">Score: {sub.grade}/{a.totalPoints}</span>}
                              </div>
                              {isStaff && sub.status !== 'returned' && (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    placeholder="Feedback"
                                    className="h-7 w-40 text-xs"
                                    value={feedbackBySub[sub.id] || ''}
                                    onChange={(e) => setFeedbackBySub((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                                  />
                                  <ScoreInput submission={sub} totalPoints={a.totalPoints} onSave={(score) => handleGrade(sub, score)} />
                                  {sub.status === 'graded' && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleReturn(sub)}>
                                      <RotateCcw size={12} />Return
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                            {sub.content && <p className="mt-1 text-xs text-muted-foreground">{sub.content}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="exams" className="space-y-3">
              {site.exams.length === 0 ? <p className="text-sm text-muted-foreground">No exams for this class.</p> : site.exams.map((ex) => (
                <Card key={ex.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2 bg-accent/10 text-accent"><Pencil size={18} /></div>
                      <div>
                        <p className="font-medium">{ex.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.duration ? `${ex.duration} min` : ''}{ex.totalPoints ? ` · ${ex.totalPoints} pts` : ''}{ex.dueDate ? ` · ${ex.dueDate}` : ''}
                          {ex._count?.questions != null ? ` · ${ex._count.questions} questions` : ''}
                        </p>
                      </div>
                    </div>
                    {ex.status && <Badge variant="outline" className="text-[10px] capitalize">{ex.status}</Badge>}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="lessonplans" className="space-y-3">
              {site.lessonPlans.length === 0 ? <p className="text-sm text-muted-foreground">No lesson plans for this class.</p> : site.lessonPlans.map((lp) => (
                <Card key={lp.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{lp.title || lp.topic || 'Lesson'}</p>
                      {lp.date && <span className="text-xs text-muted-foreground">{lp.date}</span>}
                    </div>
                    {lp.objectives && <p className="mt-1 text-xs text-muted-foreground">{lp.objectives}</p>}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="gradebook" className="space-y-4">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base font-medium">Gradebook Summary {site.term ? `- ${site.term.name}` : ''}</CardTitle>
                    {site.weights && (
                      <div className="flex gap-2 text-[10px] text-muted-foreground">
                        {Object.entries(site.weights).map(([k, v]) => <Badge key={k} variant="outline" className="text-[10px]">{k}: {v}</Badge>)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {site.gradebook.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No grades recorded for the current term.</p>
                  ) : (
                    <div className="space-y-2">
                      {site.gradebook.map((row) => (
                        <div key={row.subjectId} className="flex flex-wrap items-center justify-between rounded-lg border border-border/40 p-3">
                          <div>
                            <p className="text-sm font-medium">{row.subjectName} <span className="text-xs text-muted-foreground">({row.subjectCode})</span></p>
                            <p className="text-xs text-muted-foreground">{row.teacher ? `${row.teacher} · ` : ''}Graded {row.gradedStudents}/{row.totalStudents}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">Avg <strong className="text-foreground">{row.average}</strong></span>
                            <span className="text-muted-foreground">Max <strong className="text-emerald-600">{row.max}</strong></span>
                            <span className="text-muted-foreground">Min <strong className="text-amber-600">{row.min}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      {selected && (
        <LinkBack classId={selected.id} />
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-lg bg-muted/60 p-2">{icon}</div>
      </CardContent>
    </Card>
  );
}

function ScoreInput({ submission, totalPoints, onSave }: { submission: any; totalPoints: number; onSave: (score: string) => void }) {
  const [score, setScore] = useState('');
  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min={0}
        max={totalPoints}
        placeholder={`/${totalPoints}`}
        className="h-7 w-20 text-xs"
        value={score}
        onChange={(e) => setScore(e.target.value)}
      />
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={!score} onClick={() => { onSave(score); setScore(''); }}>
        <Send size={12} />Grade
      </Button>
    </div>
  );
}

function LinkBack({ classId }: { classId: string }) {
  return (
    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
      <ArrowLeft size={14} className="mr-1" />Back
    </Button>
  );
}

export default function CourseSitePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading...</div>}>
      <CourseSiteContent />
    </Suspense>
  );
}