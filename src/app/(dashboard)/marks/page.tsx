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
import { useI18n } from '@/stores/locale';
import { api } from '@/lib/api';
import { ImportDialog } from '@/components/import-dialog';
import Link from 'next/link';
import { Save, Printer, FileText, Settings2 } from 'lucide-react';

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

const DEFAULT_WEIGHTS: Record<string, number> = { classExercise: 10, homework: 10, quiz: 30, midterm: 20, exam: 30 };

async function apiGetMarksConfig(): Promise<{ weights: Record<string, number>; hasConfig: boolean }> {
  const res = await api.get<{ weights: Record<string, number>; hasConfig: boolean }>('/marks/config');
  return res || { weights: {}, hasConfig: false };
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
  const { t } = useI18n();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [components, setComponents] = useState<Record<string, Record<string, string>>>({});
  const [weights, setWeights] = useState<Record<string, number>>({ ...DEFAULT_WEIGHTS });
  const [loadWeightsError, setLoadWeightsError] = useState(false);
  const [hasCustomWeights, setHasCustomWeights] = useState(false);
  const showWeightsEditor = currentUser?.staffType === 'headteacher' || currentUser?.staffType === 'admin';

  const isTeaching = currentUser?.staffType === 'teaching';
  const availableClasses = isTeaching
    ? classes.filter((c) => currentUser?.assignedClasses?.includes(c.name))
    : classes;

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchStudents();
    fetchTerms();
  }, [fetchClasses, fetchSubjects, fetchStudents, fetchTerms]);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await apiGetMarksConfig();
        setWeights({ ...DEFAULT_WEIGHTS, ...(cfg.weights || {}) });
        setHasCustomWeights(cfg.hasConfig);
        setLoadWeightsError(false);
      } catch {
        setLoadWeightsError(true);
      }
    })();
  }, []);

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

  const [weightDrafts, setWeightDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(COMPONENT_NAMES.map((n) => [n, String(DEFAULT_WEIGHTS[n] ?? 0)]))
  );
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightsMsg, setWeightsMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (hasCustomWeights) {
      setWeightDrafts(Object.fromEntries(COMPONENT_NAMES.map((n) => [n, String(weights[n] ?? 0)])));
    }
  }, [hasCustomWeights, weights]);

  const weightsTotal = COMPONENT_NAMES.reduce((sum, n) => sum + (parseFloat(weightDrafts[n]) || 0), 0);

  const handleSaveWeights = async () => {
    if (weightsTotal !== 100) {
      setWeightsMsg({ ok: false, text: 'Weights must total 100.' });
      return;
    }
    setSavingWeights(true);
    setWeightsMsg(null);
    try {
      const payload: Record<string, number> = {};
      COMPONENT_NAMES.forEach((n) => { payload[n] = parseFloat(weightDrafts[n]) || 0; });
      await api.put('/marks/config', { weights: payload });
      setWeights(payload);
      setHasCustomWeights(true);
      setWeightsMsg({ ok: true, text: 'Weights saved.' });
    } catch {
      setWeightsMsg({ ok: false, text: 'Failed to save weights.' });
    } finally {
      setSavingWeights(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('pages.marks')}</h1>
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

      {showWeightsEditor && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Settings2 size={16} />
                Grading Weights
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${weightsTotal === 100 ? 'text-emerald-600' : 'text-destructive'}`}>
                  Total: {weightsTotal}/100
                </span>
                {loadWeightsError && <span className="text-xs text-destructive">Defaults shown (no config found).</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              {COMPONENT_NAMES.map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground whitespace-nowrap">{COMPONENT_LABELS[n]}</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="w-20 text-center h-8"
                    value={weightDrafts[n] ?? ''}
                    onChange={(e) => setWeightDrafts((prev) => ({ ...prev, [n]: e.target.value }))}
                  />
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={handleSaveWeights} disabled={savingWeights}>
                <Save size={14} className="mr-2" />
                {savingWeights ? 'Saving…' : 'Save Weights'}
              </Button>
              {weightsMsg && (
                <span className={`text-xs ${weightsMsg.ok ? 'text-emerald-600' : 'text-destructive'}`}>{weightsMsg.text}</span>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Component scores are marked out of these weights (must total 100). Applies across the whole school.</p>
          </CardContent>
        </Card>
      )}

      {selectedClass && selectedSubject && selectedTerm && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Score Entry</CardTitle>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {COMPONENT_NAMES.map((n) => (
                  <span key={n}>{COMPONENT_LABELS[n]}/{weights[n] ?? COMPONENT_MAX[n]}</span>
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
                          max={weights[name] ?? COMPONENT_MAX[name]}
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
