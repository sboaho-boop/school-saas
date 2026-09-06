'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackButton({ fallback, className }: { fallback?: string; className?: string }) {
  const router = useRouter();
  const go = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallback || '/student/dashboard');
  };
  return (
    <Button variant="ghost" size="icon" onClick={go} className={className ?? 'h-8 w-8'} aria-label="Go back">
      <ArrowLeft size={18} />
    </Button>
  );
}