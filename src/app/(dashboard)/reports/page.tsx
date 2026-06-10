'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { Download, Users, BarChart3, DollarSign, ClipboardCheck } from 'lucide-react';
import { useStudentStore } from '@/stores/students';
import { useStaffStore } from '@/stores/staff';
import { useFinanceStore } from '@/stores/finance';
import { useAttendanceStore } from '@/stores/attendance';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const { students } = useStudentStore();
  const { staff } = useStaffStore();
  const { records: feeRecords } = useFinanceStore();
  const { records: attRecords } = useAttendanceStore();

  const activeStudents = students.filter((s) => s.status === 'active').length;
  const totalStaff = staff.length;
  const totalFees = feeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = feeRecords.reduce((sum, r) => sum + r.paid, 0);
  const attToday = attRecords.filter((r) => r.date === new Date().toISOString().split('T')[0]);
  const presentCount = attToday.filter((r) => r.status === 'present').length;

  const statusData = [
    { name: 'Paid', value: feeRecords.filter((r) => r.status === 'paid').length },
    { name: 'Partial', value: feeRecords.filter((r) => r.status === 'partial').length },
    { name: 'Unpaid', value: feeRecords.filter((r) => r.status === 'unpaid').length },
    { name: 'Overdue', value: feeRecords.filter((r) => r.status === 'overdue').length },
  ].filter((d) => d.value > 0);

  const staffByType = [
    { name: 'Teaching', value: staff.filter((s) => s.staffType === 'teaching').length },
    { name: 'Non-Teaching', value: staff.filter((s) => s.staffType === 'non-teaching').length },
    { name: 'Headteacher', value: staff.filter((s) => s.staffType === 'headteacher').length },
    { name: 'Admin', value: staff.filter((s) => s.staffType === 'admin').length },
    { name: 'Accountant', value: staff.filter((s) => s.staffType === 'accountant').length },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Reports</h1>
          <p className="text-muted-foreground">Generate and view school reports.</p>
        </div>
        <Button variant="outline" size="sm"><Download size={16} className="mr-2" />Export All</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Users, label: 'Active Students', value: activeStudents.toString(), color: '#6366f1' },
          { icon: BarChart3, label: 'Staff', value: totalStaff.toString(), color: '#8b5cf6' },
          { icon: DollarSign, label: 'Fees Collected', value: `¢${(totalPaid / 1000).toFixed(1)}K`, color: '#10b981' },
          { icon: ClipboardCheck, label: 'Present Today', value: `${presentCount}/${attToday.length}`, color: '#06b6d4' },
        ].map((report, i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2" style={{ backgroundColor: `${report.color}15`, color: report.color }}><report.icon size={20} /></div>
                <div><p className="text-xs text-muted-foreground">{report.label}</p><p className="text-xl font-bold">{report.value}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="text-base font-medium">Fee Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="text-base font-medium">Staff Distribution by Type</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={staffByType}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Staff Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base font-medium">Summary Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-border/50 p-4"><p className="text-xs text-muted-foreground">Total Students</p><p className="text-2xl font-bold">{students.length}</p></div>
              <div className="rounded-lg border border-border/50 p-4"><p className="text-xs text-muted-foreground">Total Fees (Sum)</p><p className="text-2xl font-bold">¢{totalFees.toLocaleString()}</p></div>
              <div className="rounded-lg border border-border/50 p-4"><p className="text-xs text-muted-foreground">Total Collected</p><p className="text-2xl font-bold">¢{totalPaid.toLocaleString()}</p></div>
              <div className="rounded-lg border border-border/50 p-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-2xl font-bold">¢{(totalFees - totalPaid).toLocaleString()}</p></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
