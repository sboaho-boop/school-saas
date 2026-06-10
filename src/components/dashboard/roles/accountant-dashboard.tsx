'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertTriangle, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '@/stores/finance';
import { useTaskStore } from '@/stores/tasks';
import { FeeCollectionChart } from '@/components/dashboard/charts';

export function AccountantDashboard() {
  const records = useFinanceStore((s) => s.records);
  const tasks = useTaskStore((s) => s.tasks);

  const totalExpected = records.reduce((sum, r) => sum + r.amount, 0);
  const totalCollected = records.reduce((sum, r) => sum + r.paid, 0);
  const totalOutstanding = records.reduce((sum, r) => sum + r.balance, 0);
  const collectionRate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : '0';
  const overdueCount = records.filter((r) => r.status === 'overdue').length;
  const myTasks = tasks.filter((t) => t.status !== 'completed').length;

  const stats = [
    { title: 'Expected Revenue', value: `GH₵${totalExpected.toLocaleString()}`, icon: DollarSign, color: '#6366f1', trend: null },
    { title: 'Collected', value: `GH₵${totalCollected.toLocaleString()}`, icon: CreditCard, color: '#06b6d4', trend: { value: Number(collectionRate), positive: true } },
    { title: 'Outstanding', value: `GH₵${totalOutstanding.toLocaleString()}`, icon: AlertTriangle, color: '#f59e0b', trend: null },
    { title: 'Overdue Records', value: overdueCount.toString(), icon: TrendingDown, color: '#ef4444', trend: null },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-cyan-500/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Finance Dashboard</h1>
          <p className="text-muted-foreground">Revenue, payments, and outstanding balances.</p>
        </div>
        <Button variant="outline" size="sm"><Download size={16} className="mr-2" />Export Report</Button>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.trend && (
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-500">{stat.trend.value}%</span>
                        <span className="text-xs text-muted-foreground">collection rate</span>
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FeeCollectionChart />
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{myTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">Tasks assigned to you or your team</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
