'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Search, Filter, Download, X, Eye, FileText, DollarSign, ClipboardCheck, GraduationCap, Wallet, Clock, ChevronDown, ChevronUp, Pencil, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStudentStore } from '@/stores/students';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';
import { AddStudentDialog } from '@/components/students/add-student-dialog';
import { ImportDialog } from '@/components/import-dialog';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  graduated: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

interface StudentHistory {
  attendance: any[];
  grades: any[];
  fees: any[];
  wallet: any | null;
  reports: any[];
}

export default function StudentsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { students, fetchStudents, updateStudent } = useStudentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [history, setHistory] = useState<StudentHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandSection, setExpandSection] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [studentReports, setStudentReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const isAdminOrHead = currentUser?.staffType === 'headteacher' || currentUser?.staffType === 'admin';

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || student.className === classFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const classes = [...new Set(students.map((s) => s.className))];

  const openDetail = async (student: any) => {
    setSelectedStudent(student);
    setEditForm({ ...student });
    setEditing(false);
    setHistoryLoading(true);
    setExpandSection(null);
    try {
      const data: StudentHistory = await api.get(`/students/${student.id}/history`);
      setHistory(data);
    } catch {
      setHistory(null);
    }
    setHistoryLoading(false);
  };

  const closeDetail = () => {
    setSelectedStudent(null);
    setHistory(null);
  };

  const handleEdit = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      const updated = await api.put(`/students/${selectedStudent.id}`, editForm);
      updateStudent(selectedStudent.id, updated);
      setSelectedStudent(updated);
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  const toggleSection = (key: string) => setExpandSection(expandSection === key ? null : key);

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const data: any = await api.get('/student/all-reports');
      setStudentReports(data);
    } catch {}
    setReportsLoading(false);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Students</h1>
          <p className="text-muted-foreground">Manage all enrolled students. Click a student to view full history.</p>
        </div>
        <div className="flex gap-2">
          {isAdminOrHead && <><AddStudentDialog /><ImportDialog resource="students" onSuccess={() => window.location.reload()} /></>}
          <Button variant="outline" size="sm"><Download size={16} className="mr-2" />Export</Button>
        </div>
      </motion.div>

      {currentUser?.staffType === 'teaching' && currentUser?.assignedClass && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm text-primary">
          <Eye size={16} />You are viewing students in <strong>{currentUser.assignedClass}</strong> — only students assigned to your class are shown.
        </div>
      )}

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={classFilter} onValueChange={(v) => v && setClassFilter(v)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Classes</SelectItem>{classes.map((cls) => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Filter size={16} className="mr-2" />More Filters</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        {/* STUDENT LIST */}
        <div className="flex-1 min-w-0">
          <Card className="border-border/50 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Parent Contact</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(student)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          {student.photoUrl && <img src={student.photoUrl} alt="" className="size-full object-cover rounded-full" />}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.className}</TableCell>
                    <TableCell className="capitalize">{student.gender}</TableCell>
                    <TableCell>
                      <p className="text-sm">{student.parentName}</p>
                      <p className="text-xs text-muted-foreground">{student.parentPhone}</p>
                    </TableCell>
                    <TableCell>{student.enrollmentDate}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[student.status]}>{student.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredStudents.length} of {students.length} students</p>
          </div>

          {isAdminOrHead && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <button onClick={() => { setShowReports(!showReports); if (!showReports && studentReports.length === 0) fetchReports(); }} className="flex items-center gap-2 text-sm font-medium w-full">
                    <FileText size={16} />
                    Student Reports ({studentReports.length})
                    <ChevronDown size={14} className={`ml-auto transition-transform ${showReports ? 'rotate-180' : ''}`} />
                  </button>
                  {showReports && (
                    <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                      {reportsLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : studentReports.length === 0 ? <p className="text-sm text-muted-foreground">No reports from students yet.</p> : studentReports.map((r: any) => (
                        <div key={r.id} className="text-sm p-3 rounded-lg border border-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{r.title}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                              <span className="text-xs text-muted-foreground">{r.student?.firstName} {r.student?.lastName} · {r.student?.className}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{r.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* SIDE PANEL */}
        {selectedStudent && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-[480px] shrink-0">
            <Card className="border-border/50 shadow-sm sticky top-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <CardContent className="p-0">
                {/* HEADER */}
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      {selectedStudent.photoUrl && <img src={selectedStudent.photoUrl} alt="" className="size-full object-cover rounded-full" />}
                      <AvatarFallback className="bg-primary/10 text-primary">{selectedStudent.firstName[0]}{selectedStudent.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                      <p className="text-xs text-muted-foreground">{selectedStudent.className} · {selectedStudent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdminOrHead && (
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(!editing); if (!editing) setEditForm({ ...selectedStudent }); }}>
                        <Pencil size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="size-8" onClick={closeDetail}><X size={16} /></Button>
                  </div>
                </div>

                {/* EDIT FORM */}
                {editing && (
                  <div className="p-4 border-b border-border/50 space-y-3 bg-muted/30">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-xs">First Name</Label><Input size={1} className="h-8 text-sm" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Last Name</Label><Input size={1} className="h-8 text-sm" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Parent Name</Label><Input size={1} className="h-8 text-sm" value={editForm.parentName} onChange={(e) => setEditForm({ ...editForm, parentName: e.target.value })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Parent Phone</Label><Input size={1} className="h-8 text-sm" value={editForm.parentPhone} onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Parent Email</Label><Input size={1} className="h-8 text-sm" value={editForm.parentEmail} onChange={(e) => setEditForm({ ...editForm, parentEmail: e.target.value })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Status</Label>
                        <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="graduated">Graduated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button size="sm" className="gap-1" onClick={handleEdit} disabled={saving}><Save size={14} />{saving ? 'Saving...' : 'Save Changes'}</Button>
                  </div>
                )}

                {/* INFO */}
                <div className="p-4 border-b border-border/50 grid grid-cols-2 gap-y-2 text-sm">
                  <div><span className="text-muted-foreground">Gender</span><p className="capitalize">{selectedStudent.gender}</p></div>
                  <div><span className="text-muted-foreground">Enrolled</span><p>{selectedStudent.enrollmentDate}</p></div>
                  <div><span className="text-muted-foreground">DOB</span><p>{selectedStudent.dateOfBirth}</p></div>
                  <div><span className="text-muted-foreground">Parent</span><p>{selectedStudent.parentName}</p></div>
                  {selectedStudent.parentEmail && <div className="col-span-2"><span className="text-muted-foreground">Parent Email</span><p className="truncate">{selectedStudent.parentEmail}</p></div>}
                  {selectedStudent.parentPhone && <div className="col-span-2"><span className="text-muted-foreground">Parent Phone</span><p>{selectedStudent.parentPhone}</p></div>}
                </div>

                {/* HISTORY SECTIONS */}
                {historyLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Loading history...</div>
                ) : history ? (
                  <div className="divide-y divide-border/50">
                    {/* ATTENDANCE */}
                    <Section title="Attendance" icon={<ClipboardCheck size={14} />} count={history.attendance.length} expanded={expandSection === 'attendance'} onToggle={() => toggleSection('attendance')}>
                      {history.attendance.length === 0 ? <p className="text-xs text-muted-foreground">No records</p> : (
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {history.attendance.map((a: any) => (
                            <div key={a.id} className="flex justify-between text-xs py-1.5 px-3 rounded hover:bg-muted/50">
                              <span>{new Date(a.date).toLocaleDateString()}</span>
                              <Badge variant="outline" className={`text-[10px] ${a.status === 'present' ? 'text-emerald-600 border-emerald-200' : a.status === 'late' ? 'text-amber-600 border-amber-200' : 'text-red-600 border-red-200'}`}>{a.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </Section>

                    {/* GRADES */}
                    <Section title="Grades" icon={<GraduationCap size={14} />} count={history.grades.length} expanded={expandSection === 'grades'} onToggle={() => toggleSection('grades')}>
                      {history.grades.length === 0 ? <p className="text-xs text-muted-foreground">No records</p> : (
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {history.grades.map((g: any) => (
                            <div key={g.id} className="flex justify-between text-xs py-1.5 px-3 rounded hover:bg-muted/50">
                              <span className="font-medium">{g.subject?.name || 'Unknown'}</span>
                              <span><span className="font-semibold">{g.score}</span> · Grade {g.grade}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Section>

                    {/* FEES */}
                    <Section title="Fee Records" icon={<DollarSign size={14} />} count={history.fees.length} expanded={expandSection === 'fees'} onToggle={() => toggleSection('fees')}>
                      {history.fees.length === 0 ? <p className="text-xs text-muted-foreground">No records</p> : (
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {history.fees.map((f: any) => (
                            <div key={f.id} className="flex justify-between text-xs py-1.5 px-3 rounded hover:bg-muted/50">
                              <div>
                                <p className="font-medium">¢{f.amount.toLocaleString()}</p>
                                <p className="text-muted-foreground">Paid: ¢{f.paid.toLocaleString()} · Balance: ¢{f.balance.toLocaleString()}</p>
                              </div>
                              <Badge variant="outline" className={`text-[10px] ${f.status === 'paid' ? 'text-emerald-600 border-emerald-200' : f.status === 'partial' ? 'text-amber-600 border-amber-200' : 'text-red-600 border-red-200'}`}>{f.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </Section>

                    {/* WALLET */}
                    <Section title="Wallet" icon={<Wallet size={14} />} count={history.wallet?.transactions?.length || 0} expanded={expandSection === 'wallet'} onToggle={() => toggleSection('wallet')}>
                      {!history.wallet ? <p className="text-xs text-muted-foreground">No wallet</p> : (
                        <div className="px-3 space-y-2">
                          <div className="flex gap-4 text-xs">
                            <span>Balance: <strong className="text-emerald-600">¢{history.wallet.balance.toLocaleString()}</strong></span>
                            <span>Spent: <strong>¢{history.wallet.totalSpent?.toLocaleString() || 0}</strong></span>
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {history.wallet.transactions?.length === 0 ? <p className="text-xs text-muted-foreground">No transactions</p> : history.wallet.transactions?.map((t: any) => (
                              <div key={t.id} className="flex justify-between text-xs py-1.5 rounded hover:bg-muted/50">
                                <span className="capitalize">{t.service} ({t.type})</span>
                                <span className={t.amount > 0 ? 'text-emerald-600' : 'text-red-500'}>¢{t.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Section>

                    {/* REPORTS */}
                    <Section title="Student Reports" icon={<FileText size={14} />} count={history.reports.length} expanded={expandSection === 'reports'} onToggle={() => toggleSection('reports')}>
                      {history.reports.length === 0 ? <p className="text-xs text-muted-foreground">No reports</p> : (
                        <div className="space-y-2 max-h-48 overflow-y-auto px-3">
                          {history.reports.map((r: any) => (
                            <div key={r.id} className="text-xs p-2 rounded border border-border/50">
                              <p className="font-medium">{r.title}</p>
                              <p className="text-muted-foreground mt-1">{r.content}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Section>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, count, expanded, onToggle, children }: { title: string; icon: React.ReactNode; count: number; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onToggle} className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors">
        <span className="text-primary">{icon}</span>
        {title}
        <span className="text-xs text-muted-foreground ml-1">({count})</span>
        <ChevronDown size={14} className={`ml-auto transition-transform ${expanded ? '' : '-rotate-90'}`} />
      </button>
      {expanded && <div className="pb-2">{children}</div>}
    </div>
  );
}
