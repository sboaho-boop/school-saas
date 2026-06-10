'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Calendar, MoreHorizontal, MessageSquare, Paperclip, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTaskStore } from '@/stores/tasks';
import { NewTaskDialog } from '@/components/tasks/new-task-dialog';
import type { Task } from '@/types';

const priorityConfig = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

function TaskCard({ task }: { task: Task }) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-medium">{task.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="size-7 shrink-0">
              <MoreHorizontal size={14} />
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={priority.className}>
              {priority.label}
            </Badge>
            <Badge variant="secondary" className={status.className}>
              {status.label}
            </Badge>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                  {task.assignedTo.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span>{task.assignedTo}</span>
            </div>
            <div className="flex items-center gap-3">
              {task.attachments.length > 0 && (
                <span className="flex items-center gap-1">
                  <Paperclip size={12} />
                  {task.attachments.length}
                </span>
              )}
              {task.comments.length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare size={12} />
                  {task.comments.length}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(task.dueDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function TasksPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const [activeTab, setActiveTab] = useState('all');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const filteredTasks =
    activeTab === 'all'
      ? tasks
      : tasks.filter((task) => task.status === activeTab);

  const stats = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-500/10 via-primary/10 to-pink-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Tasks</h1>
          <p className="text-muted-foreground">Assign and track school tasks.</p>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md shadow-primary/20" onClick={() => setTaskDialogOpen(true)}>
          <Plus size={16} className="mr-2" /> New Task
        </Button>
        <NewTaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
      </motion.div>

      <Tabs value={activeTab} onValueChange={(v) => v !== null && setActiveTab(v)}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({stats.in_progress})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">No tasks found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
