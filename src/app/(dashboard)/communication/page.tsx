'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { MessageSquare, Megaphone, Plus, Send, MailOpen, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCommunicationStore } from '@/stores/communication';
import { useStaffStore } from '@/stores/staff';

export default function CommunicationPage() {
  const { messages, announcements, sendMessage, markRead, addAnnouncement, fetchMessages, fetchAnnouncements } = useCommunicationStore();
  const staff = useStaffStore((s) => s.staff);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const [tab, setTab] = useState<'messages' | 'announcements'>('messages');
  const [msgOpen, setMsgOpen] = useState(false);
  const [annOpen, setAnnOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [toId, setToId] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annPriority, setAnnPriority] = useState<'low' | 'normal' | 'high'>('normal');

  useEffect(() => { fetchMessages(); fetchAnnouncements(); fetchStaff(); }, [fetchMessages, fetchAnnouncements, fetchStaff]);

  const handleSend = () => {
    if (!subject || !body || !toId) return;
    sendMessage({ subject, body, toId });
    setSubject('');
    setBody('');
    setToId('');
    setMsgOpen(false);
  };

  const handleAnnounce = () => {
    if (!annTitle || !annBody) return;
    addAnnouncement({ title: annTitle, body: annBody, priority: annPriority });
    setAnnTitle('');
    setAnnBody('');
    setAnnOpen(false);
  };

  const tabs = [
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: messages.filter((m) => !m.read).length },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, count: 0 },
  ] as const;

  const priorityConfig = { low: { icon: Info, class: 'text-blue-600 bg-blue-500/10' }, normal: { icon: AlertCircle, class: 'text-amber-600 bg-amber-500/10' }, high: { icon: AlertTriangle, class: 'text-red-600 bg-red-500/10' } };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Communication</h1>
          <p className="text-muted-foreground">Manage messages and announcements.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={annOpen} onOpenChange={setAnnOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm"><Megaphone size={16} className="mr-2" />New Announcement</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Announcement</DialogTitle>
                <DialogDescription>Create a school-wide announcement.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div><Label>Title</Label><Input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Announcement title" /></div>
                <div><Label>Body</Label><Textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} placeholder="Announcement details" /></div>
                <div><Label>Priority</Label><Select value={annPriority} onValueChange={(v) => v && setAnnPriority(v as 'low' | 'normal' | 'high')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button onClick={handleAnnounce}>Post</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
            <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" />New Message</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
                <DialogDescription>Send a message to parents or staff.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div><Label>To</Label><Select value={toId} onValueChange={(v) => v && setToId(v)}><SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger><SelectContent>{staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Message subject" /></div>
                <div><Label>Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message content" /></div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button onClick={handleSend}><Send size={14} className="mr-2" />Send</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon size={16} />
            {t.label}
            {t.count > 0 && <Badge className="h-5 min-w-5 px-1.5 text-xs">{t.count}</Badge>}
          </button>
        ))}
      </div>

      {tab === 'messages' && (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card key={msg.id} className={`border-border/50 shadow-sm ${!msg.read ? 'border-l-2 border-l-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{msg.subject}</p>
                      {!msg.read && <Badge className="h-2 w-2 rounded-full p-0 bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{msg.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">From: {msg.sender?.name || 'Unknown'} &middot; To: {msg.receiver?.name || 'Unknown'} &middot; {new Date(msg.createdAt).toLocaleDateString()}</p>
                  </div>
                  {!msg.read && <Button size="sm" variant="ghost" onClick={() => markRead(msg.id)}><MailOpen size={14} /></Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === 'announcements' && (
        <div className="space-y-3">
          {announcements.map((ann) => {
            const p = priorityConfig[ann.priority as keyof typeof priorityConfig] || priorityConfig.normal;
            const PIcon = p.icon;
            return (
              <Card key={ann.id} className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${p.class}`}><PIcon size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{ann.title}</p>
                        <Badge variant="outline" className="text-xs capitalize">{ann.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{ann.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">{ann.author?.name || 'Unknown'} &middot; {new Date(ann.createdAt).toLocaleDateString()}</p>
                    </div>
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
