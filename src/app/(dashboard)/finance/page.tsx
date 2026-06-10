'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, CreditCard, DollarSign, UserCheck, AlertTriangle } from 'lucide-react';
import { useFinanceStore } from '@/stores/finance';
import { useStaffStore } from '@/stores/staff';
import { RecordPaymentDialog } from '@/components/finance/record-payment-dialog';

const statusConfig = {
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  partial: { label: 'Partial', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  unpaid: { label: 'Unpaid', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

export default function FinancePage() {
  const records = useFinanceStore((s) => s.records);
  const staff = useStaffStore((s) => s.staff);
  const accountants = useMemo(() => staff.filter((m) => m.staffType === 'accountant' && m.status === 'active'), [staff]);
  const [filter, setFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid' | 'overdue'>('all');

  const filteredRecords = filter === 'all' ? records : records.filter((r) => r.status === filter);

  const totalExpected = records.reduce((sum, r) => sum + r.amount, 0);
  const totalCollected = records.reduce((sum, r) => sum + r.paid, 0);
  const totalOutstanding = records.reduce((sum, r) => sum + r.balance, 0);
  const collectionRate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : '0';

  const stats = {
    all: records.length,
    paid: records.filter((r) => r.status === 'paid').length,
    partial: records.filter((r) => r.status === 'partial').length,
    unpaid: records.filter((r) => r.status === 'unpaid').length,
    overdue: records.filter((r) => r.status === 'overdue').length,
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-cyan-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Finance</h1>
          <p className="text-muted-foreground">Track fee payments and outstanding balances.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" /> Export
          </Button>
          <RecordPaymentDialog />
        </div>
      </motion.div>

      {accountants.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="flex items-center gap-3 p-4 text-sm">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span className="text-amber-800 dark:text-amber-200">
                No accountant assigned. Add a staff member with the <strong>Accountant</strong> role to manage finances.
              </span>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {accountants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4 text-sm">
              <UserCheck size={16} className="text-primary shrink-0" />
              <span className="text-muted-foreground">
                Managed by: <strong>{accountants.map((a) => a.name).join(', ')}</strong>
              </span>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Expected</p>
                <p className="text-xl font-bold">GH₵ {totalExpected.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Collected</p>
                <p className="text-xl font-bold">GH₵ {totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2 text-red-600">
                <TrendingDown size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold">GH₵ {totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Collection Rate</p>
                <p className="text-xl font-bold">{collectionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Fee Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => v && setFilter(v as typeof filter)}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
                <TabsTrigger value="paid">Paid ({stats.paid})</TabsTrigger>
                <TabsTrigger value="partial">Partial ({stats.partial})</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid ({stats.unpaid})</TabsTrigger>
                <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
              </TabsList>

              <TabsContent value={filter}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const status = statusConfig[record.status];
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                  {getInitials(record.studentName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{record.studentName}</span>
                            </div>
                          </TableCell>
                          <TableCell>GH₵ {record.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-emerald-600">GH₵ {record.paid.toLocaleString()}</TableCell>
                          <TableCell className={record.balance > 0 ? 'text-red-600' : ''}>
                            GH₵ {record.balance.toLocaleString()}
                          </TableCell>
                          <TableCell>{record.dueDate}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={status.className}>
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
