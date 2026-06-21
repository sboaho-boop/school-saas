'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useAcademicsStore } from '@/stores/academics';
import { api } from '@/lib/api';
import { Plus, BookOpen, Eye, ArrowLeft, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function AssignmentsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { classes, fetchClasses } = useAcademicsStore();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', classId: '', subjectId: '', totalPoints: 100 });

  useEffect(() => { fetchClasses(); fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      const data = await api.get<any[]>('/assignments');
      setAssignments(data);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assignments', form);
      setShowCreate(false);
      setForm({ title: '', description: '', dueDate: '', classId: '', subjectId: '', totalPoints: 100 });
      fetchAssignments();
    } catch {}
  };

  const isTeaching = currentUser?.staffType === 'teaching' || currentUser?.staffType === 'headteacher' || currentUser?.staffType === 'admin';

  const statusIcon = (s: string) => {
    if (s === 'submitted') return <Clock size={14} className="text-amber-500" />;
    if (s === 'graded') return <CheckCircle size={14} className="text-emerald-500" />;
    return <XCircle size={14} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Assignments</h1>
          <p className="text-muted-foreground">Create and manage homework and assignments.</p>
        </div>
        {isTeaching && <Button onClick={() => setShowCreate(!showCreate)} className="gap-2"><Plus size={16} />New Assignment</Button>}
      </motion.div>

      {showCreate && isTeaching && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Class</Label>
                  <Select value={form.classId} onValueChange={(v) => v && setForm({ ...form, classId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Total Points</Label><Input type="number" value={form.totalPoints} onChange={(e) => setForm({ ...form, totalPoints: parseInt(e.target.value) || 100 })} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="flex gap-2"><Button type="submit">Create Assignment</Button><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedAssignment ? (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedAssignment(null)}><ArrowLeft size={14} className="mr-1" />Back to all assignments</Button>
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>{selectedAssignment.title}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{selectedAssignment.description}</p>
              <div className="flex gap-4 text-sm">
                <span>Due: <strong>{selectedAssignment.dueDate}</strong></span>
                <span>Points: <strong>{selectedAssignment.totalPoints}</strong></span>
                <span>Submissions: <strong>{selectedAssignment.submissions?.length || 0}</strong></span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Submissions</h3>
            {(selectedAssignment.submissions || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              selectedAssignment.submissions.map((sub: any) => (
                <SubmissionCard key={sub.id} submission={sub} assignment={selectedAssignment} onUpdate={fetchAssignments} />
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : assignments.length === 0 ? (
            <Card className="border-border/50 shadow-sm"><CardContent className="p-8 text-center text-sm text-muted-foreground">No assignments yet. {isTeaching ? 'Click "New Assignment" to create one.' : ''}</CardContent></Card>
          ) : assignments.map((a) => {
            const submitted = a.submissions?.filter((s: any) => s.status !== 'pending')?.length || 0;
            const total = a.submissions?.length || 0;
            return (
              <Card key={a.id} className="border-border/50 shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setSelectedAssignment(a); setShowCreate(false); }}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2 bg-primary/10 text-primary"><BookOpen size={18} /></div>
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">Due: {a.dueDate} · {total > 0 ? `${submitted}/${total} submitted` : 'No submissions'}</p>
                    </div>
                  </div>
                  <Eye size={16} className="text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({ submission, assignment, onUpdate }: { submission: any; assignment: any; onUpdate: () => void }) {
  const [gradeInput, setGradeInput] = useState(submission.grade?.toString() || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [expanded, setExpanded] = useState(false);

  const handleGrade = async () => {
    try {
      await api.put(`/submissions/${submission.id}/grade`, { grade: parseFloat(gradeInput), feedback });
      onUpdate();
    } catch {}
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-3">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between w-full text-left">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{submission.student?.firstName} {submission.student?.lastName}</span>
            <Badge variant="outline" className={`text-[10px] ${submission.status === 'graded' ? 'border-emerald-200 text-emerald-600' : 'text-amber-600 border-amber-200'}`}>{submission.status}</Badge>
            {submission.grade && <span className="text-xs text-muted-foreground">Score: {submission.grade}/{assignment.totalPoints}</span>}
          </div>
          <ChevronDown size={14} className={`transition-transform ${expanded ? '' : '-rotate-90'} text-muted-foreground`} />
        </button>
        {expanded && (
          <div className="mt-3 space-y-3">
            <div className="text-sm bg-muted/30 p-3 rounded"><p className="text-xs text-muted-foreground mb-1">Submission:</p>{submission.content}</div>
            {submission.feedback && <div className="text-sm bg-muted/30 p-3 rounded border-l-2 border-primary"><p className="text-xs text-muted-foreground mb-1">Feedback:</p>{submission.feedback}</div>}
            <div className="flex gap-2 items-end">
              <div className="space-y-1"><Label className="text-xs">Grade (/{assignment.totalPoints})</Label><Input type="number" size={1} className="h-8 w-24 text-sm" value={gradeInput} onChange={(e) => setGradeInput(e.target.value)} /></div>
              <div className="space-y-1 flex-1"><Label className="text-xs">Feedback</Label><Input size={1} className="h-8 text-sm" value={feedback} onChange={(e) => setFeedback(e.target.value)} /></div>
              <Button size="sm" variant="outline" onClick={handleGrade} disabled={!gradeInput}>Save Grade</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
