'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useStudentStore } from '@/stores/students';
import { useStaffStore } from '@/stores/staff';
import { useFinanceStore } from '@/stores/finance';
import { useTransportStore } from '@/stores/transport';
import { useTaskStore } from '@/stores/tasks';
import { useAcademicsStore } from '@/stores/academics';
import { useNotificationStore } from '@/stores/notifications';
import { useThemeStore } from '@/stores/theme';
import { api } from '@/lib/api';

export function DataLoader() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const initialize = useAuthStore((s) => s.initialize);
  const setTheme = useThemeStore((s) => s.setTheme);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const fetchRecords = useFinanceStore((s) => s.fetchRecords);
  const fetchRoutes = useTransportStore((s) => s.fetchRoutes);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const fetchClasses = useAcademicsStore((s) => s.fetchClasses);
  const fetchSubjects = useAcademicsStore((s) => s.fetchSubjects);
  const fetchTerms = useAcademicsStore((s) => s.fetchTerms);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!currentUser) return;
    api.get<{ school: { name: string; primaryColor: string } }>('/school/profile').then((r) => {
      if (r.school) setTheme({ schoolName: r.school.name || 'My School', primaryColor: r.school.primaryColor || '#6366f1' });
    }).catch(() => {});
    fetchStudents();
    fetchStaff();
    fetchRecords();
    fetchRoutes();
    fetchTasks();
    fetchClasses();
    fetchSubjects();
    fetchTerms();
    fetchNotifications();
  }, [currentUser, setTheme, fetchStudents, fetchStaff, fetchRecords, fetchRoutes, fetchTasks, fetchClasses, fetchSubjects, fetchTerms, fetchNotifications]);

  return null;
}
