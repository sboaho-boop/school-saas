'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useStudentStore } from '@/stores/students';
import { useStaffStore } from '@/stores/staff';
import { useFinanceStore } from '@/stores/finance';
import { useTransportStore } from '@/stores/transport';
import { useTaskStore } from '@/stores/tasks';
import { useAcademicsStore } from '@/stores/academics';

export function DataLoader() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const initialize = useAuthStore((s) => s.initialize);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const fetchRecords = useFinanceStore((s) => s.fetchRecords);
  const fetchRoutes = useTransportStore((s) => s.fetchRoutes);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const fetchClasses = useAcademicsStore((s) => s.fetchClasses);
  const fetchSubjects = useAcademicsStore((s) => s.fetchSubjects);
  const fetchTerms = useAcademicsStore((s) => s.fetchTerms);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!currentUser) return;
    fetchStudents();
    fetchStaff();
    fetchRecords();
    fetchRoutes();
    fetchTasks();
    fetchClasses();
    fetchSubjects();
    fetchTerms();
  }, [currentUser, fetchStudents, fetchStaff, fetchRecords, fetchRoutes, fetchTasks, fetchClasses, fetchSubjects, fetchTerms]);

  return null;
}
