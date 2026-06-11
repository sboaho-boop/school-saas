'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useWalletStore } from '@/stores/wallet';
import { useStudentStore } from '@/stores/students';
import { Wallet, CreditCard, Plus, Snowflake, Unlock, Search } from 'lucide-react';

export default function WalletPage() {
  const { wallets, loading, fetchWallets, topUp, freezeCard, unfreezeCard, linkCard } = useWalletStore();
  const { students, fetchStudents } = useStudentStore();
  const [search, setSearch] = useState('');
  const [topUpStudent, setTopUpStudent] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [cardUid, setCardUid] = useState('');
  const [linkStudent, setLinkStudent] = useState('');

  useEffect(() => { fetchWallets(); fetchStudents(); }, [fetchWallets, fetchStudents]);

  const filtered = wallets.filter((w) =>
    w.studentName.toLowerCase().includes(search.toLowerCase())
  );

  const unlinked = students.filter((s) => !wallets.find((w) => w.studentId === s.id));

  const handleTopUp = async () => {
    if (!topUpStudent || !topUpAmount) return;
    await topUp(topUpStudent, parseFloat(topUpAmount), 'cash');
    setTopUpAmount('');
  };

  const handleLinkCard = async () => {
    if (!linkStudent || !cardUid) return;
    await linkCard(linkStudent, cardUid);
    setCardUid('');
    fetchWallets();
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Student Wallets</h1>
          <p className="text-muted-foreground">Manage card balances, top-ups, and NFC cards.</p>
        </div>
        <div className="flex gap-2">
          <CreditCard size={20} className="text-emerald-500" />
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-sm">Quick Top-Up</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select
              value={topUpStudent}
              onChange={(e) => setTopUpStudent(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select student...</option>
              {wallets.map((w) => <option key={w.studentId} value={w.studentId}>{w.studentName} (Balance: {w.balance})</option>)}
            </select>
            <div className="flex gap-2">
              <Input type="number" placeholder="Amount" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
              <Button onClick={handleTopUp}><Plus size={16} className="mr-1" />Add</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-sm">Link NFC Card</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select
              value={linkStudent}
              onChange={(e) => setLinkStudent(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select unlinked student...</option>
              {unlinked.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
            <div className="flex gap-2">
              <Input placeholder="Card UID" value={cardUid} onChange={(e) => setCardUid(e.target.value)} />
              <Button onClick={handleLinkCard}><CreditCard size={16} className="mr-1" />Link</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Wallets</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Card</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.studentName}</TableCell>
                  <TableCell>
                    <span className="font-mono font-bold">GHS {w.balance.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    {w.cardUid ? (
                      <Badge variant="outline" className="font-mono text-xs">{w.cardUid.slice(0, 8)}...</Badge>
                    ) : <span className="text-muted-foreground text-sm">No card</span>}
                  </TableCell>
                  <TableCell>
                    {w.frozen ? <Badge variant="secondary">Frozen</Badge> : <Badge>Active</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {w.frozen ? (
                        <Button size="sm" variant="outline" onClick={() => unfreezeCard(w.studentId)}><Unlock size={14} /></Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => freezeCard(w.studentId)}><Snowflake size={14} /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No wallets yet. Create one from a student profile.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
