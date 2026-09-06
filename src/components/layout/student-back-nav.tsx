'use client';

import { usePathname } from 'next/navigation';
import { BackButton } from '@/components/ui/back-button';

const NO_BACK = ['/', '/student/login', '/student/dashboard'];

export function StudentBackNav() {
  const pathname = usePathname();
  if (NO_BACK.includes(pathname)) return null;
  if (pathname.startsWith('/student/exam/')) return null;
  return (
    <div className="fixed top-3 left-3 z-40 rounded-full bg-background/80 backdrop-blur border border-border/50 shadow-sm">
      <BackButton fallback="/student/dashboard" />
    </div>
  );
}