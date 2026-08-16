'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Notebook, Plus, CheckCircle, Clock, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/stores/locale';

interface LessonPlan {
  id: string;
  classId: string;
  subjectId: string;
  week: number;
  topic: string;
  objectives: string;
  materials: string;
  activities: string;
  assessment: string;
  status: 'draft' | 'submitted' | 'approved';
  createdBy: string;
  createdAt: string;
}

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
};

const emptyForm = {
  classId: '', subjectId: '', week: '', topic: '', objectives: '', materials: '', activities: '', assessment: '',
};

export default function LessonPlansPage() {
  const { t } = useI18n();
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<LessonPlan[]>('/lesson-plans')
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const created = await api.post<LessonPlan>('/lesson-plans', {
        classId: form.classId,
        subjectId: form.subjectId,
        week: Number(form.week),
        topic: form.topic,
        objectives: form.objectives,
        materials: form.materials,
        activities: form.activities,
        assessment: form.assessment,
      });
      setPlans((prev) => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const updated = await api.put<LessonPlan>(`/lesson-plans/${id}/approve`);
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      // handle error
    }
  };

  const handleSubmitForApproval = async (id: string) => {
    try {
      const updated = await api.put<LessonPlan>(`/lesson-plans/${id}/submit`);
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      // handle error
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-orange-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{t('pages.lessonPlans')}</h1>
          <p className="text-muted-foreground">Create and manage lesson plans.</p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md shadow-primary/20"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-2" /> {showForm ? 'Cancel' : 'Create Lesson Plan'}
        </Button>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText size={16} /> New Lesson Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="classId">Class ID</Label>
                  <Input id="classId" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} placeholder="e.g. class-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjectId">Subject ID</Label>
                  <Input id="subjectId" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} placeholder="e.g. subj-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="week">Week</Label>
                  <Input id="week" type="number" value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })} placeholder="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Lesson topic" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="objectives">Objectives</Label>
                  <textarea
                    id="objectives"
                    value={form.objectives}
                    onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                    placeholder="Learning objectives"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="materials">Materials</Label>
                  <Input id="materials" value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} placeholder="Required materials" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="activities">Activities</Label>
                  <textarea
                    id="activities"
                    value={form.activities}
                    onChange={(e) => setForm({ ...form, activities: e.target.value })}
                    placeholder="Lesson activities"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="assessment">Assessment</Label>
                  <textarea
                    id="assessment"
                    value={form.assessment}
                    onChange={(e) => setForm({ ...form, assessment: e.target.value })}
                    placeholder="Assessment criteria"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={handleCreate} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-16">Loading...</p>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
            <Notebook size={40} className="text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No lesson plans found.</p>
          </div>
        ) : (
          plans.map((plan) => {
            const status = statusConfig[plan.status];
            const isExpanded = expandedId === plan.id;

            return (
              <motion.div
                key={plan.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{plan.topic}</h3>
                        <p className="text-xs text-muted-foreground">
                          Week {plan.week} &middot; {plan.classId} &middot; {plan.subjectId}
                        </p>
                      </div>
                      <Badge variant="secondary" className={status.className + ' shrink-0 ml-2'}>
                        {status.label}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(plan.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.15 }}
                        className="mt-4 space-y-3 border-t pt-3"
                      >
                        {plan.objectives && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Objectives</p>
                            <p className="text-xs">{plan.objectives}</p>
                          </div>
                        )}
                        {plan.materials && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Materials</p>
                            <p className="text-xs">{plan.materials}</p>
                          </div>
                        )}
                        {plan.activities && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Activities</p>
                            <p className="text-xs">{plan.activities}</p>
                          </div>
                        )}
                        {plan.assessment && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Assessment</p>
                            <p className="text-xs">{plan.assessment}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          {plan.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={(e) => { e.stopPropagation(); handleSubmitForApproval(plan.id); }}
                            >
                              <FileText size={12} className="mr-1" /> Submit for Approval
                            </Button>
                          )}
                          {(plan.status === 'draft' || plan.status === 'submitted') && (
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={(e) => { e.stopPropagation(); handleApprove(plan.id); }}
                            >
                              <CheckCircle size={12} className="mr-1" /> Approve
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
