'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAcademicsStore } from '@/stores/academics';
import { useStudentStore } from '@/stores/students';
import { api } from '@/lib/api';
import { Printer, ChevronLeft } from 'lucide-react';

interface SubjectScore {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  score: number;
  grade: string;
  components: Record<string, number>;
  remarks: string;
}

interface ReportCard {
  student: { id: string; firstName: string; lastName: string; className: string };
  term: { name: string; academicYear: string };
  subjects: SubjectScore[];
  totalScore: number;
  totalSubjects: number;
  average: number;
  overallGrade: string;
}

interface Ranking {
  studentId: string;
  studentName: string;
  totalScore: number;
  position: number;
}

export default function ReportCardsPage() {
  const classes = useAcademicsStore((s) => s.classes);
  const fetchClasses = useAcademicsStore((s) => s.fetchClasses);
  const terms = useAcademicsStore((s) => s.terms);
  const fetchTerms = useAcademicsStore((s) => s.fetchTerms);
  const students = useStudentStore((s) => s.students);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [report, setReport] = useState<ReportCard | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => { fetchClasses(); fetchTerms(); fetchStudents(); }, [fetchClasses, fetchTerms, fetchStudents]);

  const classStudents = students.filter((s) => s.classId === selectedClass);

  const fetchReport = async (studentId: string) => {
    if (!selectedTerm || !studentId) return;
    setLoadingReport(true);
    try {
      const [reportData, rankingsData] = await Promise.all([
        api.get<ReportCard>(`/marks/report-card/${studentId}/${selectedTerm}`),
        api.get<Ranking[]>(`/marks/rankings/${selectedClass}/${selectedTerm}`),
      ]);
      setReport(reportData);
      setRankings(rankingsData);
      setSelectedStudent(studentId);
    } catch { setReport(null); } finally { setLoadingReport(false); }
  };

  const handleBack = () => { setSelectedStudent(''); setReport(null); setRankings([]); };

  if (selectedStudent && report) {
    const studentRank = rankings.find((r) => r.studentId === selectedStudent);
    return (
      <div className="space-y-6 print:space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={handleBack}><ChevronLeft size={16} className="mr-1" />Back</Button>
          <Button variant="outline" onClick={() => window.print()}><Printer size={16} className="mr-2" />Print</Button>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="text-center border-b pb-4">
            <CardTitle className="text-2xl font-bold">Report Card</CardTitle>
            <p className="text-muted-foreground">{report.term.name} — {report.term.academicYear}</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Student:</span> <span className="font-semibold">{report.student.firstName} {report.student.lastName}</span></div>
              <div><span className="text-muted-foreground">Class:</span> <span className="font-semibold">{report.student.className}</span></div>
              {studentRank && (
                <>
                  <div><span className="text-muted-foreground">Class Position:</span> <span className="font-semibold">{studentRank.position} of {rankings.length}</span></div>
                  <div><span className="text-muted-foreground">Overall Grade:</span> <Badge>{report.overallGrade}</Badge></div>
                </>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Class Ex (10)</TableHead>
                  <TableHead className="text-center">Hwk (10)</TableHead>
                  <TableHead className="text-center">Quiz (30)</TableHead>
                  <TableHead className="text-center">Mid-Term (20)</TableHead>
                  <TableHead className="text-center">Exam (30)</TableHead>
                  <TableHead className="text-center font-bold">Total (100)</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.subjects.map((s) => (
                  <TableRow key={s.subjectId}>
                    <TableCell className="font-medium">{s.subjectName} ({s.subjectCode})</TableCell>
                    <TableCell className="text-center">{s.components?.classExercise ?? '-'}</TableCell>
                    <TableCell className="text-center">{s.components?.homework ?? '-'}</TableCell>
                    <TableCell className="text-center">{s.components?.quiz ?? '-'}</TableCell>
                    <TableCell className="text-center">{s.components?.midterm ?? '-'}</TableCell>
                    <TableCell className="text-center">{s.components?.exam ?? '-'}</TableCell>
                    <TableCell className="text-center font-bold">{s.score}</TableCell>
                    <TableCell className="text-center"><Badge variant={s.grade === 'F' ? 'destructive' : s.grade === 'A' ? 'default' : 'secondary'}>{s.grade || '-'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="border-t pt-4 flex justify-between text-sm">
              <div><span className="text-muted-foreground">Total Score:</span> <span className="font-bold">{report.totalScore}/{report.totalSubjects * 100}</span></div>
              <div><span className="text-muted-foreground">Average:</span> <span className="font-bold">{report.average.toFixed(1)}%</span></div>
              <div><span className="text-muted-foreground">Overall Grade:</span> <Badge>{report.overallGrade}</Badge></div>
            </div>

            <div className="border-t pt-4 text-xs text-muted-foreground text-center">
              Generated by EduPlatform — {new Date().toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <style jsx global>{`
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 12px; }
            @page { margin: 1cm; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Report Cards</h1>
          <p className="text-muted-foreground">Select a class, term, and student to view their report card.</p>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedClass} onValueChange={(v) => v && setSelectedClass(v)}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select class" /></SelectTrigger>
          <SelectContent>
            {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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

      {selectedClass && selectedTerm && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base font-medium">Students</CardTitle></CardHeader>
          <CardContent>
            {classStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students in this class.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {classStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => fetchReport(student.id)}
                    disabled={loadingReport}
                    className="w-full flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-muted-foreground">{student.className}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">View Report</Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
