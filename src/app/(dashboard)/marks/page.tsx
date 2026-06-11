'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAcademicsStore } from '@/stores/academics';
import { useStudentStore } from '@/stores/students';
import { useMarksStore } from '@/stores/marks';
import { useAuthStore } from '@/stores/auth';
import { ImportDialog } from '@/components/import-dialog';
import Link from 'next/link';
import { Save, Upload, Printer } from 'lucide-react';

export default function MarksPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const classes = useAcademicsStore((s) => s.classes);
  const fetchClasses = useAcademicsStore((s) => s.fetchClasses);
  const subjects = useAcademicsStore((s) => s.subjects);
  const fetchSubjects = useAcademicsStore((s) => s.fetchSubjects);
  const students = useStudentStore((s) => s.students);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const { grades, fetchGrades, saveGrade, loading } = useMarksStore();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({});

  const isTeaching = currentUser?.staffType === 'teaching';
  const availableClasses = isTeaching
    ? classes.filter((c) => c.name === currentUser?.assignedClass)
    : classes;

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchStudents();
  }, [fetchClasses, fetchSubjects, fetchStudents]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchGrades({ classId: selectedClass, subjectId: selectedSubject });
    }
  }, [selectedClass, selectedSubject, fetchGrades]);

  useEffect(() => {
    if (grades.length > 0) {
      const map: Record<string, string> = {};
      grades.forEach((g) => { map[g.studentId] = String(g.score); });
      setScores((prev) => ({ ...prev, ...map }));
    }
  }, [grades]);

  const classStudents = students.filter((s) => s.classId === selectedClass);

  const handleSave = async (studentId: string) => {
    const score = parseFloat(scores[studentId]);
    if (isNaN(score)) return;
    await saveGrade({
      studentId,
      subjectId: selectedSubject,
      classId: selectedClass,
      termId: '',
      score,
      grade: '',
      remarks: '',
    });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Marks Entry</h1>
          <p className="text-muted-foreground">Enter and manage student scores.</p>
        </div>
        <div className="flex gap-2">
          <ImportDialog resource="marks" onSuccess={() => window.location.reload()} />
          <Link href="/marks/print"><Button variant="outline" size="sm"><Printer size={16} className="mr-2" />QR Sheets</Button></Link>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedClass} onValueChange={(v) => v && setSelectedClass(v)}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select class" /></SelectTrigger>
          <SelectContent>
            {availableClasses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedSubject} onValueChange={(v) => v && setSelectedSubject(v)}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select subject" /></SelectTrigger>
          <SelectContent>
            {selectedClass && subjects.filter((s) => s.classId === selectedClass).map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>{sub.name} ({sub.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClass && selectedSubject && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base font-medium">Score Entry</CardTitle></CardHeader>
          <CardContent>
            {classStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students in this class.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {classStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-muted-foreground">{student.className}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        className="w-20 text-center"
                        placeholder="Score"
                        value={scores[student.id] ?? ''}
                        onChange={(e) => setScores((prev) => ({ ...prev, [student.id]: e.target.value }))}
                      />
                      <Button size="sm" variant="outline" onClick={() => handleSave(student.id)} disabled={loading}>
                        <Save size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
