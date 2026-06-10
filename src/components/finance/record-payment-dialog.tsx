'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceStore } from '@/stores/finance';
import { useStudentStore } from '@/stores/students';
import { Plus } from 'lucide-react';

export function RecordPaymentDialog() {
  const { addRecord, recordPayment, records } = useFinanceStore();
  const students = useStudentStore((s) => s.students);
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [mode, setMode] = useState<'new' | 'payment'>('new');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'new') {
      if (!studentId || !amount || !dueDate) return;
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      addRecord({
        studentId, studentName: `${student.firstName} ${student.lastName}`,
        amount: parseFloat(amount), paid: 0, balance: parseFloat(amount),
        dueDate, status: 'unpaid',
      });
    } else {
      if (!studentId || !paymentAmount) return;
      const record = records.find((r) => r.studentId === studentId && r.balance > 0);
      if (!record) return;
      recordPayment(record.id, parseFloat(paymentAmount));
    }
    setOpen(false);
    setStudentId(''); setAmount(''); setPaymentAmount('');
    setDueDate(''); setMode('new');
  };

  const activeStudents = students.filter((s) => s.status === 'active');
  const debtors = records.filter((r) => r.balance > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" /> Record Payment</Button>} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a new fee or process a payment from a student.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={mode} onValueChange={(v) => v && setMode(v as 'new' | 'payment')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Create New Fee Record</SelectItem>
                  <SelectItem value="payment">Record Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select value={studentId} onValueChange={(v) => v && setStudentId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {mode === 'payment'
                    ? debtors.map((r) => {
                        const student = activeStudents.find((s) => s.id === r.studentId);
                        return (
                          <SelectItem key={r.id} value={r.studentId}>
                            {r.studentName} (Balance: GH₵ {r.balance})
                          </SelectItem>
                        );
                      })
                    : activeStudents.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} — {s.className}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
            {mode === 'new' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Fee Amount (GH₵)</Label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount (GH₵)</Label>
                <Input id="paymentAmount" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">{mode === 'new' ? 'Create Fee Record' : 'Record Payment'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
