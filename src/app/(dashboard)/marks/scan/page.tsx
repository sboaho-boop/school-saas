'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useMarksStore } from '@/stores/marks';
import { Check, Scan } from 'lucide-react';

function ScanContent() {
  const searchParams = useSearchParams();
  const { saveGrade } = useMarksStore();

  const studentId = searchParams.get('studentId') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const termId = searchParams.get('termId') || '';
  const studentName = searchParams.get('studentName') || '';
  const className = searchParams.get('className') || '';

  const [score, setScore] = useState('');
  const [saved, setSaved] = useState(false);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualSubjectId, setManualSubjectId] = useState('');
  const [manualTermId, setManualTermId] = useState('');

  const hasQrData = studentId && subjectId && termId;

  const handleSave = async () => {
    const s = parseFloat(score);
    if (isNaN(s)) return;
    await saveGrade({
      studentId: studentId || manualStudentId,
      subjectId: subjectId || manualSubjectId,
      classId: '',
      termId: termId || manualTermId,
      score: s,
      grade: '',
      remarks: '',
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); setScore(''); }, 2000);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Scan size={28} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Enter Score</h1>
        <p className="text-muted-foreground text-sm mt-1">Scan QR from answer sheet or enter details manually.</p>
      </motion.div>

      {hasQrData ? (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Scanned Student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="font-medium">{studentName}</p>
              <p className="text-sm text-muted-foreground">{className}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Score</label>
              <Input
                type="number"
                step="0.5"
                placeholder="Enter score..."
                value={score}
                onChange={(e) => setScore(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>

            <Button className="w-full" onClick={handleSave} disabled={!score || saved}>
              {saved ? <><Check size={16} className="mr-2" />Saved</> : 'Save Score'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Scan next QR code to continue, or{' '}
              <a href="/marks" className="text-primary underline">go to marks page</a>
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Manual Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">No QR data detected. Enter details manually:</p>
            <Input placeholder="Student ID" value={manualStudentId} onChange={(e) => setManualStudentId(e.target.value)} />
            <Input placeholder="Subject ID" value={manualSubjectId} onChange={(e) => setManualSubjectId(e.target.value)} />
            <Input placeholder="Term ID" value={manualTermId} onChange={(e) => setManualTermId(e.target.value)} />
            <Input type="number" step="0.5" placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} />
            <Button className="w-full" onClick={handleSave} disabled={!score || saved}>
              {saved ? <><Check size={16} className="mr-2" />Saved</> : 'Save Score'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading...</div>}>
      <ScanContent />
    </Suspense>
  );
}
