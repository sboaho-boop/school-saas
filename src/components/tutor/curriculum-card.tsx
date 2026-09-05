'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { tutorRequest } from '@/stores/tutor-auth';
import { Loader2, BookOpen, Lock, PlayCircle, CheckCircle2 } from 'lucide-react';

interface TopicItem {
  subject: string;
  chapter: string;
  status: string;
  masteryScore: number;
}

interface CurriculumData {
  bySubject: Record<string, { total: number; mastered: number; inProgress: number; locked: number }>;
  topics: TopicItem[];
}

const STATUS_STYLE: Record<string, string> = {
  mastered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  in_progress: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  unlocked: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  locked: 'bg-muted text-muted-foreground',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  mastered: <CheckCircle2 size={12} />,
  in_progress: <PlayCircle size={12} />,
  locked: <Lock size={12} />,
};

export function TutorCurriculumCard() {
  const [data, setData] = useState<CurriculumData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await tutorRequest<CurriculumData>('/tutor/ai/curriculum');
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
          <Loader2 size={16} className="animate-spin text-violet-500 shrink-0" /> Loading your curriculum…
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const topics = data.topics || [];
  if (topics.length === 0) {
    return (
      <Card className="mb-4 border-border/50 shadow-sm">
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-violet-600 shrink-0" />
            <span className="text-sm font-semibold">My Curriculum</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Start learning with Teacher Kofi and your past lessons will appear here as book chapters.
          </p>
        </CardContent>
      </Card>
    );
  }

  const grouped = topics.reduce<Record<string, TopicItem[]>>((acc, t) => {
    if (!acc[t.subject]) acc[t.subject] = [];
    acc[t.subject].push(t);
    return acc;
  }, {});

  return (
    <Card className="mb-4 border-border/50 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-violet-600 shrink-0" />
          <span className="text-sm font-semibold">My Curriculum</span>
          <span className="text-xs text-muted-foreground">
            {topics.length} topic{topics.length === 1 ? '' : 's'} on your bookshelf
          </span>
        </div>
        {Object.entries(grouped).map(([subject, list]) => (
          <div key={subject}>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">{subject}</p>
            <div className="flex flex-wrap gap-1.5">
              {list.map((t, i) => {
                const icon = STATUS_ICON[t.status];
                return (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-border/60 ${STATUS_STYLE[t.status] || STATUS_STYLE.locked}`}
                  >
                    {icon}
                    {t.chapter.length > 30 ? t.chapter.slice(0, 30) + '…' : t.chapter}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}