'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentStore } from '@/stores/students';
import { useWalletStore } from '@/stores/wallet';
import { useOrdersStore } from '@/stores/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShoppingCart, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function NewOrderPage() {
  const router = useRouter();
  const { students, fetchStudents } = useStudentStore();
  const { wallets, fetchWallets } = useWalletStore();
  const { createOrder } = useOrdersStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchStudents(); fetchWallets(); }, [fetchStudents, fetchWallets]);

  const noCard = students.filter((s) => !wallets.find((w) => w.studentId === s.id && w.cardUid));

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectAll = () => setSelected(noCard.map((s) => s.id));
  const clearAll = () => setSelected([]);

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
      await createOrder(selected, notes);
      router.push('/wallet/orders');
    } catch { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/wallet/orders">
          <Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Card Order</h1>
          <p className="text-muted-foreground">Select students who need NFC cards printed.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Students without cards ({noCard.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
              <Button variant="outline" size="sm" onClick={clearAll}>Clear</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {noCard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">All students already have cards assigned.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {noCard.map((s) => {
                const isIn = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-all ${
                      isIn ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                      isIn ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                    }`}>
                      {isIn ? <Check size={14} /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.className}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Order Notes (optional)</CardTitle></CardHeader>
        <CardContent>
          <Input
            placeholder="e.g., urgent, term opening batch..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{selected.length}</span> student{selected.length !== 1 ? 's' : ''} selected
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={selected.length === 0 || submitting}>
          <ShoppingCart size={16} className="mr-2" />
          {submitting ? 'Submitting...' : 'Submit Order'}
        </Button>
      </div>
    </div>
  );
}
