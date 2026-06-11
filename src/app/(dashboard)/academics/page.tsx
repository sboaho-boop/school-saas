'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Plus, GraduationCap, BookOpen, Calendar, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAcademicsStore } from '@/stores/academics';
import { useAuthStore } from '@/stores/auth';

const sections = ['Kindergarten', 'Lower Primary', 'Upper Primary', 'Junior High', 'Senior High'];

export default function AcademicsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { classes, subjects, terms, addClass, removeClass, addSubject, removeSubject, setActiveTerm } = useAcademicsStore();
  const [classOpen, setClassOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSection, setNewClassSection] = useState('');
  const [newClassName2, setNewClassName2] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');

  const handleAddClass = () => {
    if (!newClassName || !newClassSection) return;
    addClass({ name: newClassName, section: newClassSection, students: 0, teacher: 'Unassigned' });
    setNewClassName('');
    setClassOpen(false);
  };

  const handleAddSubject = () => {
    if (!newSubjectName || !newSubjectCode || !newClassName2) return;
    addSubject({ name: newSubjectName, code: newSubjectCode, teacher: 'Unassigned', classId: newClassName2 });
    setNewSubjectName('');
    setSubjectOpen(false);
  };

  const activeTerm = terms.find((t) => t.isActive);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Academics</h1>
          <p className="text-muted-foreground">Manage classes, subjects, and grading.</p>
        </div>
        <div className="flex gap-2">
        {currentUser?.staffType === 'headteacher' || currentUser?.staffType === 'admin' ? (<>
          <Dialog open={subjectOpen} onOpenChange={setSubjectOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm"><BookOpen size={16} className="mr-2" />Add Subject</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subject</DialogTitle>
                <DialogDescription>Create a new subject and assign it to a class.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subj-name">Subject Name</Label>
                  <Input id="subj-name" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="e.g. Physics" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subj-code">Subject Code</Label>
                  <Input id="subj-code" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} placeholder="e.g. PHY" />
                </div>
                <div className="space-y-2">
                  <Label>Assign to Class</Label>
                  <Select value={newClassName2} onValueChange={(v) => v && setNewClassName2(v)}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button onClick={handleAddSubject}>Add Subject</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={classOpen} onOpenChange={setClassOpen}>
            <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" />Add Class</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Class</DialogTitle>
                <DialogDescription>Create a new class.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cls-name">Class Name</Label>
                  <Input id="cls-name" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="e.g. SHS 2A" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cls-section">Section</Label>
                  <Select value={newClassSection} onValueChange={(v) => v && setNewClassSection(v)}>
                    <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                    <SelectContent>
                      {sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button onClick={handleAddClass}>Add Class</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>) : null}
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: GraduationCap, label: 'Total Classes', value: classes.length.toString(), color: '#6366f1' },
          { icon: BookOpen, label: 'Subjects', value: subjects.length.toString(), color: '#8b5cf6' },
          { icon: Calendar, label: 'Active Term', value: activeTerm?.name || 'N/A', color: '#06b6d4' },
          { icon: Calendar, label: 'Academic Year', value: activeTerm?.academicYear || 'N/A', color: '#f59e0b' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl p-3" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}><stat.icon size={24} /></div>
                  <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base font-medium">Class Structure</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sections.map((section) => {
                const sectionClasses = classes.filter((c) => c.section === section);
                if (sectionClasses.length === 0) return null;
                return (
                  <div key={section} className="rounded-lg border border-border/50 p-3">
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">{section}</h3>
                    <div className="flex flex-wrap gap-2">
                      {sectionClasses.map((cls) => (
                        <div key={cls.id} className="group relative">
                          <Badge variant="secondary" className="text-xs py-1.5">
                            {cls.name} — {cls.students} students
                          </Badge>
                          <button onClick={() => removeClass(cls.id)} className="absolute -right-1.5 -top-1.5 hidden group-hover:flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground"><Trash2 size={8} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base font-medium">Subjects by Class</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classes.slice(0, 10).map((cls) => {
                const clsSubjects = subjects.filter((s) => s.classId === cls.id);
                return (
                  <div key={cls.id} className="rounded-lg border border-border/50 p-3">
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">{cls.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {clsSubjects.map((subj) => (
                        <div key={subj.id} className="group relative">
                          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {subj.code}
                          </span>
                          <button onClick={() => removeSubject(subj.id)} className="absolute -right-1 -top-1 hidden group-hover:flex size-3.5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"><Trash2 size={7} /></button>
                        </div>
                      ))}
                      {clsSubjects.length === 0 && <span className="text-xs text-muted-foreground">No subjects assigned</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base font-medium">Terms</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {terms.map((term) => (
              <button
                key={term.id}
                onClick={() => setActiveTerm(term.id)}
                className={`rounded-lg border px-4 py-2 text-left text-sm transition-all ${term.isActive ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 hover:border-primary/50'}`}
              >
                <p className="font-medium">{term.name}</p>
                <p className="text-xs text-muted-foreground">{term.academicYear}</p>
                {term.isActive && <Badge className="mt-1" variant="default">Active</Badge>}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
