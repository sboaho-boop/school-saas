'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAttendanceStore, type AttendanceRecord } from '@/stores/attendance';
import { useAcademicsStore } from '@/stores/academics';

export default function AttendancePage() {
  const { records, markAttendance, markAll, fetchRecords, loading } = useAttendanceStore();
  const classes = useAcademicsStore((s) => s.classes);
  const fetchClasses = useAcademicsStore((s) => s.fetchClasses);
  const [selectedClass, setSelectedClass] = useState('');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass) fetchRecords({ classId: selectedClass, date: today });
  }, [selectedClass, fetchRecords, today]);

  const classOptions = classes.map((c) => ({ id: c.id, name: c.name }));
  const activeClass = classOptions.find((c) => c.id === selectedClass);

  const classRecords = records.filter((r) => r.classId === selectedClass && r.date === today);
  const isLoading = loading && classRecords.length === 0;

  const statusIcons = { present: <Check size={14} />, absent: <X size={14} />, late: <Clock size={14} />, excused: <AlertCircle size={14} /> };
  const statusColors = { present: 'bg-emerald-500/10 text-emerald-600', absent: 'bg-red-500/10 text-red-600', late: 'bg-amber-500/10 text-amber-600', excused: 'bg-blue-500/10 text-blue-600' };

  const handleMarkAll = (status: AttendanceRecord['status']) => {
    const studentIds = classRecords.map((r) => r.studentId);
    const className = activeClass?.name || '';
    markAll(studentIds, selectedClass, className, today, status);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Attendance</h1>
          <p className="text-muted-foreground">Mark and track student attendance.</p>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedClass} onValueChange={(v) => v && setSelectedClass(v)}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select class" /></SelectTrigger>
          <SelectContent>
            {classOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">Date: {today}</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => handleMarkAll('present')}><Check size={14} className="mr-1" /> All Present</Button>
          <Button size="sm" variant="outline" className="text-amber-600" onClick={() => handleMarkAll('late')}><Clock size={14} className="mr-1" /> All Late</Button>
          <Button size="sm" variant="outline" className="text-blue-600" onClick={() => handleMarkAll('excused')}><AlertCircle size={14} className="mr-1" /> All Excused</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
          <Card key={status} className="border-border/50 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-full p-2 ${statusColors[status]}`}>{statusIcons[status]}</div>
              <div>
                <p className="text-lg font-bold">{classRecords.filter((r) => r.status === status).length}</p>
                <p className="text-xs text-muted-foreground capitalize">{status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base font-medium">Student Roster</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {classRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{record.studentName}</p>
                  <p className="text-xs text-muted-foreground">{record.className}</p>
                </div>
                <div className="flex gap-1.5">
                  {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => markAttendance(record.studentId, selectedClass, activeClass?.name || '', record.studentName, today, status)}
                      className={`rounded-full p-2 text-xs transition-all ${record.status === status ? statusColors[status] + ' ring-2 ring-offset-1' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                      title={status}
                    >
                      {statusIcons[status]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
