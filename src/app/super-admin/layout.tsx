'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSuperAdminStore } from '@/stores/super-admin';
import { Building2, LayoutDashboard, LogOut, School, ChevronLeft, ChevronRight, Shield } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, initialized, initialize, logout } = useSuperAdminStore();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { initialize(); }, [initialize]);

  if (pathname === '/super-admin/login') return <>{children}</>;

  if (!initialized) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!admin) { router.push('/super-admin/login'); return null; }

  const nav = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/super-admin/dashboard' },
    { label: 'Schools', icon: School, href: '/super-admin/schools' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 ${collapsed ? 'w-[70px]' : 'w-60'}`}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && <span className="text-sm font-bold flex items-center gap-2"><Shield size={16} className="text-indigo-500" />Super Admin</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="space-y-1 px-2 py-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active ? 'bg-indigo-500/10 text-indigo-600' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-0 right-0 px-2">
          <button onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[70px]' : 'ml-60'}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
