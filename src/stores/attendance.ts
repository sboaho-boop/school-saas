import { create } from 'zustand';
import { api } from '@/lib/api';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

interface AttendanceStore {
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  fetchRecords: (params?: { classId?: string; className?: string; date?: string }) => Promise<void>;
  markAttendance: (studentId: string, classId: string, className: string, studentName: string, date: string, status: AttendanceRecord['status']) => Promise<void>;
  markAll: (studentIds: string[], classId: string, className: string, date: string, status: AttendanceRecord['status']) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  records: [],
  loading: false,
  error: null,
  fetchRecords: async (params) => {
    set({ loading: true, error: null });
    try {
      const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
      const records = await api.get<AttendanceRecord[]>(`/attendance${qs}`);
      set({ records, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  markAttendance: async (studentId, classId, className, studentName, date, status) => {
    const record = await api.post<AttendanceRecord>('/attendance', { studentId, studentName, classId, className, date, status });
    set((s) => {
      const existing = s.records.findIndex((r) => r.studentId === studentId && r.date === date);
      if (existing >= 0) {
        const updated = [...s.records];
        updated[existing] = record;
        return { records: updated };
      }
      return { records: [...s.records, record] };
    });
  },
  markAll: async (studentIds, classId, className, date, status) => {
    const records = studentIds.map((sid) => ({
      studentId: sid, studentName: '', classId, className, date, status,
    }));
    const results = await api.post<AttendanceRecord[]>('/attendance/batch', { records });
    set((s) => {
      const others = s.records.filter((r) => !(r.classId === classId && r.date === date));
      return { records: [...others, ...results] };
    });
  },
}));
