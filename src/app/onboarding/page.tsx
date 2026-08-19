'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useAcademicsStore } from '@/stores/academics';
import { GraduationCap, Building2, Calendar, BookOpen, Users, UserPlus, DollarSign, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, School, Globe } from 'lucide-react';

const CLASS_TEMPLATES: Record<string, string[]> = {
  primary: ['KG 1', 'KG 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'],
  secondary: ['SHS 1', 'SHS 2', 'SHS 3'],
  'both': ['KG 1', 'KG 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3', 'SHS 1', 'SHS 2', 'SHS 3'],
  custom: [],
};

const SECTION_MAP: Record<string, string> = {
  'KG 1': 'Kindergarten', 'KG 2': 'Kindergarten',
  'Basic 1': 'Lower Primary', 'Basic 2': 'Lower Primary', 'Basic 3': 'Lower Primary',
  'Basic 4': 'Upper Primary', 'Basic 5': 'Upper Primary', 'Basic 6': 'Upper Primary',
  'JHS 1': 'Junior High', 'JHS 2': 'Junior High', 'JHS 3': 'Junior High',
  'SHS 1': 'Senior High', 'SHS 2': 'Senior High', 'SHS 3': 'Senior High',
};

const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'term', label: 'Academic Year', icon: Calendar },
  { id: 'classes', label: 'Classes', icon: Building2 },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'done', label: 'All Set', icon: CheckCircle2 },
];

