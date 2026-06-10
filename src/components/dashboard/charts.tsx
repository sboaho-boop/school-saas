'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const enrollmentData = [
  { month: 'Jan', students: 1100 },
  { month: 'Feb', students: 1120 },
  { month: 'Mar', students: 1180 },
  { month: 'Apr', students: 1190 },
  { month: 'May', students: 1210 },
  { month: 'Jun', students: 1247 },
];

const attendanceData = [
  { day: 'Mon', present: 95, absent: 5 },
  { day: 'Tue', present: 92, absent: 8 },
  { day: 'Wed', present: 96, absent: 4 },
  { day: 'Thu', present: 88, absent: 12 },
  { day: 'Fri', present: 90, absent: 10 },
];

const feeData = [
  { month: 'Jan', collected: 45000, pending: 12000 },
  { month: 'Feb', collected: 48000, pending: 9000 },
  { month: 'Mar', collected: 52000, pending: 7000 },
  { month: 'Apr', collected: 47000, pending: 15000 },
  { month: 'May', collected: 55000, pending: 5000 },
  { month: 'Jun', collected: 37500, pending: 18000 },
];

const classDistribution = [
  { name: 'KG', value: 180 },
  { name: 'Basic 1-3', value: 320 },
  { name: 'Basic 4-6', value: 290 },
  { name: 'Basic 7-9', value: 260 },
  { name: 'SHS 1', value: 120 },
  { name: 'SHS 2', value: 77 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

export function ChartCard({ title, children, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

export function EnrollmentChart() {
  return (
    <ChartCard title="Enrollment Trend" delay={0.2}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={enrollmentData}>
          <defs>
            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="students"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#colorStudents)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function AttendanceChart() {
  return (
    <ChartCard title="Weekly Attendance" delay={0.3}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={attendanceData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function FeeCollectionChart() {
  return (
    <ChartCard title="Fee Collection" delay={0.4}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={feeData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="collected" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Collected" />
          <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ClassDistributionChart() {
  return (
    <ChartCard title="Students by Class" delay={0.5}>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={classDistribution}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {classDistribution.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {classDistribution.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
