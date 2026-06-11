'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, setToken } from '@/lib/api';
import { GraduationCap, Wallet, ArrowLeft, LogOut, Check, X, Clock, AlertCircle, Eye, Plus } from 'lucide-react';

interface ChildSummary {
  id: string;
  name: string;
  className: string;
  wallet?: { balance: number; totalSpent: number; frozen: boolean };
  attendanceRecs?: any[];
  grades?: any[];
  transactions?: any[];
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [selected, setSelected] = useState<ChildSummary | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/parent/login'); return; }
    api.get<ChildSummary[]>('/parent/children').then((data) => {
      setChildren(data);
      setLoading(false);
    }).catch(() => { setToken(null); router.push('/parent/login'); });
  }, [router]);

  const fetchChild = async (id: string) => {
    const data = await api.get<ChildSummary>(`/parent/children/${id}`);
    setSelected(data);
  };

  const handleTopUp = async () => {
    if (!selected || !topUpAmount) return;
    await api.post('/parent/wallet/top-up', { studentId: selected.id, amount: parseFloat(topUpAmount) });
    setTopUpAmount('');
    fetchChild(selected.id);
  };

  const handleLogout = () => { setToken(null); router.push('/parent/login'); };

  const statusIcons: Record<string, any> = { present: <Check size={14} />, absent: <X size={14} />, late: <Clock size={14} />, excused: <AlertCircle size={14} /> };
  const statusColors: Record<string, string> = { present: 'text-emerald-600', absent: 'text-red-600', late: 'text-amber-600', excused: 'text-blue-600' };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <span className="font-semibold">EduPlatform Parent</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut size={14} className="mr-1" />Sign Out</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {selected ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}><ArrowLeft size={14} className="mr-1" />Back</Button>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{selected.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selected.className}</p>
                </CardHeader>
              </Card>
            </motion.div>

            {selected.wallet && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Wallet size={16} />Wallet</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">GHS {selected.wallet.balance.toFixed(2)}</span>
                    {selected.wallet.frozen && <Badge variant="secondary">Frozen</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Amount" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
                    <Button onClick={handleTopUp}><Plus size={16} className="mr-1" />Top Up</Button>
                  </div>
                  {selected.transactions && selected.transactions.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      <p className="text-xs font-medium text-muted-foreground mt-2">Recent Transactions</p>
                      {selected.transactions.map((tx: any) => (
                        <div key={tx.id} className="flex justify-between text-xs py-1 border-b border-border/30">
                          <span className={tx.type === 'topup' ? 'text-emerald-600' : 'text-red-600'}>
                            {tx.type === 'topup' ? '+' : ''}{tx.amount > 0 ? '+' : ''}GHS {Math.abs(tx.amount).toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selected.attendanceRecs && selected.attendanceRecs.length > 0 && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye size={16} />Recent Attendance</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {selected.attendanceRecs.slice(0, 10).map((a: any) => (
                      <div key={a.id} className="flex justify-between text-sm py-1 border-b border-border/30">
                        <span>{a.date}</span>
                        <span className={`flex items-center gap-1 capitalize ${statusColors[a.status]}`}>{statusIcons[a.status]}{a.status}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selected.grades && selected.grades.length > 0 && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader><CardTitle className="text-sm">Recent Marks</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {selected.grades.slice(0, 10).map((g: any) => (
                      <div key={g.id} className="flex justify-between text-sm py-1 border-b border-border/30">
                        <span>Subject: {g.subjectId?.slice(0, 8)}...</span>
                        <span className="font-bold">{g.score} {g.grade && `(${g.grade})`}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-xl font-bold">My Children</h1>
              <p className="text-sm text-muted-foreground">Select a child to view their details.</p>
            </motion.div>

            <div className="grid gap-3">
              {children.map((child) => (
                <motion.div key={child.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-border/50 shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fetchChild(child.id)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-muted-foreground">{child.className}</p>
                      </div>
                      <div className="text-right">
                        {child.wallet ? (
                          <p className="text-sm font-bold">GHS {child.wallet.balance.toFixed(2)}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">No wallet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
