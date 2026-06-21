export type UserRole = 'system_owner' | 'school_owner' | 'admin' | 'teacher' | 'parent' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  schoolId: string;
}

export interface School {
  id: string;
  name: string;
  country: string;
  currency: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email: string;
  academicStructure: ClassLevel[];
  gradingSystem: GradingSystem;
  createdAt: string;
}

export interface ClassLevel {
  id: string;
  name: string;
  order: number;
}

export interface GradingSystem {
  id: string;
  name: string;
  scale: Grade[];
}

export interface Grade {
  grade: string;
  min: number;
  max: number;
  label: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  classId: string;
  className: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
  photoUrl?: string;
}

export type StaffType = 'teaching' | 'non-teaching' | 'headteacher' | 'admin' | 'accountant';

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  staffType: StaffType;
  campusId?: string;
  campusName?: string;
  assignedClass?: string;
  assignedSubjects?: string[];
  assignedRouteId?: string;
  assignedRouteName?: string;
  cardUid?: string;
  wristbandUid?: string;
  status: 'active' | 'inactive';
  hireDate: string;
  photo?: string;
}

export interface TransportRoute {
  id: string;
  name: string;
  description: string;
  stops: string[];
  driverName: string;
  driverPhone: string;
  capacity: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
  attachments: string[];
  comments: TaskComment[];
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
}

export interface Notification {
  id: string;
  type: 'fee_reminder' | 'task_deadline' | 'attendance_alert' | 'exam_announcement' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  totalRevenue: number;
  attendanceRate: number;
  pendingTasks: number;
  feeCollection: number;
}

export interface ThemeConfig {
  schoolName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fontFamily: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_CURRENCIES = {
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
} as const;

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

export const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
  { id: 'students', label: 'Students', icon: 'Users', href: '/students' },
  { id: 'staff', label: 'Staff', icon: 'UserCog', href: '/staff' },
  { id: 'academics', label: 'Academics', icon: 'GraduationCap', href: '/academics' },
  { id: 'attendance', label: 'Attendance', icon: 'ClipboardCheck', href: '/attendance' },
  { id: 'tasks', label: 'Tasks', icon: 'ListChecks', href: '/tasks' },
  { id: 'transport', label: 'Transport', icon: 'Bus', href: '/transport' },
  { id: 'finance', label: 'Finance', icon: 'CreditCard', href: '/finance' },
  { id: 'communication', label: 'Communication', icon: 'MessageSquare', href: '/communication' },
  { id: 'marks', label: 'Marks', icon: 'ClipboardList', href: '/marks' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3', href: '/reports' },
  { id: 'settings', label: 'Settings', icon: 'Settings', href: '/settings' },
] as const;
