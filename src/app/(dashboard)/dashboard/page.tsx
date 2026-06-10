'use client';

import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HeadteacherDashboard } from '@/components/dashboard/roles/headteacher-dashboard';
import { AccountantDashboard } from '@/components/dashboard/roles/accountant-dashboard';
import { TeachingDashboard } from '@/components/dashboard/roles/teaching-dashboard';
import { NonTeachingDashboard } from '@/components/dashboard/roles/non-teaching-dashboard';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  switch (user.staffType) {
    case 'headteacher':
    case 'admin':
      return <HeadteacherDashboard />;
    case 'accountant':
      return <AccountantDashboard />;
    case 'teaching':
      return <TeachingDashboard />;
    case 'non-teaching':
      return <NonTeachingDashboard />;
    default:
      return <HeadteacherDashboard />;
  }
}
