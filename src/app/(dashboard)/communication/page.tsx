'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { MessageSquare, Megaphone, Send, Smartphone, History, Plus, MailOpen, AlertTriangle, Info, AlertCircle, Phone, Users, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCommunicationStore } from '@/stores/communication';
import { useStaffStore } from '@/stores/staff';
import { useStudentStore } from '@/stores/students';
import { useSmsStore } from '@/stores/sms';
import { useI18n } from '@/stores/locale';

export default function CommunicationPage() {
  const { messages, announcements, sendMessage, markRead, addAnnouncement, fetchMessages, fetchAnnouncements } = useCommunicationStore();
  const staff = useStaffStore((s) => s.staff);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const students = useStudentStore((s) => s.students);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const { campaigns, balance, fetchCampaigns, fetchBalance, sendSms, sendBatchSms } = useSmsStore();
  const { t } = useI18n();

  const [mainTab, setMainTab] = useState<'messages' | 'announcements' | 'sms' | 'history'>('messages');
  const [msgOpen, setMsgOpen] = useState(false);
  const [annOpen, setAnnOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [toId, setToId] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annPriority, setAnnPriority] = useState<'low' | 'normal' | 'high'>('normal');

  const [smsRecipientType, setSmsRecipientType] = useState('individual');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsContent, setSmsContent] = useState('');
  const [smsGroupId, setSmsGroupId] = useState('');
  const [sending, setSending] = useState(false);
  const [smsResult, setSmsResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [smsHistoryFilter, setSmsHistoryFilter] = useState('all');

  useEffect(() => { fetchMessages(); fetchAnnouncements(); fetchStaff(); fetchStudents(); fetchCampaigns(); fetchBalance(); }, [fetchMessages, fetchAnnouncements, fetchStaff, fetchStudents, fetchCampaigns, fetchBalance]);

  const uniqClasses = [...new Set(students.map((s) => s.className).filter(Boolean))];
  const depts = [...new Set(staff.map((s) => s.department).filter(Boolean))];

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

  const handleSendSms = async () => {
    if (!smsContent) return;
    setSending(true);
    setSmsResult(null);
    try {
      if (smsRecipientType === 'individual') {
        if (!smsPhone) { setSmsResult({ success: false, message: 'Phone number required' }); return; }
        await sendSms({ to: smsPhone, content: smsContent });
        setSmsResult({ success: true, message: 'SMS sent successfully' });
        setSmsPhone('');
        setSmsContent('');
      } else {
        let recipients: string[] = [];
        if (smsRecipientType === 'all_parents') {
          recipients = students.map((s) => (s as any).parentPhone).filter(Boolean);
        } else if (smsRecipientType === 'all_staff') {
          recipients = staff.map((s) => s.phone).filter(Boolean);
        } else if (smsRecipientType === 'class_parents') {
          recipients = students.filter((s) => s.className === smsGroupId).map((s) => (s as any).parentPhone).filter(Boolean);
        } else if (smsRecipientType === 'staff_department') {
          recipients = staff.filter((s) => s.department === smsGroupId).map((s) => s.phone).filter(Boolean);
        }
        if (!recipients.length) { setSmsResult({ success: false, message: 'No recipients found' }); return; }
        await sendBatchSms({ recipients, content: smsContent, title: `Bulk SMS (${smsRecipientType})`, recipientType: smsRecipientType });
        setSmsResult({ success: true, message: `SMS sent to ${recipients.length} recipients` });
        setSmsContent('');
        setSmsGroupId('');
      }
      await fetchCampaigns();
    } catch (err: any) {
      setSmsResult({ success: false, message: err.message });
    } finally {
      setSending(false);
    }
  };

  const tabs = [
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: messages.filter((m) => !m.read).length },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, count: 0 },
    { id: 'sms', label: 'SMS', icon: Smartphone, count: 0 },
    { id: 'history', label: 'SMS History', icon: History, count: 0 },
  ] as const;

  const priorityConfig = { low: { icon: Info, class: 'text-blue-600 bg-blue-500/10' }, normal: { icon: AlertCircle, class: 'text-amber-600 bg-amber-500/10' }, high: { icon: AlertTriangle, class: 'text-red-600 bg-red-500/10' } };

  const filteredCampaigns = smsHistoryFilter === 'all' ? campaigns : campaigns.filter((c) => c.recipientType === smsHistoryFilter);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('pages.communication')}</h1>
          <p className="text-muted-foreground">Messages, announcements, and SMS broadcasting.</p>
        </div>
        <div className="flex items-center gap-3">
          {balance && balance.balance !== undefined && (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
              <MessageCircle size={14} className="text-primary" />
              SMS Balance: {balance.currency || 'GHS'} {balance.balance}
            </Badge>
          )}
          {mainTab === 'announcements' && (
            <Dialog open={annOpen} onOpenChange={setAnnOpen}>
              <DialogTrigger render={<Button variant="outline" size="sm"><Megaphone size={16} className="mr-2" />New Announcement</Button>} />
              <DialogContent>
                <DialogHeader><DialogTitle>New Announcement</DialogTitle><DialogDescription>Create a school-wide announcement.</DialogDescription></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div><Label>Title</Label><Input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Announcement title" /></div>
                  <div><Label>Body</Label><Textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} placeholder="Announcement details" /></div>
                  <div><Label>Priority</Label><Select value={annPriority} onValueChange={(v) => v && setAnnPriority(v as 'low' | 'normal' | 'high')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
                </div>
                <DialogFooter><DialogClose render={<Button variant="outline">{t('common.cancel')}</Button>} /><Button onClick={handleAnnounce}>Post</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {mainTab === 'messages' && (
            <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
              <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" />{t('common.add')}</Button>} />
              <DialogContent>
                <DialogHeader><DialogTitle>New Message</DialogTitle><DialogDescription>Send a message to parents or staff.</DialogDescription></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div><Label>To</Label><Select value={toId} onValueChange={(v) => v && setToId(v)}><SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger><SelectContent>{staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Message subject" /></div>
                  <div><Label>Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message content" /></div>
                </div>
                <DialogFooter><DialogClose render={<Button variant="outline">{t('common.cancel')}</Button>} /><Button onClick={handleSend}><Send size={14} className="mr-2" />{t('common.send')}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      <Tabs value={mainTab} onValueChange={(v) => v && setMainTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="gap-2">
              <t.icon size={16} />
              {t.label}
              {t.count > 0 && <Badge className="h-5 min-w-5 px-1.5 text-xs ml-1">{t.count}</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="messages" className="mt-4 space-y-3">
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
          {!messages.length && <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>}
        </TabsContent>

        <TabsContent value="announcements" className="mt-4 space-y-3">
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
          {!announcements.length && <p className="text-sm text-muted-foreground text-center py-8">No announcements yet.</p>}
        </TabsContent>

        <TabsContent value="sms" className="mt-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Send SMS</CardTitle>
              <CardDescription>Send SMS via Hubtel. Requires SMS credentials configured in Settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Recipient Type</Label>
                <Select value={smsRecipientType} onValueChange={(v) => v && setSmsRecipientType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Phone Number</SelectItem>
                    <SelectItem value="all_parents">All Parents</SelectItem>
                    <SelectItem value="all_staff">All Staff</SelectItem>
                    <SelectItem value="class_parents">Parents by Class</SelectItem>
                    <SelectItem value="staff_department">Staff by Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(smsRecipientType === 'individual') && (
                <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <Input value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} placeholder="+233XXXXXXXXX" />
                </div>
              )}

              {(smsRecipientType === 'class_parents') && (
                <div className="grid gap-2">
                  <Label>Select Class</Label>
                  <Select value={smsGroupId} onValueChange={(v) => v && setSmsGroupId(v)}>
                    <SelectTrigger><SelectValue placeholder="Choose class" /></SelectTrigger>
                    <SelectContent>
                      {uniqClasses.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(smsRecipientType === 'staff_department') && (
                <div className="grid gap-2">
                  <Label>Select Department</Label>
                  <Select value={smsGroupId} onValueChange={(v) => v && setSmsGroupId(v)}>
                    <SelectTrigger><SelectValue placeholder="Choose department" /></SelectTrigger>
                    <SelectContent>
                      {depts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label>Message</Label>
                <Textarea value={smsContent} onChange={(e) => setSmsContent(e.target.value)} placeholder="Type your SMS message here..." rows={4} />
                <p className="text-xs text-muted-foreground">{smsContent.length} characters (~{Math.ceil(smsContent.length / 160)} SMS segments)</p>
              </div>

              {smsResult && (
                <div className={`rounded-lg p-3 text-sm ${smsResult.success ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                  {smsResult.message}
                </div>
              )}

              <Button onClick={handleSendSms} disabled={sending || !smsContent} className="w-full">
                {sending ? 'Sending...' : <><Send size={16} className="mr-2" /> Send SMS</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Label className="text-sm">Filter:</Label>
            <Select value={smsHistoryFilter} onValueChange={(v) => v && setSmsHistoryFilter(v)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="batch">Batch</SelectItem>
                <SelectItem value="all_parents">All Parents</SelectItem>
                <SelectItem value="all_staff">All Staff</SelectItem>
                <SelectItem value="class_parents">Class Parents</SelectItem>
                <SelectItem value="staff_department">Staff Department</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredCampaigns.map((c) => (
            <Card key={c.id} className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Smartphone size={14} className="text-primary shrink-0" />
                      <p className="text-sm font-medium">{c.title}</p>
                      <Badge variant="outline" className="text-xs">{c.recipientType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{c.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users size={12} /> {c.sentCount} recipients</span>
                      <span>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!filteredCampaigns.length && <p className="text-sm text-muted-foreground text-center py-8">No SMS history yet.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
