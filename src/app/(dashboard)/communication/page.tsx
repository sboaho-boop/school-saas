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
import { MessageSquare, Megaphone, Send, Smartphone, History, Plus, MailOpen, AlertTriangle, Info, AlertCircle, Phone, Users, MessageCircle, Bell, BellOff, Inbox, Trash2, CheckCheck, Eye, FileText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCommunicationStore } from '@/stores/communication';
import { useStaffStore } from '@/stores/staff';
import { useStudentStore } from '@/stores/students';
import { useSmsStore } from '@/stores/sms';
import { useNotificationStore } from '@/stores/notifications';
import { useTemplateStore } from '@/stores/templates';
import { useI18n } from '@/stores/locale';

export default function CommunicationPage() {
  const { messages, announcements, unreadMessageCount, searchQuery, setSearchQuery, sendMessage, markRead, addAnnouncement, deleteMessage, deleteAnnouncement, fetchMessages, fetchAnnouncements } = useCommunicationStore();
  const staff = useStaffStore((s) => s.staff);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const students = useStudentStore((s) => s.students);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const { campaigns, balance, fetchCampaigns, fetchBalance, sendSms, sendBatchSms } = useSmsStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { templates, fetchTemplates, deleteTemplate } = useTemplateStore();
  const { t } = useI18n();

  const [mainTab, setMainTab] = useState<'inbox' | 'sent' | 'announcements' | 'notifications' | 'sms' | 'templates' | 'history'>('inbox');
  const [msgOpen, setMsgOpen] = useState(false);
  const [annOpen, setAnnOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [toId, setToId] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annPriority, setAnnPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread'>('all');

  const [smsRecipientType, setSmsRecipientType] = useState('individual');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsContent, setSmsContent] = useState('');
  const [smsGroupId, setSmsGroupId] = useState('');
  const [sending, setSending] = useState(false);
  const [smsResult, setSmsResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [smsHistoryFilter, setSmsHistoryFilter] = useState('all');
  const [confirmSend, setConfirmSend] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchAnnouncements();
    fetchStaff();
    fetchStudents();
    fetchCampaigns();
    fetchBalance();
    fetchNotifications();
    fetchTemplates();
  }, [fetchMessages, fetchAnnouncements, fetchStaff, fetchStudents, fetchCampaigns, fetchBalance, fetchNotifications, fetchTemplates]);

  const uniqClasses = [...new Set(students.map((s) => s.className).filter(Boolean))];
  const depts = [...new Set(staff.map((s) => s.department).filter(Boolean))];
  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('edu_user') || '{}') : {};

  const sentMessages = messages.filter((m) => m.fromId === currentUser.id);
  const inboxMessages = messages.filter((m) => m.toId === currentUser.id);
  const filteredInbox = messageFilter === 'unread' ? inboxMessages.filter((m) => !m.read) : inboxMessages;

  const handleSend = async () => {
    if (!subject || !body || !toId) return;
    await sendMessage({ subject, body, toId });
    setSubject('');
    setBody('');
    setToId('');
    setMsgOpen(false);
    await fetchMessages();
  };

  const handleAnnounce = async () => {
    if (!annTitle || !annBody) return;
    await addAnnouncement({ title: annTitle, body: annBody, priority: annPriority });
    setAnnTitle('');
    setAnnBody('');
    setAnnOpen(false);
    await fetchAnnouncements();
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

  const handleDeleteMessage = async (id: string) => {
    await deleteMessage(id);
    setSelectedMessage(null);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await deleteAnnouncement(id);
    setSelectedAnnouncement(null);
  };

  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxMessages.filter((m) => !m.read).length },
    { id: 'sent', label: 'Sent', icon: Send, count: 0 },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, count: 0 },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { id: 'sms', label: 'SMS', icon: Smartphone, count: 0 },
    { id: 'templates', label: 'Templates', icon: FileText, count: 0 },
    { id: 'history', label: 'History', icon: History, count: 0 },
  ] as const;

  const priorityConfig = { low: { icon: Info, class: 'text-blue-600 bg-blue-500/10' }, normal: { icon: AlertCircle, class: 'text-amber-600 bg-amber-500/10' }, high: { icon: AlertTriangle, class: 'text-red-600 bg-red-500/10' } };

  const notificationTypeConfig: Record<string, { icon: any; color: string }> = {
    student_absent: { icon: AlertTriangle, color: 'text-red-500' },
    student_late: { icon: AlertCircle, color: 'text-amber-500' },
    fee_payment_received: { icon: CheckCheck, color: 'text-green-500' },
    fee_payment_overdue: { icon: AlertTriangle, color: 'text-red-500' },
    result_published: { icon: Eye, color: 'text-blue-500' },
    assignment_posted: { icon: FileText, color: 'text-purple-500' },
    announcement_created: { icon: Megaphone, color: 'text-primary' },
    new_message: { icon: MessageSquare, color: 'text-primary' },
    task_assigned: { icon: FileText, color: 'text-blue-500' },
    submission_graded: { icon: CheckCheck, color: 'text-green-500' },
  };

  const filteredCampaigns = smsHistoryFilter === 'all' ? campaigns : campaigns.filter((c) => c.recipientType === smsHistoryFilter);

  const MessageDetail = ({ msg, onClose }: { msg: any; onClose: () => void }) => (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{msg.subject || 'No subject'}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            From: <span className="font-medium text-foreground">{msg.sender?.name || 'Unknown'}</span> &middot;
            To: <span className="font-medium text-foreground">{msg.receiver?.name || 'Unknown'}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          {!msg.read && msg.toId === currentUser.id && (
            <Button size="sm" variant="outline" onClick={() => markRead(msg.id)}><MailOpen size={14} className="mr-1" /> Mark Read</Button>
          )}
          <Button size="sm" variant="outline" onClick={onClose}><Trash2 size={14} /></Button>
        </div>
      </div>
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
      </div>
    </div>
  );

  const AnnouncementDetail = ({ ann, onClose }: { ann: any; onClose: () => void }) => {
    const p = priorityConfig[ann.priority as keyof typeof priorityConfig] || priorityConfig.normal;
    const PIcon = p.icon;
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`rounded-full p-2 ${p.class}`}><PIcon size={16} /></div>
            <div>
              <h3 className="text-lg font-semibold">{ann.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                By: <span className="font-medium text-foreground">{ann.author?.name || 'Unknown'}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(ann.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="capitalize">{ann.priority}</Badge>
            <Button size="sm" variant="outline" onClick={() => handleDeleteAnnouncement(ann.id)}><Trash2 size={14} /></Button>
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm whitespace-pre-wrap">{ann.body}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('pages.communication')}</h1>
          <p className="text-muted-foreground">Messages, announcements, notifications, and SMS broadcasting.</p>
        </div>
        <div className="flex items-center gap-3">
          {balance && balance.balance !== undefined && (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
              <MessageCircle size={14} className="text-primary" />
              SMS: {balance.currency || 'GHS'} {balance.balance}
            </Badge>
          )}
          {mainTab === 'inbox' && (
            <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
              <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" />New Message</Button>} />
              <DialogContent>
                <DialogHeader><DialogTitle>New Message</DialogTitle><DialogDescription>Send a message to staff members.</DialogDescription></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div><Label>To</Label><Select value={toId} onValueChange={(v) => v && setToId(v)}><SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger><SelectContent>{staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Message subject" /></div>
                  <div><Label>Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message content" /></div>
                </div>
                <DialogFooter><DialogClose render={<Button variant="outline">{t('common.cancel')}</Button>} /><Button onClick={handleSend}><Send size={14} className="mr-2" />{t('common.send')}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {mainTab === 'announcements' && (
            <Dialog open={annOpen} onOpenChange={setAnnOpen}>
              <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" />New Announcement</Button>} />
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
          {mainTab === 'notifications' && unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead}><CheckCheck size={16} className="mr-2" />Mark All Read</Button>
          )}
        </div>
      </motion.div>

      {(mainTab === 'inbox' || mainTab === 'announcements') && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { fetchMessages(); fetchAnnouncements(); } }}
            placeholder="Search messages or announcements..."
            className="pl-10"
          />
        </div>
      )}

      <Tabs value={mainTab} onValueChange={(v) => v && setMainTab(v as any)}>
        <TabsList className="grid w-full grid-cols-7 max-w-4xl">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="gap-2 text-xs">
              <t.icon size={14} />
              {t.label}
              {t.count > 0 && <Badge className="h-4 min-w-4 px-1 text-[10px] ml-1">{t.count}</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="inbox" className="mt-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Button size="sm" variant={messageFilter === 'all' ? 'default' : 'outline'} onClick={() => setMessageFilter('all')}>All</Button>
            <Button size="sm" variant={messageFilter === 'unread' ? 'default' : 'outline'} onClick={() => setMessageFilter('unread')}>Unread</Button>
            <span className="text-xs text-muted-foreground ml-auto">{inboxMessages.length} messages</span>
          </div>
          {selectedMessage ? (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <MessageDetail msg={selectedMessage} onClose={() => setSelectedMessage(null)} />
              </CardContent>
            </Card>
          ) : (
            filteredInbox.map((msg) => (
              <Card key={msg.id} className={`border-border/50 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors ${!msg.read ? 'border-l-2 border-l-primary' : ''}`} onClick={() => { setSelectedMessage(msg); if (!msg.read) markRead(msg.id); }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{msg.subject || 'No subject'}</p>
                        {!msg.read && <Badge className="h-2 w-2 rounded-full p-0 bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{msg.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">From: {msg.sender?.name || 'Unknown'} &middot; {new Date(msg.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {!filteredInbox.length && !selectedMessage && <p className="text-sm text-muted-foreground text-center py-8">No messages in inbox.</p>}
        </TabsContent>

        <TabsContent value="sent" className="mt-4 space-y-3">
          {sentMessages.map((msg) => (
            <Card key={msg.id} className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{msg.subject || 'No subject'}</p>
                      <Badge variant="outline" className="text-xs">Sent</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{msg.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">To: {msg.receiver?.name || 'Unknown'} &middot; {new Date(msg.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteMessage(msg.id)}><Trash2 size={14} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!sentMessages.length && <p className="text-sm text-muted-foreground text-center py-8">No sent messages.</p>}
        </TabsContent>

        <TabsContent value="announcements" className="mt-4 space-y-3">
          {selectedAnnouncement ? (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <AnnouncementDetail ann={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />
              </CardContent>
            </Card>
          ) : (
            announcements.map((ann) => {
              const p = priorityConfig[ann.priority as keyof typeof priorityConfig] || priorityConfig.normal;
              const PIcon = p.icon;
              return (
                <Card key={ann.id} className="border-border/50 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setSelectedAnnouncement(ann)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${p.class}`}><PIcon size={16} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{ann.title}</p>
                          <Badge variant="outline" className="text-xs capitalize">{ann.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ann.body}</p>
                        <p className="text-xs text-muted-foreground mt-2">{ann.author?.name || 'Unknown'} &middot; {new Date(ann.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
          {!announcements.length && !selectedAnnouncement && <p className="text-sm text-muted-foreground text-center py-8">No announcements yet.</p>}
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-3">
          {notifications.map((notif) => {
            const config = notificationTypeConfig[notif.type] || { icon: Bell, color: 'text-muted-foreground' };
            const NIcon = config.icon;
            return (
              <Card key={notif.id} className={`border-border/50 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors ${!notif.read ? 'border-l-2 border-l-primary' : ''}`} onClick={() => markAsRead(notif.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <NIcon size={16} className={`mt-0.5 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{notif.title}</p>
                        {!notif.read && <Badge className="h-2 w-2 rounded-full p-0 bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!notifications.length && <p className="text-sm text-muted-foreground text-center py-8">No notifications.</p>}
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

              <Button onClick={() => setConfirmSend(true)} disabled={sending || !smsContent} className="w-full">
                {sending ? 'Sending...' : <><Send size={16} className="mr-2" /> Send SMS</>}
              </Button>
            </CardContent>
          </Card>

          <Dialog open={confirmSend} onOpenChange={setConfirmSend}>
            <DialogContent>
              <DialogHeader><DialogTitle>Confirm SMS Send</DialogTitle><DialogDescription>Are you sure you want to send this SMS? This will use your Hubtel SMS credits.</DialogDescription></DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button onClick={() => { setConfirmSend(false); handleSendSms(); }}>Confirm Send</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="templates" className="mt-4 space-y-3">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Reusable templates with variables like {'{{student_name}}'}, {'{{parent_name}}'}, {'{{amount_due}}'}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((tmpl) => (
                <div key={tmpl.id} className="flex items-start justify-between rounded-lg border p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{tmpl.name}</p>
                      <Badge variant="outline" className="text-xs">{tmpl.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tmpl.body}</p>
                    {tmpl.variables && JSON.parse(tmpl.variables).length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {JSON.parse(tmpl.variables).map((v: string) => (
                          <Badge key={v} variant="secondary" className="text-[10px]">{`{{${v}}}`}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteTemplate(tmpl.id)}><Trash2 size={14} /></Button>
                </div>
              ))}
              {!templates.length && <p className="text-sm text-muted-foreground text-center py-4">No templates yet.</p>}
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
