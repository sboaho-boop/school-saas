'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Upload, FileDown, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useImportStore } from '@/stores/import';

interface ImportDialogProps {
  resource: 'students' | 'staff' | 'marks';
  onSuccess?: () => void;
  children?: React.ReactNode;
}

const TEMPLATES = {
  students: 'firstName,lastName,email,className,dateOfBirth,gender,parentName,parentPhone,parentEmail,enrollmentDate,status\nJohn,Doe,john@example.com,Grade 1 - Section A,2018-05-12,male,John Parent,0712345678,parent@example.com,2026-01-15,active',
  staff: 'name,email,phone,role,department,staffType,assignedClass,hireDate\nJane Teacher,jane@school.com,0712345678,Class Teacher,Academics,teaching,Grade 1 - Section A,2025-01-01',
  marks: 'studentId,subjectId,score,grade,remarks,classId,termId\n<student-id>,<subject-id>,85,A,Good work,<class-id>,<term-id>',
};

export function ImportDialog({ resource, onSuccess, children }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const { importStudents, importStaff, importMarks, importing, result, error, clearResult } = useImportStore();

  const handleImport = async () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map((h) => h.trim());
      const records = lines.slice(1).filter((l) => l.trim()).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const record: any = {};
        headers.forEach((h, i) => { record[h] = values[i] || ''; });
        return record;
      });

      let res;
      if (resource === 'students') res = await importStudents(records);
      else if (resource === 'staff') res = await importStaff(records);
      else res = await importMarks(records);

      if (res && res.imported > 0 && onSuccess) onSuccess();
    } catch {}
  };

  const handleClose = () => {
    setOpen(false);
    setCsvText('');
    clearResult();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger>
        {children || <Button variant="outline" size="sm"><Upload size={16} className="mr-2" />Import CSV</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="capitalize">Import {resource}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">CSV Template (copy this format):</p>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all bg-background rounded p-2 border">
              {TEMPLATES[resource]}
            </pre>
          </div>

          <Textarea
            placeholder="Paste your CSV data here..."
            className="min-h-[200px] font-mono text-xs"
            value={csvText}
            onChange={(e) => { setCsvText(e.target.value); clearResult(); }}
          />

          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {result.imported > 0 ? <Check size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-amber-500" />}
                <span className="font-medium">Imported {result.imported} records</span>
                {result.errors.length > 0 && <Badge variant="secondary">{result.errors.length} errors</Badge>}
              </div>
              {result.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto text-xs text-red-500 space-y-1 bg-red-50 dark:bg-red-950/20 rounded p-2">
                  {result.errors.map((e, i) => <p key={i}>Row {e.row}: {e.error}</p>)}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => {
              const blob = new Blob([TEMPLATES[resource]], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `${resource}-template.csv`; a.click();
            }}>
              <FileDown size={14} className="mr-2" />Download Template
            </Button>
            <Button onClick={handleImport} disabled={importing || !csvText.trim()}>
              {importing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
