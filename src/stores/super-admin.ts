import { create } from 'zustand';
import { superApi, setSuperToken, logoutSuper, getSuperToken } from '@/lib/super-api';

export interface SchoolInfo {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  _count: { students: number; staff: number; users: number };
  subscriptions: { plan: string; status: string; studentLimit: number; staffLimit: number }[];
}

interface SuperAdminStore {
  admin: { id: string; email: string; name: string } | null;
  schools: SchoolInfo[];
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  initialize: () => Promise<void>;
  logout: () => void;
  fetchSchools: () => Promise<void>;
  createSchool: (data: { name: string; adminEmail: string; adminPassword: string; adminName?: string }) => Promise<SchoolInfo>;
  updateSchool: (id: string, data: { name?: string; code?: string }) => Promise<SchoolInfo>;
  fetchSchoolStudents: (schoolId: string) => Promise<any[]>;
  fetchSchoolWallets: (schoolId: string) => Promise<any[]>;
  generateCardForStudent: (schoolId: string, studentId: string) => Promise<{ cardUid: string; wallet: any }>;
  fetchSchoolCampuses: (schoolId: string) => Promise<any[]>;
  createSchoolCampus: (schoolId: string, data: { name: string; address?: string; headTeacherEmail?: string; headTeacherPassword?: string; headTeacherName?: string }) => Promise<any>;
  updateSchoolCampus: (schoolId: string, campusId: string, data: { name?: string; address?: string; headTeacherId?: string | null }) => Promise<any>;
  deleteSchoolCampus: (schoolId: string, campusId: string) => Promise<void>;
}

export const useSuperAdminStore = create<SuperAdminStore>((set) => ({
  admin: null,
  schools: [],
  loading: false,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await superApi.post<{ token: string; admin: { id: string; email: string; name: string } }>('/super/login', { email, password });
      setSuperToken(res.token);
      set({ admin: res.admin, loading: false, initialized: true });
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  initialize: async () => {
    const token = getSuperToken();
    if (!token) { set({ initialized: true }); return; }
    try {
      const admin = await superApi.get<{ id: string; email: string; name: string }>('/super/me');
      set({ admin, initialized: true });
    } catch { set({ initialized: true }); }
  },

  logout: async () => {
    try { await superApi.post('/super/logout'); } catch {}
    logoutSuper();
    set({ admin: null, schools: [] });
  },

  fetchSchools: async () => {
    set({ loading: true });
    try {
      const schools = await superApi.get<SchoolInfo[]>('/super/schools');
      set({ schools, loading: false });
    } catch { set({ loading: false }); }
  },

  createSchool: async (data) => {
    const school = await superApi.post<SchoolInfo>('/super/schools', data);
    await set((s) => ({ schools: [school, ...s.schools] }));
    return school;
  },

  updateSchool: async (id: string, data: { name?: string; code?: string }) => {
    const updated = await superApi.put<SchoolInfo>(`/super/schools/${id}`, data);
    set((s) => ({ schools: s.schools.map((sch) => sch.id === id ? { ...sch, ...updated } : sch) }));
    return updated;
  },

  fetchSchoolStudents: async (schoolId: string) => {
    const students = await superApi.get<any[]>(`/super/schools/${schoolId}/students`);
    return students;
  },

  fetchSchoolWallets: async (schoolId: string) => {
    const wallets = await superApi.get<any[]>(`/super/schools/${schoolId}/wallets`);
    return wallets;
  },

  generateCardForStudent: async (schoolId: string, studentId: string) => {
    const res = await superApi.post<{ cardUid: string; wallet: any }>(`/super/schools/${schoolId}/generate-card`, { studentId });
    return res;
  },

  fetchSchoolCampuses: async (schoolId: string) => {
    return superApi.get<any[]>(`/super/schools/${schoolId}/campuses`);
  },

  createSchoolCampus: async (schoolId: string, data) => {
    return superApi.post<any>(`/super/schools/${schoolId}/campuses`, data);
  },

  updateSchoolCampus: async (schoolId: string, campusId: string, data) => {
    return superApi.put<any>(`/super/schools/${schoolId}/campuses/${campusId}`, data);
  },

  deleteSchoolCampus: async (schoolId: string, campusId: string) => {
    await superApi.delete(`/super/schools/${schoolId}/campuses/${campusId}`);
  },
}));
