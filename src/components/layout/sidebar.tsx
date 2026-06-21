'use client';

import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/theme';
import {
  LayoutDashboard,
  Users,
  UserCog,
  GraduationCap,
  ClipboardCheck,
  ClipboardList,
  ListChecks,
  Bus,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Mail,
  Wallet,
  Shield,
  Scan,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore, ROLE_NAV_ITEMS } from '@/stores/auth';

const iconMap = {
  LayoutDashboard,
  Users,
  UserCog,
  GraduationCap,
  ClipboardCheck,
  ClipboardList,
  ListChecks,
  Bus,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  Wallet,
  Shield,
  Scan,
  Package,
};

interface SidebarItem {
  id: string;
  label: string;
  icon: keyof typeof iconMap;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
  { id: 'students', label: 'Students', icon: 'Users', href: '/students' },
  { id: 'staff', label: 'Staff', icon: 'UserCog', href: '/staff' },
  { id: 'academics', label: 'Academics', icon: 'GraduationCap', href: '/academics' },
  { id: 'attendance', label: 'Attendance', icon: 'ClipboardCheck', href: '/attendance' },
  { id: 'marks', label: 'Marks', icon: 'ClipboardList', href: '/marks' },
  { id: 'wallet', label: 'Wallet', icon: 'Wallet', href: '/wallet' },
  { id: 'tasks', label: 'Tasks', icon: 'ListChecks', href: '/tasks' },
  { id: 'transport', label: 'Transport', icon: 'Bus', href: '/transport' },
  { id: 'finance', label: 'Finance', icon: 'CreditCard', href: '/finance' },
  { id: 'communication', label: 'Communication', icon: 'MessageSquare', href: '/communication' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3', href: '/reports' },
  { id: 'audit-logs', label: 'Audit Logs', icon: 'Shield', href: '/audit-logs' },
  { id: 'terminal', label: 'Terminal', icon: 'Scan', href: '/terminal' },
  { id: 'orders', label: 'Fulfillment', icon: 'Package', href: '/orders/admin' },
  { id: 'settings', label: 'Settings', icon: 'Settings', href: '/settings' },
];

export function SidebarNavContent({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.currentUser);

  const allowedIds = user ? ROLE_NAV_ITEMS[user.staffType] : sidebarItems.map((i) => i.id);
  const visibleItems = sidebarItems.filter((item) => allowedIds.includes(item.id));

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {visibleItems.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-primary to-[oklch(0.6_0.25_220)] text-primary-foreground shadow-sm'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
            )}
          >
            <Icon size={20} className={cn("shrink-0", isActive ? "text-primary-foreground" : "text-sidebar-foreground/50")} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useThemeStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 max-lg:hidden',
        collapsed ? 'w-[70px]' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              {theme.schoolName}
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <SidebarNavContent collapsed={collapsed} />

        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="rounded-lg bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/20 p-3 space-y-2">
              <p className="text-xs font-medium text-sidebar-foreground">Contact Support</p>
              <a
                href="https://wa.me/447735310744"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                <MessageCircle size={14} className="text-emerald-400" />
                WhatsApp: +44 7735 310744
              </a>
              <a
                href="tel:+233502262294"
                className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                <Phone size={14} className="text-sky-400" />
                Call: 050 226 2294
              </a>
              <a
                href="mailto:sboaho@gmail.com"
                className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
              >
                <Mail size={14} className="text-rose-400" />
                sboaho@gmail.com
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
