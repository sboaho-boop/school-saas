'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Copy, Check, Radio, GraduationCap, Video, LogOut } from 'lucide-react';
import { api, getToken } from '@/lib/api';

interface MeetingDetail {
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

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.get(`/academics/meetings/${params.id}`).then((m: any) => {
      setMeeting(m);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  if (!meeting) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-muted-foreground">Meeting not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/meetings')}><ArrowLeft size={14} className="mr-1" />Back to meetings</Button>
      </div>
    );
  }

  const live = meeting.status === 'live' || (meeting.status === 'scheduled' && !!meeting.endTime && new Date() >= new Date(`${meeting.meetingDate}T${meeting.startTime}`) && new Date() <= new Date(`${meeting.meetingDate}T${meeting.endTime}`));

  const copyCode = () => {
    navigator.clipboard?.writeText(meeting.meetingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push('/meetings')}><ArrowLeft size={14} className="mr-1" />Back to meetings</Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-xl">{meeting.title}</CardTitle>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <GraduationCap size={14} />{meeting.class?.name}
                </div>
              </div>
              <Badge className={live ? 'bg-emerald-100 text-emerald-700' : meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}>
                {live ? <span className="flex items-center gap-1"><Radio size={12} className="animate-pulse" />Live</span> : meeting.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={14} />
              {meeting.meetingDate} · {meeting.startTime}{meeting.endTime ? `–${meeting.endTime}` : ''}
            </div>

            {meeting.agenda && (
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{meeting.agenda}</p>
            )}

            <div className="rounded-lg border border-border/50 p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meeting Join Code</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold bg-muted/50 rounded-md px-4 py-2 flex-1 text-center">{meeting.meetingCode}</span>
                <Button size="sm" variant="outline" onClick={copyCode}>{copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}</Button>
              </div>
              {live && (
                <p className="text-xs text-emerald-600">This meeting is live. Enter the code to join.</p>
              )}
            </div>

            {!joined ? (
              <div className="space-y-2">
                <Label htmlFor="joinCode">Enter code to join</Label>
                <div className="flex gap-2">
                  <Input id="joinCode" className="font-mono uppercase" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder={meeting.meetingCode} />
                  <Button onClick={() => {
                    if (joinCode.trim().toUpperCase() === meeting.meetingCode) {
                      setJoined(true);
                      setJoinMsg('');
                    } else {
                      setJoinMsg('Incorrect join code. Check the code provided by the school.');
                    }
                  }} disabled={!joinCode}><Video size={16} className="mr-1" />Join</Button>
                </div>
                {joinMsg && <p className="text-xs text-red-500">{joinMsg}</p>}
              </div>
            ) : (
              <div className="rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-border/50 p-6 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-600">
                  <Radio size={20} className="animate-pulse" />
                  <span className="font-semibold">You are connected</span>
                </div>
                <p className="text-sm text-muted-foreground">You have joined <span className="font-medium text-foreground">{meeting.title}</span> for <span className="font-medium">{meeting.class?.name}</span>.</p>
                <Button variant="outline" size="sm" onClick={() => setJoined(false)}><LogOut size={14} className="mr-1" />Leave meeting</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}