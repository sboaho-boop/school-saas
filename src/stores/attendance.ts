import { create } from 'zustand';

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
  markAttendance: (studentId: string, classId: string, date: string, status: AttendanceRecord['status']) => void;
  markAll: (studentIds: string[], classId: string, className: string, date: string, status: AttendanceRecord['status']) => void;
  getRecordsByClassAndDate: (classId: string, date: string) => AttendanceRecord[];
}

function generateMockAttendance(): AttendanceRecord[] {
  const students = [
    { id: 's1', name: 'Kwame Asante' },
    { id: 's2', name: 'Ama Mensah' },
    { id: 's3', name: 'Daniel Kofi' },
    { id: 's4', name: 'Fatima Ibrahim' },
    { id: 's5', name: 'Emmanuel Osei' },
    { id: 's6', name: 'Grace Tetteh' },
    { id: 's7', name: 'Samuel Aidoo' },
    { id: 's8', name: 'Joyce Nyarko' },
  ];
  const statuses: AttendanceRecord['status'][] = ['present', 'present', 'late', 'absent', 'present', 'present', 'excused', 'present'];
  const today = new Date().toISOString().split('T')[0];
  return students.map((s, i) => ({
    id: `att-${s.id}`,
    studentId: s.id,
    studentName: s.name,
    classId: 'basic-4a',
    className: 'Basic 4A',
    date: today,
    status: statuses[i],
  }));
}

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  records: generateMockAttendance(),
  markAttendance: (studentId, classId, date, status) =>
    set((s) => {
      const existing = s.records.findIndex((r) => r.studentId === studentId && r.classId === classId && r.date === date);
      if (existing >= 0) {
        const updated = [...s.records];
        updated[existing] = { ...updated[existing], status };
        return { records: updated };
      }
      return {
        records: [...s.records, { id: `att-${Date.now()}`, studentId, studentName: '', classId, className: '', date, status }],
      };
    }),
  markAll: (studentIds, classId, className, date, status) =>
    set((s) => {
      const existing = s.records.filter((r) => r.classId === classId && r.date === date);
      const newRecords = studentIds.map((sid) => {
        const found = existing.find((r) => r.studentId === sid);
        return found ? { ...found, status } : { id: `att-${Date.now()}-${sid}`, studentId: sid, studentName: '', classId, className, date, status };
      });
      const others = s.records.filter((r) => !(r.classId === classId && r.date === date));
      return { records: [...others, ...newRecords] };
    }),
  getRecordsByClassAndDate: (classId, date) =>
    get().records.filter((r) => r.classId === classId && r.date === date),
}));
