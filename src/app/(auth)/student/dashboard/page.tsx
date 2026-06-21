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
import { api, getToken, setToken } from '@/lib/api';
import { GraduationCap, Wallet, Check, X, Clock, AlertCircle, Eye, LogOut, Send, Plus, FileText } from 'lucide-react';

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
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut size={14} className="mr-1" />Sign Out</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold">{data?.name}</h1>
          <p className="text-sm text-muted-foreground">{data?.className}</p>
        </motion.div>

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
            <CardHeader><CardTitle className="text-sm">Marks</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {data.grades.map((g: any) => (
                  <div key={g.id} className="flex justify-between text-sm py-1 border-b border-border/30">
                    <span>Score: {g.score}</span>
                    <span className="font-bold">{g.grade && `(${g.grade})`}</span>
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
