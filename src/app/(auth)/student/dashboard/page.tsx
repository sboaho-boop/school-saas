'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, setToken, API_URL } from '@/lib/api';
import { GraduationCap, Wallet, Check, X, Clock, AlertCircle, Eye, LogOut, Send, Plus, FileText, BookOpen, Calendar, Bell, Upload, File, Image, Loader2, User, BarChart3, Percent, Trophy, Users, Sparkles } from 'lucide-react';
import { KofiAvatar } from '@/components/ai/kofi-avatar';

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function TimetableSection() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/timetable')
      .then((data: any) => { setSlots(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (slots.length === 0) return null;

  const byDay: Record<number, any[]> = {};
  for (let i = 0; i < 5; i++) byDay[i] = [];
  for (const s of slots) {
    if (byDay[s.dayOfWeek]) byDay[s.dayOfWeek].push(s);
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Calendar size={16} />Class Timetable</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="grid grid-cols-5 gap-2 min-w-[520px]">
          {DAY_LABELS.map((day, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[10px] font-semibold text-center text-muted-foreground uppercase tracking-wider mb-2">{day.slice(0, 3)}</p>
              {byDay[idx].length === 0 ? (
                <p className="text-[10px] text-center text-muted-foreground">—</p>
              ) : (
                byDay[idx].slice(0, 6).map((s: any) => (
                  <div key={s.id} className="text-[10px] bg-muted/30 rounded p-1.5 border border-border/30">
                    <p className="font-medium truncate">{s.startTime}-{s.endTime}</p>
                    <p className="text-muted-foreground truncate">{s.subjectName}</p>
                    {s.room && <p className="text-muted-foreground/70 truncate">Room: {s.room}</p>}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ExamScheduleSection() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/exams')
      .then((data: any) => { setExams(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (exams.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BookOpen size={16} />Exam Schedule</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {exams.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 text-sm p-2.5 rounded-lg border border-border/50">
              <div className="min-w-0">
                <p className="font-medium truncate">{e.title}</p>
                <p className="text-[10px] text-muted-foreground">{e.subjectName}{e.duration ? ` · ${e.duration} min` : ''}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-medium text-primary">{e.dueDate}</p>
                {e.totalPoints > 0 && <p className="text-[10px] text-muted-foreground">{e.totalPoints} pts</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ClassReportSection() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/report-card')
      .then((data: any) => { setReport(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!report || report.noTerm || report.subjects.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><FileText size={16} />Class Report</CardTitle>
        {report.term && <p className="text-xs text-muted-foreground">{report.term.name} · {report.term.academicYear}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {report.subjects.map((s: any) => (
            <div key={s.subjectId} className="flex items-center justify-between text-sm py-1.5 border-b border-border/30">
              <div>
                <span className="font-medium">{s.subjectName}</span>
                {s.subjectCode && <span className="text-muted-foreground ml-1 text-xs">({s.subjectCode})</span>}
                {s.remarks && <span className="block text-[10px] text-muted-foreground">{s.remarks}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${s.score >= 80 ? 'text-emerald-500' : s.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                  {s.score > 0 ? `${s.score}%` : '—'}
                </span>
                {s.grade && <Badge variant="outline" className="text-[10px]">{s.grade}</Badge>}
              </div>
            </div>
          ))}
        </div>
        {report.totalSubjects > 0 && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50 text-sm">
            <span className="font-semibold">Average</span>
            <span className={`font-bold ${report.average >= 80 ? 'text-emerald-500' : report.average >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
              {report.average}%{report.overallGrade && <Badge variant="secondary" className="ml-2 text-[10px]">{report.overallGrade}</Badge>}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TasksReminderSection() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitId, setSubmitId] = useState<string | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/student/assignments').then((data: any) => { setAssignments(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!submitId || !submitContent && !submitFile) return;
    setUploading(true);
    try {
      let fileUrl = '';
      if (submitFile) {
        const formData = new FormData();
        formData.append('file', submitFile);
        const uploadRes = await fetch(`${API_URL.replace('/api', '')}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData });
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
      }
      await api.post('/submissions', { assignmentId: submitId, content: submitContent, fileUrl });
      setSubmitId(null);
      setSubmitContent('');
      setSubmitFile(null);
      const data = await api.get<any[]>('/student/assignments');
      setAssignments(data);
    } catch (e) { console.error(e); } finally { setUploading(false); }
  };

  if (loading) return null;
  if (assignments.length === 0) return null;

  const now = new Date();
  const upcoming = assignments.filter((a) => new Date(a.dueDate) > now).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const overdue = assignments.filter((a) => new Date(a.dueDate) <= now && !a.submissions?.[0]);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell size={16} />Task Reminders</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {overdue.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-red-500 uppercase mb-1">Overdue ({overdue.length})</p>
            {overdue.map((a) => (
              <div key={a.id} className="border border-red-200 dark:border-red-900 rounded-lg p-2 mb-1">
                <p className="font-medium text-xs">{a.title}</p>
                <p className="text-[10px] text-muted-foreground">Due: {a.dueDate}</p>
              </div>
            ))}
          </div>
        )}
        {upcoming.slice(0, 5).map((a) => {
          const sub = a.submissions?.[0];
          const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return (
            <div key={a.id} className="border border-border/50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Due {a.dueDate}
                    {daysLeft > 0 && daysLeft <= 3 && <span className="text-amber-500 ml-1">({daysLeft}d left)</span>}
                  </p>
                </div>
                <Badge variant={sub ? (sub.status === 'graded' ? 'default' : 'secondary') : daysLeft <= 1 ? 'destructive' : 'outline'} className="text-[10px] shrink-0">
                  {sub ? (sub.status === 'graded' ? `${sub.grade}/${a.totalPoints}` : 'Submitted') : daysLeft <= 1 ? 'Due Soon' : 'Pending'}
                </Badge>
              </div>
              {a.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{a.description}</p>}
              {sub?.feedback && <p className="text-xs text-muted-foreground mt-1 italic">Feedback: {sub.feedback}</p>}
              {!sub && (
                <div className="mt-2">
                  {submitId === a.id ? (
                    <div className="space-y-2">
                      <textarea className="w-full min-h-[60px] rounded-md border border-border bg-background p-2 text-xs" placeholder="Write your answer..." value={submitContent} onChange={(e) => setSubmitContent(e.target.value)} />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                          <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setSubmitFile(e.target.files?.[0] || null)} />
                          {submitFile ? <><File size={12} />{submitFile.name}</> : <><Upload size={12} />Attach file</>}
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSubmit} disabled={!submitContent && !submitFile || uploading}>
                          {uploading ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Send size={12} className="mr-1" />}{uploading ? 'Uploading...' : 'Submit'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setSubmitId(null); setSubmitFile(null); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setSubmitId(a.id)} className="text-xs">Submit Answer</Button>
                  )}
                </div>
              )}
              {sub?.fileUrl && (
                <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                  <File size={12} />View attached file
                </a>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportMsg, setReportMsg] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/student/login'); return; }
    api.get('/student/dashboard').then((data: any) => {
      setData(data);
      setLoading(false);
    }).catch(() => { setToken(null); router.push('/student/login'); });
    api.get('/student/reports').then((data: any) => setReports(data)).catch(() => {});
  }, [router]);

  const handleSubmitReport = async () => {
    if (!reportTitle || !reportContent) return;
    setReportMsg('');
    try {
      const report = await api.post('/student/reports', { title: reportTitle, content: reportContent });
      setReports((prev) => [report, ...prev]);
      setReportTitle('');
      setReportContent('');
      setShowReportForm(false);
      setReportMsg('Report submitted. Only your admin and headteacher can see it.');
    } catch (err: any) { setReportMsg(err.message); }
  };

  const handleLogout = () => { setToken(null); router.push('/student/login'); };

  const statusIcons: Record<string, any> = { present: <Check size={14} />, absent: <X size={14} />, late: <Clock size={14} />, excused: <AlertCircle size={14} /> };
  const statusColors: Record<string, string> = { present: 'text-emerald-600', absent: 'text-red-600', late: 'text-amber-600', excused: 'text-blue-600' };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Logo iconOnly size="sm" />
            <span className="font-semibold">Student Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/student/ai-tutor')}>
              <Sparkles size={14} className="mr-1 text-violet-500" />Ask Teacher Kofi
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut size={14} className="mr-1" />Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
          <div className="shrink-0">
            {data?.photoUrl ? (
              <img src={data.photoUrl} alt={data.name} className="w-16 h-16 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                <User size={28} className="text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{data?.name}</h1>
            <p className="text-sm text-muted-foreground">{data?.className}</p>
            {data?.indexNumber && <p className="text-xs text-muted-foreground font-mono">{data.indexNumber}</p>}
            {data?.classTeacher && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Users size={11} />Class Teacher: {data.classTeacher}</p>}
          </div>
          <div className="shrink-0 text-right">
            {data?.avgScore !== null && data?.avgScore !== undefined && (
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Average</p>
                <p className={`text-xl font-bold ${data.avgScore >= 80 ? 'text-emerald-500' : data.avgScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{data.avgScore}%</p>
              </div>
            )}
          </div>
        </motion.div>

        <Card className="border-violet-300/60 dark:border-violet-800/60 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-transparent dark:from-violet-950/40 dark:via-fuchsia-950/30 dark:to-transparent shadow-sm overflow-hidden relative">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="shrink-0 flex items-center justify-center">
              <KofiAvatar size={12} title="Teacher Kofi" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles size={14} className="text-violet-500" />Teacher Kofi is now everywhere
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get your own Teacher Kofi account and keep learning at home — with more messages, voice input, and read-aloud in 7 languages.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300" onClick={() => router.push('/student/ai-tutor')}>
                Ask in class
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600" onClick={() => router.push('/tutor')}>
                Get Teacher Kofi
              </Button>
            </div>
          </CardContent>
        </Card>

        <TimetableSection />
        <ExamScheduleSection />
        <ClassReportSection />
        <TasksReminderSection />

        {data?.wallet && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Wallet size={16} />Wallet Balance</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">GHS {data.wallet.balance.toFixed(2)}</span>
                {data.wallet.frozen && <Badge variant="secondary">Frozen</Badge>}
              </div>
              {data.transactions && data.transactions.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 mt-3">
                  <p className="text-xs font-medium text-muted-foreground">Recent</p>
                  {data.transactions.map((tx: any) => (
                    <div key={tx.id} className="flex justify-between text-xs py-1 border-b border-border/30">
                      <span className={tx.type === 'topup' ? 'text-emerald-600' : 'text-red-600'}>
                        {tx.type === 'topup' ? '+' : ''}GHS {Math.abs(tx.amount).toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {data?.attendance && data.attendance.length > 0 && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye size={16} />Attendance</CardTitle></CardHeader>
            <CardContent>
              {data?.attendanceStats && (
                <div className="flex gap-3 mb-3 text-xs">
                  <span className="text-emerald-600 flex items-center gap-1"><Check size={12} />{data.attendanceStats.present}</span>
                  <span className="text-red-600 flex items-center gap-1"><X size={12} />{data.attendanceStats.absent}</span>
                  <span className="text-amber-600 flex items-center gap-1"><Clock size={12} />{data.attendanceStats.late}</span>
                  <span className="text-muted-foreground">of {data.attendanceStats.total} days</span>
                </div>
              )}
              <div className="space-y-1">
                {data.attendance.slice(0, 10).map((a: any) => (
                  <div key={a.id} className="flex justify-between text-sm py-1 border-b border-border/30">
                    <span>{a.date}</span>
                    <span className={`flex items-center gap-1 capitalize ${statusColors[a.status]}`}>{statusIcons[a.status]}{a.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data?.grades && data.grades.length > 0 && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 size={16} />Marks</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {data.grades.map((g: any) => (
                  <div key={g.id} className="flex justify-between text-sm py-1 border-b border-border/30">
                    <div>
                      <span className="font-medium">{g.subjectName}</span>
                      <span className="text-muted-foreground ml-2">{g.score}%</span>
                    </div>
                    <span className={`font-bold ${g.score >= 80 ? 'text-emerald-500' : g.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{g.grade}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><FileText size={16} />My Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" variant="outline" onClick={() => setShowReportForm(!showReportForm)}>
              <Plus size={14} className="mr-1" />{showReportForm ? 'Cancel' : 'New Report'}
            </Button>

            {showReportForm && (
              <div className="space-y-3 p-3 rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input placeholder="Report title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Content</Label>
                  <textarea
                    className="w-full min-h-[100px] rounded-md border border-border bg-background p-2 text-sm"
                    placeholder="Describe your concern..."
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                  />
                </div>
                <Button size="sm" onClick={handleSubmitReport} disabled={!reportTitle || !reportContent}>
                  <Send size={14} className="mr-1" />Submit Report
                </Button>
                {reportMsg && <p className="text-xs text-emerald-600">{reportMsg}</p>}
              </div>
            )}

            {reports.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {reports.map((r: any) => (
                  <div key={r.id} className="text-sm p-3 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{r.title}</span>
                      <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
