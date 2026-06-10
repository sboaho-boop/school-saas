'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Users, UserCog, CreditCard, ClipboardCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  color: string;
  delay?: number;
}

export function StatCard({ title, value, icon, trend, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow relative">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[${color}]/5 pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <div className="flex items-center gap-1">
                  {trend.positive ? (
                    <TrendingUp size={14} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={14} className="text-red-500" />
                  )}
                  <span
                    className={cn(
                      'text-xs font-medium',
                      trend.positive ? 'text-emerald-500' : 'text-red-500'
                    )}
                  >
                    {trend.value}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              )}
            </div>
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface DashboardStatsGridProps {
  stats: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { value: number; positive: boolean };
    color: string;
  }[];
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.title} {...stat} delay={i * 0.1} />
      ))}
    </div>
  );
}

export const defaultStats = [
  {
    title: 'Total Students',
    value: '1,247',
    icon: <Users size={24} />,
    trend: { value: 12, positive: true },
    color: '#6366f1',
  },
  {
    title: 'Total Staff',
    value: '86',
    icon: <UserCog size={24} />,
    trend: { value: 4, positive: true },
    color: '#8b5cf6',
  },
  {
    title: 'Revenue (GHS)',
    value: '284,500',
    icon: <CreditCard size={24} />,
    trend: { value: 8, positive: true },
    color: '#06b6d4',
  },
  {
    title: 'Attendance Rate',
    value: '94.2%',
    icon: <ClipboardCheck size={24} />,
    trend: { value: 2, positive: false },
    color: '#f59e0b',
  },
];
