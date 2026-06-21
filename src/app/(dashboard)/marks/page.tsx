'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAcademicsStore } from '@/stores/academics';
import { useStudentStore } from '@/stores/students';
import { useMarksStore, COMPONENT_NAMES, COMPONENT_LABELS, COMPONENT_MAX, Grade } from '@/stores/marks';
import { useAuthStore } from '@/stores/auth';
import { ImportDialog } from '@/components/import-dialog';
import Link from 'next/link';
import { Save, Printer, FileText } from 'lucide-react';

function calcTotal(components: Record<string, string>): number {
  return COMPONENT_NAMES.reduce((sum, name) => sum + (parseFloat(components[name]) || 0), 0);
}

function scoreToGrade(total: number): string {
  if (total >= 80) return 'A';
  if (total >= 70) return 'B';
  if (total >= 60) return 'C';
  if (total >= 50) return 'D';
  if (total >= 40) return 'E';
  return 'F';
}

export default function MarksPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const classes = useAcademicsStore((s) => s.classes);
  const fetchClasses = useAcademicsStore((s) => s.fetchClasses);
  const subjects = useAcademicsStore((s) => s.subjects);
  const fetchSubjects = useAcademicsStore((s) => s.fetchSubjects);
  const terms = useAcademicsStore((s) => s.terms);
  const fetchTerms = useAcademicsStore((s) => s.fetchTerms);
  const students = useStudentStore((s) => s.students);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const { grades, fetchGrades, saveGrade, loading } = useMarksStore();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [components, setComponents] = useState<Record<string, Record<string, string>>>({});

  const isTeaching = currentUser?.staffType === 'teaching';
  const availableClasses = isTeaching
    ? classes.filter((c) => c.name === currentUser?.assignedClass)
    : classes;

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchStudents();
    fetchTerms();
  }, [fetchClasses, fetchSubjects, fetchStudents, fetchTerms]);

  useEffect(() => {
    if (terms.length > 0 && !selectedTerm) {
      const active = terms.find((t) => t.isActive);
      if (active) setSelectedTerm(active.id);
      else setSelectedTerm(terms[0].id);
    }
  }, [terms, selectedTerm]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedTerm) {
      fetchGrades({ classId: selectedClass, subjectId: selectedSubject, termId: selectedTerm });
    }
  }, [selectedClass, selectedSubject, selectedTerm, fetchGrades]);

  useEffect(() => {
    if (grades.length > 0) {
      const map: Record<string, Record<string, string>> = {};
      grades.forEach((g) => {
        let comps: Record<string, string> = {};
        try { comps = JSON.parse(g.components || '{}'); } catch { comps = {}; }
        map[g.studentId] = comps;
      });
      setComponents((prev) => ({ ...prev, ...map }));
    }
  }, [grades]);

  const classStudents = students.filter((s) => s.classId === selectedClass);

  const handleSave = async (studentId: string) => {
    const studentComps = components[studentId] || {};
    const hasAny = COMPONENT_NAMES.some((n) => studentComps[n] && studentComps[n] !== '');
    if (!hasAny) return;
    await saveGrade({
      studentId,
      subjectId: selectedSubject,
      classId: selectedClass,
      termId: selectedTerm,
      score: 0,
      grade: '',
      components: JSON.stringify(studentComps),
      remarks: '',
    });
  };

  const updateComponent = (studentId: string, compName: string, value: string) => {
    setComponents((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [compName]: value },
    }));
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Continuous Assessment</h1>
          <p className="text-muted-foreground">Enter component scores. Total and grade auto-calculate.</p>
        </div>
        <div className="flex gap-2">
          <ImportDialog resource="marks" onSuccess={() => window.location.reload()} />
          <Link href="/marks/print"><Button variant="outline" size="sm"><Printer size={16} className="mr-2" />QR Sheets</Button></Link>
          {selectedTerm && selectedClass && (
            <Link href={`/reports?classId=${selectedClass}&termId=${selectedTerm}`}><Button variant="outline" size="sm"><FileText size={16} className="mr-2" />Report Cards</Button></Link>
          )}
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
        <Select value={selectedTerm} onValueChange={(v) => v && setSelectedTerm(v)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select term" /></SelectTrigger>
          <SelectContent>
            {terms.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name} {t.academicYear} {t.isActive ? '(Active)' : ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClass && selectedSubject && selectedTerm && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Score Entry</CardTitle>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {COMPONENT_NAMES.map((n) => (
                  <span key={n}>{COMPONENT_LABELS[n]}/{COMPONENT_MAX[n]}</span>
                ))}
                <span className="font-semibold text-foreground">Total/100</span>
                <span className="font-semibold text-foreground">Grade</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {classStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students in this class.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {classStudents.map((student) => {
                  const comps = components[student.id] || {};
                  const total = calcTotal(comps);
                  const grade = total > 0 ? scoreToGrade(total) : '-';
                  return (
                    <div key={student.id} className="flex items-center gap-2 py-2">
                      <div className="w-44 shrink-0">
                        <p className="text-sm font-medium truncate">{student.firstName} {student.lastName}</p>
                      </div>
                      {COMPONENT_NAMES.map((name) => (
                        <Input
                          key={name}
                          type="number"
                          min="0"
                          max={COMPONENT_MAX[name]}
                          className="w-16 text-center text-xs h-8"
                          placeholder="0"
                          value={comps[name] ?? ''}
                          onChange={(e) => updateComponent(student.id, name, e.target.value)}
                        />
                      ))}
                      <div className="w-12 text-center text-sm font-bold">{total > 0 ? total : '-'}</div>
                      <div className="w-8 text-center">
                        {total > 0 && <Badge variant={grade === 'F' ? 'destructive' : grade === 'A' ? 'default' : 'secondary'} className="text-xs">{grade}</Badge>}
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => handleSave(student.id)} disabled={loading}>
                        <Save size={14} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
