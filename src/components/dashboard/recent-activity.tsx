'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  user: string;
  initials: string;
  action: string;
  target: string;
  time: string;
  type: 'student' | 'staff' | 'finance' | 'attendance';
}

const activities: Activity[] = [
  {
    id: '1',
    user: 'Ama Mensah',
    initials: 'AM',
    action: 'enrolled',
    target: 'Basic 4A',
    time: '2 min ago',
    type: 'student',
  },
  {
    id: '2',
    user: 'Kwame Asante',
    initials: 'KA',
    action: 'marked attendance for',
    target: 'SHS 1B',
    time: '15 min ago',
    type: 'attendance',
  },
  {
    id: '3',
    user: 'Grace Osei',
    initials: 'GO',
    action: 'paid fees for',
    target: 'GHS 2,500',
    time: '1 hour ago',
    type: 'finance',
  },
  {
    id: '4',
    user: 'Daniel Kofi',
    initials: 'DK',
    action: 'was assigned to',
    target: 'Mathematics Dept',
    time: '2 hours ago',
    type: 'staff',
  },
  {
    id: '5',
    user: 'Fatima Ibrahim',
    initials: 'FI',
    action: 'submitted report for',
    target: 'Basic 7 Science',
    time: '3 hours ago',
    type: 'staff',
  },
];

const typeColors = {
  student: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  staff: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  finance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  attendance: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {activity.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-muted-foreground">{activity.action}</span>{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="secondary" className={cn('text-xs', typeColors[activity.type])}>
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
