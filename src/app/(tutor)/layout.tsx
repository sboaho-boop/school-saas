'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTutorAuth } from '@/stores/tutor-auth';
import { useI18n } from '@/stores/locale';
import Link from 'next/link';
import { LogOut, CreditCard } from 'lucide-react';
import { KofiAvatar } from '@/components/ai/kofi-avatar';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

const PUBLIC_PATHS = ['/tutor', '/tutor/login', '/tutor/signup', '/tutor/pricing'];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const { user, fetchMe, logout } = useTutorAuth();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname) && !['/tutor/dashboard'].includes(pathname);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isPublic && !user && typeof window !== 'undefined' && !localStorage.getItem('tutor_token')) {
      router.push('/tutor/login');
    }
  }, [user, isPublic, router]);

  if (isPublic && !['/tutor/dashboard'].includes(pathname)) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
            <Link href="/tutor" className="flex items-center gap-2.5">
              <KofiAvatar size={12} title="Teacher Kofi" />
              <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Teacher Kofi
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher compact persistToBackend />
              {user ? (
                <>
                  <Link href="/tutor/dashboard">
                    <Button variant="ghost" size="sm">{t('tutor.dashboard')}</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => { logout(); router.push('/tutor'); }}>
                    <LogOut size={14} className="mr-1" /> {t('tutor.signOut')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/tutor/login">
                    <Button variant="ghost" size="sm">{t('tutor.signIn')}</Button>
                  </Link>
                  <Link href="/tutor/signup">
                    <Button size="sm" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
                      {t('tutor.startLearningFree')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <Link href="/tutor/dashboard" className="flex items-center gap-2.5">
            <KofiAvatar size={10} title="Teacher Kofi" />
            <span className="font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Teacher Kofi
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact persistToBackend />
            <Link href="/tutor/pricing">
              <Button variant="ghost" size="sm"><CreditCard size={14} className="mr-1" /> {t('tutor.pricing')}</Button>
            </Link>
            {user && (
              <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">
                {user.name} Â· {user.plan}
              </span>
            )}
            <Button variant="ghost" size="sm" title={t('tutor.signOut')} onClick={() => { logout(); router.push('/tutor'); }}>
              <LogOut size={14} />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}

