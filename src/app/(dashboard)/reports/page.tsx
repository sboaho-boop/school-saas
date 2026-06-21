'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Download, Printer, Users, BarChart3, DollarSign, ClipboardCheck, School, FileText } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useStudentStore } from '@/stores/students';
import { useStaffStore } from '@/stores/staff';
import { useFinanceStore } from '@/stores/finance';
import { useAttendanceStore } from '@/stores/attendance';
import { useAcademicsStore } from '@/stores/academics';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const { students, fetchStudents } = useStudentStore();
  const { staff } = useStaffStore();
  const { records: feeRecords, fetchRecords } = useFinanceStore();
  const { records: attRecords, fetchRecords: fetchAttendance } = useAttendanceStore();
  const { classes, fetchClasses } = useAcademicsStore();
  const [tab, setTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState('');
  const [feesClass, setFeesClass] = useState('');
  const [attClass, setAttClass] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [classStudents, setClassStudents] = useState<any[]>([]);

  useEffect(() => { fetchStudents(); fetchRecords(); fetchAttendance(); fetchClasses(); }, [fetchStudents, fetchRecords, fetchAttendance, fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      setClassStudents(students.filter((s) => s.classId === selectedClass));
    }
  }, [selectedClass, students]);

  const activeStudents = students.filter((s) => s.status === 'active').length;
  const totalStaff = staff.length;
  const totalFees = feeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = feeRecords.reduce((sum, r) => sum + r.paid, 0);
  const todayAtt = attRecords.filter((r) => r.date === new Date().toISOString().split('T')[0]);
  const presentCount = todayAtt.filter((r) => r.status === 'present').length;

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

  const filteredFees = feesClass ? feeRecords.filter((r) => {
    const s = students.find((st) => st.id === r.studentId);
    return s?.classId === feesClass;
  }) : feeRecords;

  const attSummary = useMemo(() => {
    const map = new Map<string, { present: number; absent: number; late: number; total: number }>();
    const filtered = attClass ? attRecords.filter((r) => r.classId === attClass) : attRecords;
    for (const r of filtered) {
      const key = r.studentId;
      if (!map.has(key)) map.set(key, { present: 0, absent: 0, late: 0, total: 0 });
      const d = map.get(key)!;
      d.total++;
      if (r.status === 'present') d.present++;
      else if (r.status === 'absent') d.absent++;
      else if (r.status === 'late') d.late++;
    }
    return Array.from(map.entries()).map(([studentId, data]) => {
      const s = students.find((st) => st.id === studentId);
      return { studentId, studentName: s ? `${s.firstName} ${s.lastName}` : 'Unknown', ...data, rate: data.total ? Math.round((data.present / data.total) * 100) : 0 };
    });
  }, [attClass, attRecords, students]);

  const selClass = classes.find((c) => c.id === selectedClass);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Reports</h1>
          <p className="text-muted-foreground">Generate, view, and print school reports.</p>
        </div>
      </motion.div>

      <Tabs value={tab} onValueChange={(v) => v && setTab(v)}>
        <TabsList className="print:hidden">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="class">Class Report</TabsTrigger>
          <TabsTrigger value="fees">Fees Report</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Report</TabsTrigger>
          <TabsTrigger value="endterm">End of Term</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { icon: Users, label: 'Active Students', value: activeStudents.toString(), color: '#6366f1' },
              { icon: BarChart3, label: 'Staff', value: totalStaff.toString(), color: '#8b5cf6' },
              { icon: DollarSign, label: 'Fees Collected', value: `¢${(totalPaid / 1000).toFixed(1)}K`, color: '#10b981' },
              { icon: ClipboardCheck, label: 'Present Today', value: `${presentCount}/${todayAtt.length}`, color: '#06b6d4' },
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
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader><CardTitle className="text-base font-medium">Fee Status Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} /></PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardHeader><CardTitle className="text-base font-medium">Staff Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={staffByType}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} /><Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Count" /></BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CLASS REPORT */}
        <TabsContent value="class">
          <Card className="border-border/50 shadow-sm print:hidden">
            <CardContent className="p-4">
              <Select value={selectedClass} onValueChange={(v) => v && setSelectedClass(v)}>
                <SelectTrigger className="max-w-xs"><SelectValue placeholder="Select a class..." /></SelectTrigger>
                <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedClass && (
            <div className="space-y-4">
              <div className="flex items-center justify-between print:hidden">
                <p className="text-sm text-muted-foreground">{classStudents.length} students enrolled</p>
                <Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-2" />Print</Button>
              </div>

              <div className="print-report">
                {selClass && <h2 className="text-xl font-bold mb-4 hidden print:block">{selClass.name} — Class Report</h2>}
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">#</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Gender</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Parent</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((s, i) => (
                      <tr key={s.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-2 px-2">{i + 1}</td>
                        <td className="py-2 px-2 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="py-2 px-2 capitalize">{s.gender}</td>
                        <td className="py-2 px-2">{s.parentName}</td>
                        <td className="py-2 px-2">{s.parentPhone}</td>
                        <td className="py-2 px-2"><Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-xs">{s.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* FEES REPORT */}
        <TabsContent value="fees">
          <Card className="border-border/50 shadow-sm print:hidden">
            <CardContent className="p-4">
              <Select value={feesClass} onValueChange={(v) => v && setFeesClass(v)}>
                <SelectTrigger className="max-w-xs"><SelectValue placeholder="Filter by class..." /></SelectTrigger>
                <SelectContent><SelectItem value="___all___">All Classes</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between print:hidden">
              <p className="text-sm text-muted-foreground">{filteredFees.length} records — Total: ¢{filteredFees.reduce((s, r) => s + r.amount, 0).toLocaleString()} | Collected: ¢{filteredFees.reduce((s, r) => s + r.paid, 0).toLocaleString()} | Outstanding: ¢{filteredFees.reduce((s, r) => s + r.balance, 0).toLocaleString()}</p>
              <Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-2" />Print</Button>
            </div>

            <div className="print-report">
              <h2 className="text-xl font-bold mb-4 hidden print:block">Fees Report — {new Date().toLocaleDateString()}</h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Student</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Amount</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Paid</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Balance</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((r, i) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-2 px-2">{i + 1}</td>
                      <td className="py-2 px-2 font-medium">{r.studentName}</td>
                      <td className="py-2 px-2 text-right">¢{r.amount.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">¢{r.paid.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">¢{r.balance.toLocaleString()}</td>
                      <td className="py-2 px-2 text-center"><Badge variant={r.status === 'paid' ? 'default' : r.status === 'partial' ? 'secondary' : 'destructive'} className="text-xs capitalize">{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border font-semibold">
                    <td colSpan={2} className="py-2 px-2">Totals</td>
                    <td className="py-2 px-2 text-right">¢{filteredFees.reduce((s, r) => s + r.amount, 0).toLocaleString()}</td>
                    <td className="py-2 px-2 text-right">¢{filteredFees.reduce((s, r) => s + r.paid, 0).toLocaleString()}</td>
                    <td className="py-2 px-2 text-right">¢{filteredFees.reduce((s, r) => s + r.balance, 0).toLocaleString()}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ATTENDANCE REPORT */}
        <TabsContent value="attendance">
          <Card className="border-border/50 shadow-sm print:hidden">
            <CardContent className="flex gap-3 p-4">
              <Select value={attClass} onValueChange={(v) => v && setAttClass(v)}>
                <SelectTrigger className="max-w-xs"><SelectValue placeholder="Filter by class..." /></SelectTrigger>
                <SelectContent><SelectItem value="___all___">All Classes</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} className="max-w-[200px]" />
              <Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-2" />Print</Button>
            </CardContent>
          </Card>

          <div className="print-report">
            <h2 className="text-xl font-bold mb-4 hidden print:block">Attendance Report — {attDate}</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">#</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Student</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Present</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Absent</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Late</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Rate</th>
                </tr>
              </thead>
              <tbody>
                {attSummary.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No attendance records found</td></tr>
                ) : attSummary.map((s, i) => (
                  <tr key={s.studentId} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2 px-2">{i + 1}</td>
                    <td className="py-2 px-2 font-medium">{s.studentName}</td>
                    <td className="py-2 px-2 text-center text-emerald-600 font-medium">{s.present}</td>
                    <td className="py-2 px-2 text-center text-red-500 font-medium">{s.absent}</td>
                    <td className="py-2 px-2 text-center text-amber-500 font-medium">{s.late}</td>
                    <td className="py-2 px-2 text-center"><Badge variant={s.rate >= 80 ? 'default' : s.rate >= 60 ? 'secondary' : 'destructive'} className="text-xs">{s.rate}%</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* END OF TERM */}
        <TabsContent value="endterm">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/50 shadow-sm col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  End of Term Report Cards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Generate printable report cards for all students. Select a class, term, and student to view their full academic report with subject scores, component breakdown, grades, and class position.</p>
                <Link href="/reports/report-cards">
                  <Button className="gap-2"><FileText size={16} />Go to Report Cards</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader><CardTitle className="text-sm"><School size={16} className="inline mr-1" />Class Performance</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-xs text-muted-foreground">Total classes</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardHeader><CardTitle className="text-sm"><Users size={16} className="inline mr-1" />Students Assessed</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{activeStudents}</p>
                <p className="text-xs text-muted-foreground">Active students</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardHeader><CardTitle className="text-sm"><DollarSign size={16} className="inline mr-1" />Fees Collected</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">¢{totalPaid.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">of ¢{totalFees.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print-report { display: block !important; }
          .hidden.print\\:block { display: block !important; }
          @page { margin: 15mm; }
        }
      `}</style>
    </div>
  );
}
