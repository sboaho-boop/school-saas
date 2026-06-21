'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';
import { useAcademicsStore } from '@/stores/academics';
import { useStudentStore } from '@/stores/students';
import { Printer, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=';

export default function PrintMarksPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const classes = useAcademicsStore((s) => s.classes);
  const fetchClasses = useAcademicsStore((s) => s.fetchClasses);
  const subjects = useAcademicsStore((s) => s.subjects);
  const fetchSubjects = useAcademicsStore((s) => s.fetchSubjects);
  const students = useStudentStore((s) => s.students);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const terms = useAcademicsStore((s) => s.terms);
  const fetchTerms = useAcademicsStore((s) => s.fetchTerms);
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const isTeaching = currentUser?.staffType === 'teaching';
  const availableClasses = isTeaching
    ? classes.filter((c) => c.name === currentUser?.assignedClass)
    : classes;

  useEffect(() => { fetchClasses(); fetchSubjects(); fetchStudents(); fetchTerms(); }, [fetchClasses, fetchSubjects, fetchStudents, fetchTerms]);

  const activeTerm = terms.find((t) => t.isActive);
  const termId = selectedTerm || activeTerm?.id || '';

  const BASE = typeof window !== 'undefined' ? window.location.origin : 'https://school-saas-fawn.vercel.app';
  const classStudents = students.filter((s) => s.classId === selectedClass);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Print QR Answer Sheets</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" />Print
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Class</label>
              <Select value={selectedClass} onValueChange={(v) => v && setSelectedClass(v)}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {availableClasses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Subject</label>
              <Select value={selectedSubject} onValueChange={(v) => v && setSelectedSubject(v)}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.filter((s) => s.classId === selectedClass).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Term</label>
              <Select value={selectedTerm} onValueChange={(v) => v && setSelectedTerm(v)}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder={activeTerm?.name || 'Select term'} /></SelectTrigger>
                <SelectContent>
                  {terms.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} {t.academicYear}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div ref={printRef}>
        {selectedClass && selectedSubject && termId ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {classStudents.map((student) => {
              const scanUrl = `${BASE}/marks/scan?studentId=${student.id}&subjectId=${selectedSubject}&termId=${termId}&classId=${selectedClass}&studentName=${encodeURIComponent(student.firstName + ' ' + student.lastName)}&className=${encodeURIComponent(student.className)}`;
              return (
                <div key={student.id} className="border border-border/50 rounded-lg p-3 text-center print:border-gray-300 print:shadow-none break-inside-avoid">
                  <img
                    src={`${QR_API}${encodeURIComponent(scanUrl)}`}
                    alt={`QR for ${student.firstName} ${student.lastName}`}
                    className="mx-auto w-44 h-44"
                    crossOrigin="anonymous"
                  />
                  <p className="mt-2 text-sm font-medium">{student.firstName} {student.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{student.className}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>Select a class, subject, and term to generate QR answer sheets.</p>
            <p className="text-sm mt-1">Print and attach to exam papers. Scan after marking to enter scores.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
