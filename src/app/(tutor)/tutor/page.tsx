'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KofiAvatar } from '@/components/ai/kofi-avatar';
import { useI18n } from '@/stores/locale';
import { Mic, Globe, BookOpen, Shield, Zap, Star, Volume2 } from 'lucide-react';

export default function TutorLanding() {
  const { t } = useI18n();

  const FEATURES = [
    { icon: BookOpen, title: t('tutor.feature1Title'), desc: t('tutor.feature1Desc') },
    { icon: Mic, title: t('tutor.feature2Title'), desc: t('tutor.feature2Desc') },
    { icon: Volume2, title: t('tutor.feature3Title'), desc: t('tutor.feature3Desc') },
    { icon: Globe, title: t('tutor.feature4Title'), desc: t('tutor.feature4Desc') },
    { icon: Shield, title: t('tutor.feature5Title'), desc: t('tutor.feature5Desc') },
    { icon: Zap, title: t('tutor.feature6Title'), desc: t('tutor.feature6Desc') },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-600 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star size={14} /> {t('tutor.builtForGhana')}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            {t('tutor.meetKofi')}
            <br />{t('tutor.yourCompanion')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('tutor.heroDesc')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/tutor/signup">
              <Button size="lg" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-base px-8">
                {t('tutor.startLearningFree')}
              </Button>
            </Link>
            <Link href="/tutor/login">
              <Button size="lg" variant="outline" className="text-base px-8">{t('tutor.signIn')}</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{t('tutor.freeIncludes')}</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">{t('tutor.whyKidsLove')}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('tutor.designedFor')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{t('tutor.howItWorks')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: t('tutor.step1Title'), desc: t('tutor.step1Desc') },
              { step: '2', title: t('tutor.step2Title'), desc: t('tutor.step2Desc') },
              { step: '3', title: t('tutor.step3Title'), desc: t('tutor.step3Desc') },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="size-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-violet-500 to-fuchsia-500 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t('tutor.readyToStart')}</h2>
          <p className="text-lg opacity-90 mb-8">
            {t('tutor.joinThousands')}
          </p>
          <Link href="/tutor/signup">
            <Button size="lg" className="bg-white text-violet-600 hover:bg-white/90 text-base px-8 font-semibold">
              {t('tutor.startLearningFree')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <KofiAvatar size={8} title="Teacher Kofi" />
            <span className="text-sm font-semibold">Teacher Kofi</span>
            <span className="text-xs text-muted-foreground">by EduPlatform</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/tutor" className="hover:text-foreground">{t('tutor.home')}</Link>
            <Link href="/tutor/pricing" className="hover:text-foreground">{t('tutor.pricing')}</Link>
            <Link href="/tutor/login" className="hover:text-foreground">{t('tutor.signIn')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
