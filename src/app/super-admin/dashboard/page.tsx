'use client';

import { useEffect, useState } from 'react';
import { useSuperAdminStore } from '@/stores/super-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Users, UserCog, CreditCard, Plus, MessageSquareText, Shield, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { superApi } from '@/lib/super-api';

interface FeedbackItem {
  id: string; schoolId: string; userId: string; userName: string; userEmail: string; schoolName: string;
  subject: string; message: string; status: string; reply: string | null; repliedAt: string | null; createdAt: string;
  assignedTo: { id: string; name: string; email: string } | null;
}

interface SuperAdmin {
  id: string; email: string; name: string; role: string; createdAt: string;
}

export default function SuperAdminDashboard() {
  const { schools, fetchSchools } = useSuperAdminStore();
  const [tab, setTab] = useState<'overview' | 'feedback' | 'admins'>('overview');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [admins, setAdmins] = useState<SuperAdmin[]>([]);
  const [fbLoading, setFbLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [replyDialog, setReplyDialog] = useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  const fetchFeedback = async () => {
    setFbLoading(true);
    try { setFeedbacks(await superApi.get<FeedbackItem[]>('/super/feedback')); } catch { /* ignore */ }
    setFbLoading(false);
  };

  const fetchAdmins = async () => {
    setAdminLoading(true);
    try { setAdmins(await superApi.get<SuperAdmin[]>('/super/admins')); } catch { /* ignore */ }
    setAdminLoading(false);
  };

  useEffect(() => { fetchFeedback(); fetchAdmins(); }, []);
  useEffect(() => { if (tab === 'feedback') fetchFeedback(); if (tab === 'admins') fetchAdmins(); }, [tab]);

  const handleReply = async () => {
    if (!replyDialog || !replyText) return;
    await superApi.put(`/super/feedback/${replyDialog.id}`, { reply: replyText, status: 'resolved' });

    setReplyDialog(null); setReplyText(''); fetchFeedback();
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    await superApi.post('/super/admins', { email: newAdminEmail, password: newAdminPassword, name: newAdminName });

    setAddAdminOpen(false); setNewAdminEmail(''); setNewAdminPassword(''); setNewAdminName('');
    fetchAdmins();
  };

  const handleRemoveAdmin = async (id: string) => {
    if (!confirm('Remove this admin?')) return;
    await superApi.delete(`/super/admins/${id}`);

    fetchAdmins();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await superApi.put(`/super/feedback/${id}`, { status });

    fetchFeedback();
  };

  const totals = schools.reduce((acc, s) => ({
    students: acc.students + (s._count?.students || 0),
    staff: acc.staff + (s._count?.staff || 0),
    users: acc.users + (s._count?.users || 0),
  }), { students: 0, staff: 0, users: 0 });

  const subs = { free: schools.filter((s) => s.subscriptions?.[0]?.plan === 'free').length, pro: schools.filter((s) => s.subscriptions?.[0]?.plan === 'pro' || s.subscriptions?.[0]?.plan === 'premium').length, enterprise: schools.filter((s) => s.subscriptions?.[0]?.plan === 'enterprise').length };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Dashboard</h1>
          <p className="text-muted-foreground">Manage schools, feedback, and platform administrators.</p>
        </div>
        <Link href="/super-admin/schools/new"><Button size="sm"><Plus size={16} className="mr-2" />Add School</Button></Link>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <Button variant={tab === 'overview' ? 'default' : 'outline'} size="sm" onClick={() => setTab('overview')}>Overview</Button>
        <Button variant={tab === 'feedback' ? 'default' : 'outline'} size="sm" onClick={() => setTab('feedback')}>
          <MessageSquareText size={14} className="mr-1.5" /> Feedback ({feedbacks.filter(f => f.status === 'open').length})
        </Button>
        <Button variant={tab === 'admins' ? 'default' : 'outline'} size="sm" onClick={() => setTab('admins')}>
          <Shield size={14} className="mr-1.5" /> Admins ({admins.length})
        </Button>
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader className="flex-row items-center gap-3 pb-2"><Building2 size={18} className="text-indigo-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Schools</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{schools.length}</p></CardContent></Card>
            <Card><CardHeader className="flex-row items-center gap-3 pb-2"><Users size={18} className="text-emerald-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totals.students}</p></CardContent></Card>
            <Card><CardHeader className="flex-row items-center gap-3 pb-2"><UserCog size={18} className="text-amber-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Staff</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totals.staff}</p></CardContent></Card>
            <Card><CardHeader className="flex-row items-center gap-3 pb-2"><CreditCard size={18} className="text-cyan-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Free / Pro / Enterprise</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{subs.free}<span className="text-base font-normal text-muted-foreground"> / {subs.pro} / {subs.enterprise}</span></p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">All Schools</CardTitle><Link href="/super-admin/schools"><Button variant="outline" size="sm">Manage Schools</Button></Link></div></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Code</th><th className="pb-3 font-medium">School</th><th className="pb-3 font-medium">Plan</th><th className="pb-3 font-medium">Students</th><th className="pb-3 font-medium">Staff</th><th className="pb-3 font-medium">Created</th></tr></thead>
                  <tbody>
                    {schools.map((s) => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 font-mono text-xs text-muted-foreground">{s.code}</td>
                        <td className="py-3 font-medium">{s.name}</td>
                        <td className="py-3"><span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-600">{s.subscriptions?.[0]?.plan || 'free'}</span></td>
                        <td className="py-3">{s._count?.students || 0}</td>
                        <td className="py-3">{s._count?.staff || 0}</td>
                        <td className="py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {schools.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No schools yet. <Link href="/super-admin/schools/new" className="text-indigo-500 hover:underline">Create one</Link></td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Feedback & Reports</h2>
            <Button variant="outline" size="sm" onClick={fetchFeedback} disabled={fbLoading}>Refresh</Button>
          </div>
          {fbLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedback yet. School staff can submit feedback from their sidebar.</p>
          ) : (
            <div className="grid gap-3">
              {feedbacks.map((fb) => (
                <Card key={fb.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{fb.subject}</span>
                          <Badge variant={fb.status === 'open' ? 'default' : fb.status === 'resolved' ? 'secondary' : 'outline'}>{fb.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          From: {fb.userName} ({fb.userEmail}) — {fb.schoolName || 'Unknown school'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {fb.status === 'open' && (
                          <>
                            <button onClick={() => setReplyDialog(fb)} className="text-xs text-muted-foreground hover:text-primary transition-colors">Reply</button>
                            <button onClick={() => handleStatusChange(fb.id, 'closed')} className="text-xs text-muted-foreground hover:text-red-500 transition-colors">Close</button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{fb.message}</p>
                    {fb.reply && (
                      <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Reply from {fb.assignedTo?.name || 'Admin'} ({fb.repliedAt ? new Date(fb.repliedAt).toLocaleDateString() : ''})</p>
                        <p>{fb.reply}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground">{new Date(fb.createdAt).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Dialog open={!!replyDialog} onOpenChange={(o) => { if (!o) setReplyDialog(null); }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Reply to Feedback</DialogTitle><DialogDescription>Respond to: {replyDialog?.subject}</DialogDescription></DialogHeader>
              <div className="space-y-3 py-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{replyDialog?.message}</p>
                <div className="space-y-2">
                  <Label htmlFor="reply">Your Reply</Label>
                  <textarea id="reply" rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-y" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button onClick={handleReply} disabled={!replyText}>Send Reply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {tab === 'admins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Platform Administrators</h2>
            <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
              <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" /> Add Admin</Button>} />
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleAddAdmin}>
                  <DialogHeader><DialogTitle>Add Co-Admin</DialogTitle><DialogDescription>Grant another person access to manage the platform.</DialogDescription></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2"><Label>Full Name</Label><Input value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Password</Label><Input type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} required /></div>
                  </div>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline">Cancel</Button>} />
                    <Button type="submit">Add Admin</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {adminLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admins found.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {admins.map((a) => (
                <Card key={a.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className={a.role === 'owner' ? 'text-amber-500' : 'text-primary'} />
                        <span className="font-medium">{a.name}</span>
                      </div>
                      <Badge variant={a.role === 'owner' ? 'default' : 'outline'}>{a.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.email}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Since {new Date(a.createdAt).toLocaleDateString()}</span>
                      {a.role !== 'owner' && (
                        <button onClick={() => handleRemoveAdmin(a.id)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
