'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, CheckCircle2, Clock, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/tasks';
import { useAuthStore } from '@/stores/auth';

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function NonTeachingDashboard() {
  const user = useAuthStore((s) => s.currentUser);
  const tasks = useTaskStore((s) => s.tasks);

  const myTasks = tasks.filter((t) => t.assignedTo === user?.name);
  const pending = myTasks.filter((t) => t.status === 'pending').length;
  const inProgress = myTasks.filter((t) => t.status === 'in_progress').length;
  const completed = myTasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-500/10 via-primary/10 to-pink-500/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">My Dashboard</h1>
          <p className="text-muted-foreground">Your tasks and activity.</p>
        </div>
        <Button variant="outline" size="sm"><Download size={16} className="mr-2" />Export</Button>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Tasks', value: myTasks.length.toString(), icon: ListChecks, color: '#6366f1' },
          { title: 'Pending', value: pending.toString(), icon: Clock, color: '#f59e0b' },
          { title: 'In Progress', value: inProgress.toString(), icon: AlertCircle, color: '#06b6d4' },
          { title: 'Completed', value: completed.toString(), icon: CheckCircle2, color: '#10b981' },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myTasks.filter((t) => t.status !== 'completed').slice(0, 10).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">Due {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
              </div>
            ))}
            {myTasks.filter((t) => t.status !== 'completed').length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
