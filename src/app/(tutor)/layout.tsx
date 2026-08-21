'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTutorAuth } from '@/stores/tutor-auth';
import Link from 'next/link';
import { Bot, LogOut, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PUBLIC_PATHS = ['/tutor', '/tutor/login', '/tutor/signup', '/tutor/pricing'];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const { user, fetchMe, logout } = useTutorAuth();
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
              <div className="size-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Teacher Kofi
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/tutor/dashboard">
                    <Button variant="ghost" size="sm">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => { logout(); router.push('/tutor'); }}>
                    <LogOut size={14} className="mr-1" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/tutor/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/tutor/signup">
                    <Button size="sm" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
                      Get Started Free
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
            <div className="size-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Teacher Kofi
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/tutor/pricing">
              <Button variant="ghost" size="sm"><CreditCard size={14} className="mr-1" /> Plans</Button>
            </Link>
            {user && (
              <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">
                {user.name} · {user.plan}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => { logout(); router.push('/tutor'); }}>
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
