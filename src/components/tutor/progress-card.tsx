'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { tutorRequest } from '@/stores/tutor-auth';
import { Loader2, Flame, Zap, CheckCircle2, Trophy, BookOpen } from 'lucide-react';

interface TopicItem {
  subject: string;
  chapter: string;
  status: string;
  masteryScore: number;
}

interface SubjectStat {
  total: number;
  mastered: number;
  inProgress: number;
  locked: number;
}

interface ProgressData {
  xp: number;
  streak: number;
  lastActiveDate: string;
  lessonsCompleted: number;
  plan: string;
  bySubject: Record<string, SubjectStat>;
  topics: TopicItem[];
}

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'from-violet-500 to-indigo-500',
  English: 'from-sky-500 to-cyan-500',
  Science: 'from-emerald-500 to-teal-500',
  'Social Studies': 'from-amber-500 to-orange-500',
  ICT: 'from-fuchsia-500 to-pink-500',
  'Ghanaian Language': 'from-rose-500 to-red-500',
  General: 'from-slate-500 to-slate-600',
};

function levelFromXp(xp: number): string {
  if (xp >= 500) return 'Scholar';
  if (xp >= 250) return 'Star Learner';
  if (xp >= 100) return 'Rising Star';
  if (xp >= 30) return 'Explorer';
  return 'Beginner';
}

const STATUS_LABELS: Record<string, string> = {
  mastered: 'Mastered 🏆',
  in_progress: 'In progress',
  unlocked: 'Unlocked',
  locked: 'Locked',
};

export function TutorProgressCard() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await tutorRequest<ProgressData>('/tutor/ai/progress');
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Card className="mb-4 border-border/50 shadow-sm">
        <CardContent className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin text-violet-500 shrink-0" /> Loading your progress…
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const subjects = Object.entries(data.bySubject || {}).sort((a, b) => b[1].mastered - a[1].mastered);
  const recent = (data.topics || []).slice(0, 4);

  return (
    <Card className="mb-4 border-border/50 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-500 shrink-0" />
          <span className="text-sm font-semibold">My Progress</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-medium">
            {levelFromXp(data.xp)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-orange-50 dark:bg-orange-950/20 p-3">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-orange-500 leading-none">
              <Flame size={16} /> {data.streak}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">day streak</p>
          </div>
          <div className="rounded-xl bg-violet-50 dark:bg-violet-950/20 p-3">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-violet-500 leading-none">
              <Zap size={16} /> {data.xp}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">XP earned</p>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-3">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-emerald-500 leading-none">
              <CheckCircle2 size={16} /> {data.lessonsCompleted}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">lessons done</p>
          </div>
        </div>

        {subjects.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <BookOpen size={13} /> Subjects
            </p>
            {subjects.map(([subject, stat]) => {
              const pct = stat.total ? Math.round(((stat.mastered + stat.inProgress) / stat.total) * 100) : 0;
              const color = SUBJECT_COLORS[subject] || SUBJECT_COLORS.General;
              return (
                <div key={subject}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{subject}</span>
                    <span className="text-muted-foreground">
                      {stat.mastered} mastered · {stat.inProgress} in progress
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {recent.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <BookOpen size={13} /> Recent topics
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recent.map((t, i) => (
                <span key={i} className="text-[11px] px-2 py-1 rounded-full border border-border/60 bg-muted/40">
                  {t.subject}: {t.chapter.length > 26 ? t.chapter.slice(0, 26) + '…' : t.chapter} ·{' '}
                  <span className="text-violet-600 dark:text-violet-400">{STATUS_LABELS[t.status] || t.status}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}