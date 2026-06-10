'use client';

import { DashboardStatsGrid, defaultStats } from '@/components/dashboard/stats-grid';
import { EnrollmentChart, AttendanceChart, FeeCollectionChart, ClassDistributionChart } from '@/components/dashboard/charts';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStaffStore } from '@/stores/staff';
import { useStudentStore } from '@/stores/students';
import { useTaskStore } from '@/stores/tasks';
import { useFinanceStore } from '@/stores/finance';

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function HeadteacherDashboard() {
  const staff = useStaffStore((s) => s.staff);
  const students = useStudentStore((s) => s.students);
  const tasks = useTaskStore((s) => s.tasks);
  const records = useFinanceStore((s) => s.records);

  const upcomingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 5);
  const totalCollected = records.reduce((sum, r) => sum + r.paid, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground">School overview at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter size={16} className="mr-2" />Filter</Button>
          <Button variant="outline" size="sm"><Download size={16} className="mr-2" />Export</Button>
          <Button size="sm"><Plus size={16} className="mr-2" />New Student</Button>
        </div>
      </motion.div>

      <DashboardStatsGrid stats={defaultStats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <EnrollmentChart />
        <AttendanceChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FeeCollectionChart />
        <ClassDistributionChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Upcoming Tasks</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.assignedTo} • Due {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