const DEFAULT_SUBJECTS: Record<string, string[]> = {
  primary: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'Creative Arts', 'Physical Education', 'French', 'Computing'],
  secondary: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'French', 'Computing', 'Religious & Moral Education', 'Physical Education'],
};

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.currentUser);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);
  const { addTerm, addClass, addSubject, fetchClasses, fetchSubjects, fetchTerms } = useAcademicsStore();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [termName, setTermName] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-12-15');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [customClass, setCustomClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffName, setStaffName] = useState('');
  const [skipStaff, setSkipStaff] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [progress, setProgress] = useState({ terms: 0, classes: 0, subjects: 0, staff: 0, students: 0 });

  const toggleClass = (name: string) => {
    setSelectedClasses((prev) => prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]);
  };

  const addCustomClass = () => {
    if (customClass && !selectedClasses.includes(customClass)) {
      setSelectedClasses((prev) => [...prev, customClass]);
      setCustomClass('');
    }
  };

  const toggleSubject = (name: string) => {
    setSelectedSubjects((prev) => prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]);
  };

  const handleCreateTerm = async () => {
    setSaving(true);
    try {
      await addTerm({ name: termName, academicYear, startDate, endDate, isActive: true });
    } catch {}
    setSaving(false);
  };

  const handleCreateClasses = async () => {
    setSaving(true);
    for (const name of selectedClasses) {
      try {
        await addClass({ name, section: SECTION_MAP[name] || 'General', students: 0, teacher: 'Unassigned' });
      } catch {}
    }
    setSaving(false);
  };

  const handleCreateSubjects = async () => {
    setSaving(true);
    const classes = useAcademicsStore.getState().classes;
    for (const name of selectedSubjects) {
      const code = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
      const classId = classes[0]?.id || '';
      if (classId) {
        try {
          await addSubject({ name, code: code || name.slice(0, 3), teacher: 'Unassigned', classId });
        } catch {}
      }
    }
    setSaving(false);
  };

  const handleComplete = async () => {
    try {
      await api.put('/school/onboarding-complete');
      setOnboardingComplete(true);
    } catch {}
    fetchProgress();
    router.push('/dashboard');
  };

  const fetchProgress = async () => {
    try {
      const res = await api.get<{ progress: typeof progress }>('/school/onboarding-status');
      setProgress(res.progress);
    } catch {}
  };

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTerms();
    fetchProgress();
  }, []);

  const totalItems = Object.values(progress).reduce((a, b) => a + b, 0);
  const progressPercent = Math.min(100, Math.round((totalItems / 5) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <div className="p-4 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <School className="h-6 w-6 text-indigo-600" />
          <span className="font-bold text-lg">EduPlatform</span>
        </div>
        {step > 0 && step < STEPS.length - 1 && (
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            Skip for now
          </Button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-center gap-1 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">Welcome to EduPlatform!</h1>
                      <p className="text-muted-foreground mt-2">Let&apos;s set up your school in a few quick steps.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-left max-w-sm mx-auto">
                      {[
                        { icon: Calendar, text: 'Set up academic year' },
                        { icon: Building2, text: 'Add your classes' },
                        { icon: BookOpen, text: 'Choose subjects' },
                        { icon: Users, text: 'Add staff & students' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <item.icon size={14} className="text-indigo-500" />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => setStep(1)} size="lg" className="gap-2">
                      Get Started <ArrowRight size={16} />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {step === 1 && (
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center">
                      <Calendar className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
                      <h2 className="text-2xl font-bold">Academic Year & Term</h2>
                      <p className="text-muted-foreground">Set up your current academic year and first term.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="space-y-2">
                        <Label>Academic Year</Label>
                        <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2026/2027" />
                      </div>
                      <div className="space-y-2">
                        <Label>Term Name</Label>
                        <Input value={termName} onChange={(e) => setTermName(e.target.value)} placeholder="Term 1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft size={16} className="mr-1" /> Back</Button>
                      <Button onClick={async () => { await handleCreateTerm(); setStep(2); }} disabled={saving} className="gap-2">
                        {saving ? 'Saving...' : 'Continue'} <ArrowRight size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center">
                      <Building2 className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
                      <h2 className="text-2xl font-bold">Set Up Classes</h2>
                      <p className="text-muted-foreground">Select the classes in your school. You can add more later.</p>
                    </div>
                    <div className="space-y-3">
                      <Label>Quick select (Ghana curriculum)</Label>
                      <div className="flex flex-wrap gap-2">
                        {['primary', 'secondary', 'both'].map((type) => (
                          <Button key={type} variant="outline" size="sm" onClick={() => setSelectedClasses(CLASS_TEMPLATES[type])}
                            className={selectedClasses.join(',') === CLASS_TEMPLATES[type].join(',') ? 'bg-indigo-50 border-indigo-300' : ''}>
                            {type === 'primary' ? 'Primary (KG-Basic 6)' : type === 'secondary' ? 'Secondary (SHS 1-3)' : 'Both'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Or add custom classes</Label>
                      <div className="flex gap-2">
                        <Input value={customClass} onChange={(e) => setCustomClass(e.target.value)} placeholder="e.g. KG 1" onKeyDown={(e) => e.key === 'Enter' && addCustomClass()} />
                        <Button variant="outline" onClick={addCustomClass}>Add</Button>
                      </div>
                    </div>
                    {selectedClasses.length > 0 && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{selectedClasses.length} classes selected</Label>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {selectedClasses.map((name) => (
                            <Badge key={name} variant="secondary" className="cursor-pointer hover:bg-red-50 hover:text-red-600" onClick={() => toggleClass(name)}>
                              {name} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft size={16} className="mr-1" /> Back</Button>
                      <Button onClick={async () => { await handleCreateClasses(); setStep(3); }} disabled={saving || selectedClasses.length === 0} className="gap-2">
                        {saving ? 'Saving...' : 'Continue'} <ArrowRight size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center">
                      <BookOpen className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
                      <h2 className="text-2xl font-bold">Choose Subjects</h2>
                      <p className="text-muted-foreground">Select the subjects to start with. You can customize later.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Common subjects</Label>
                      <div className="flex flex-wrap gap-2">
                        {(selectedClasses.some((c) => c.startsWith('SHS')) ? DEFAULT_SUBJECTS.secondary : DEFAULT_SUBJECTS.primary).map((name) => (
                          <Badge key={name} variant={selectedSubjects.includes(name) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleSubject(name)}>
                            {selectedSubjects.includes(name) ? '✓ ' : ''}{name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {selectedSubjects.length > 0 && (
                      <p className="text-sm text-muted-foreground">{selectedSubjects.length} subjects selected</p>
                    )}
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft size={16} className="mr-1" /> Back</Button>
                      <Button onClick={async () => { await handleCreateSubjects(); setStep(4); }} disabled={saving || selectedSubjects.length === 0} className="gap-2">
                        {saving ? 'Saving...' : 'Continue'} <ArrowRight size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 4 && (
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center">
                      <Users className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
                      <h2 className="text-2xl font-bold">Add Staff</h2>
                      <p className="text-muted-foreground">You can add teachers and staff members now or skip and add them later.</p>
                    </div>
                    {!skipStaff ? (
                      <div className="space-y-4 max-w-md mx-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Staff Name</Label>
                            <Input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="e.g. John Doe" />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} placeholder="e.g. john@school.com" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">You can add more staff from the Staff page after setup.</p>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">You can add staff from the Staff page anytime.</p>
                    )}
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft size={16} className="mr-1" /> Back</Button>
                      {!skipStaff && (
                        <Button variant="outline" onClick={() => { setSkipStaff(true); setStep(5); }}>Skip for now</Button>
                      )}
                      <Button onClick={() => setStep(5)} className="gap-2">
                        {skipStaff ? 'Continue' : 'Save & Continue'} <ArrowRight size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 5 && (
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center">
                      <GraduationCap className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
                      <h2 className="text-2xl font-bold">Add Students</h2>
                      <p className="text-muted-foreground">You can import students from a CSV file or add them manually later.</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-indigo-800">
                        <strong>Tip:</strong> Go to Students → Import after setup to bulk-import students using a CSV spreadsheet.
                      </p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft size={16} className="mr-1" /> Back</Button>
                      <Button onClick={() => setStep(6)} className="gap-2">
                        Finish Setup <ArrowRight size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 6 && (
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Your School is Ready!</h2>
                      <p className="text-muted-foreground mt-2">You can start using EduPlatform right away.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-left max-w-sm mx-auto">
                      {[
                        { label: 'Terms', value: progress.terms },
                        { label: 'Classes', value: progress.classes },
                        { label: 'Subjects', value: progress.subjects },
                        { label: 'Staff', value: progress.staff },
                        { label: 'Students', value: progress.students },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <Badge variant={item.value > 0 ? 'default' : 'outline'}>{item.value}</Badge>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleComplete} size="lg" className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      Go to Dashboard <ArrowRight size={16} />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
