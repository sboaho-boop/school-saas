'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { CalendarPlus, Clock, GraduationCap, Video, Copy, Check, Trash2, Radio } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface Meeting {
  id: string;
  title: string;
  agenda: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  meetingCode: string;
  class: { id: string; name: string };
}

interface AcademicClass {
  id: string;
  name: string;
  teacher: string;
}

const statusColor: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-emerald-100 text-emerald-700',
  ended: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-red-100 text-red-600',
};

function isLive(meeting: Meeting): boolean {
  if (meeting.status === 'live') return true;
  if (meeting.status === 'scheduled' && meeting.endTime) {
    const start = new Date(`${meeting.meetingDate}T${meeting.startTime}`);
    const end = new Date(`${meeting.meetingDate}T${meeting.endTime}`);
    const now = new Date();
    return now >= start && now <= end;
  }
  return false;
}

export default function MeetingsPage() {
  const user = useAuthStore((s) => s.currentUser);
  const router = useRouter();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [creating, setCreating] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  const canManage = user && ['admin', 'headteacher', 'teaching'].includes((user as any).staffType || user.role);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Meeting[]>('/academics/meetings');
      setMeetings(data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMeetings();
    api.get<AcademicClass[]>('/academics/classes').then((c) => setClasses(c || [])).catch(() => {});
  }, [fetchMeetings]);

  const createMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !title || !meetingDate || !startTime) return;
    setCreating(true);
    setFormMsg('');
    try {
      await api.post('/academics/meetings', { classId, title, agenda, meetingDate, startTime, endTime });
      setOpen(false);
      setClassId(''); setTitle(''); setAgenda(''); setMeetingDate(''); setStartTime(''); setEndTime('');
      fetchMeetings();
    } catch (err: any) {
      setFormMsg(err.message || 'Failed to create meeting');
    }
    setCreating(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/academics/meetings/${id}`, { status });
      fetchMeetings();
    } catch { /* ignore */ }
  };

  const removeMeeting = async (id: string) => {
    if (!window.confirm('Delete this PTA meeting?')) return;
    try {
      await api.delete(`/academics/meetings/${id}`);
      fetchMeetings();
    } catch { /* ignore */ }
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-500/10 via-primary/10 to-indigo-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Class PTA Meetings</h1>
          <p className="text-muted-foreground">Schedule online or in-person PTA meetings for specific classes.</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm"><CalendarPlus size={16} className="mr-2" /> New Meeting</Button>} />
            <DialogContent className="sm:max-w-md">
              <form onSubmit={createMeeting}>
                <DialogHeader>
                  <DialogTitle>Schedule PTA Meeting</DialogTitle>
                  <DialogDescription>Parents of the class will be able to join using the auto-generated code.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <select
                      id="class"
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="" disabled>Select a class...</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Term 2 PTA Meeting" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agenda">Agenda</Label>
                    <Textarea id="agenda" value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="Topics to discuss..." rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetingDate">Date</Label>
                    <Input id="meetingDate" type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start</Label>
                      <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End</Label>
                      <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </div>
                  {formMsg && <p className="text-xs text-red-500">{formMsg}</p>}
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <Button type="submit" disabled={creating}>{creating ? 'Scheduling...' : 'Schedule Meeting'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : meetings.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
            <Video size={32} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No class PTA meetings scheduled yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((m) => {
            const live = isLive(m);
            return (
              <Card key={m.id} className="border-border/50 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {live && <Radio size={14} className="text-emerald-500 animate-pulse" />}
                        <p className="font-semibold truncate">{m.title}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <GraduationCap size={12} />
                        {m.class?.name || 'Class'}
                      </div>
                    </div>
                    <Badge className={statusColor[live ? 'live' : m.status]}>{live ? 'Live' : m.status}</Badge>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Clock size={14} />{m.meetingDate} · {m.startTime}{m.endTime ? `–${m.endTime}` : ''}</div>
                  </div>

                  {m.agenda && <p className="text-xs text-muted-foreground line-clamp-2">{m.agenda}</p>}

                  <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                    <span className="font-mono text-xs font-semibold">{m.meetingCode}</span>
                    <Button size="sm" variant="ghost" onClick={() => copyCode(m.meetingCode)}>
                      {copied === m.meetingCode ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/meetings/${m.id}`)}
                    >
                      <Video size={14} className="mr-1" /> View / Join
                    </Button>
                    {canManage && (
                      <>
                        {live || m.status === 'scheduled' ? (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(m.id, m.status === 'live' ? 'ended' : 'live')} className="flex-1">
                            <Radio size={14} className="mr-1" />{m.status === 'live' ? 'End' : 'Start'}
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost" onClick={() => removeMeeting(m.id)} className="text-red-500">
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}