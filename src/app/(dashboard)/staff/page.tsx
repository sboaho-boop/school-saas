'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Search, Download, MoreHorizontal, BookOpen, Users, ListChecks, Bus } from 'lucide-react';
import { useState } from 'react';
import { useStaffStore } from '@/stores/staff';
import { useAuthStore } from '@/stores/auth';
import { AddStaffDialog } from '@/components/staff/add-staff-dialog';
import { NewTaskDialog } from '@/components/tasks/new-task-dialog';
import type { StaffType } from '@/types';

const staffTypeConfig: Record<StaffType, { label: string; className: string }> = {
  teaching: { label: 'Teaching', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  'non-teaching': { label: 'Non-Teaching', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  headteacher: { label: 'Headteacher', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  accountant: { label: 'Accountant', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
};

export default function StaffPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const staff = useStaffStore((s) => s.staff);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<StaffType | 'all'>('all');
  const [taskAssignee, setTaskAssignee] = useState<string | null>(null);

  const filteredStaff = staff.filter((member) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query) ||
      member.department.toLowerCase().includes(query);
    const matchesType = typeFilter === 'all' || member.staffType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const counts = {
    all: staff.length,
    teaching: staff.filter((s) => s.staffType === 'teaching').length,
    headteacher: staff.filter((s) => s.staffType === 'headteacher').length,
    admin: staff.filter((s) => s.staffType === 'admin').length,
    accountant: staff.filter((s) => s.staffType === 'accountant').length,
    'non-teaching': staff.filter((s) => s.staffType === 'non-teaching').length,
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-500/10 via-primary/10 to-fuchsia-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Staff</h1>
          <p className="text-muted-foreground">Manage your teaching and non-teaching staff.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" /> Export
          </Button>
          {currentUser?.staffType === 'headteacher' || currentUser?.staffType === 'admin' ? <AddStaffDialog /> : null}
        </div>
      </motion.div>

      <Tabs value={typeFilter} onValueChange={(v) => v && setTypeFilter(v as StaffType | 'all')}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="teaching">Teaching ({counts.teaching})</TabsTrigger>
          <TabsTrigger value="headteacher">Headteachers ({counts.headteacher})</TabsTrigger>
          <TabsTrigger value="admin">Admin ({counts.admin})</TabsTrigger>
          <TabsTrigger value="accountant">Accountant ({counts.accountant})</TabsTrigger>
          <TabsTrigger value="non-teaching">Non-Teaching ({counts['non-teaching']})</TabsTrigger>
        </TabsList>

        <TabsContent value={typeFilter} className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50 shadow-sm mb-6">
              <CardContent className="p-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search staff..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStaff.map((member) => {
              const typeStyle = staffTypeConfig[member.staffType];
              return (
                <Card key={member.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
                          <MoreHorizontal size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTaskAssignee(member.name)}>
                            <ListChecks size={14} className="mr-2" />
                            Assign Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className={typeStyle.className}>
                        {typeStyle.label}
                      </Badge>
                      <Badge variant="secondary" className={member.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}>
                        {member.status}
                      </Badge>
                    </div>
                    {member.staffType === 'teaching' && member.assignedClass && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Users size={14} />
                        <span>Class: <strong>{member.assignedClass}</strong></span>
                      </div>
                    )}
                    {member.staffType === 'teaching' && member.assignedSubjects && member.assignedSubjects.length > 0 && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                        <BookOpen size={14} className="mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {member.assignedSubjects.map((sub) => (
                            <Badge key={sub} variant="outline" className="text-xs">{sub}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {member.assignedRouteName && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Bus size={14} />
                        <span>Bus: <strong>{member.assignedRouteName}</strong></span>
                      </div>
                    )}
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-muted-foreground">{member.department}</p>
                      <p className="text-muted-foreground">{member.email}</p>
                      <p className="text-muted-foreground">{member.phone}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            Showing {filteredStaff.length} of {staff.length} staff members
          </motion.div>
        </TabsContent>
      </Tabs>

      {taskAssignee && (
        <NewTaskDialog
          key={taskAssignee}
          defaultAssignee={taskAssignee}
          open={true}
          onOpenChange={(open) => { if (!open) setTaskAssignee(null); }}
        />
      )}
    </div>
  );
}
