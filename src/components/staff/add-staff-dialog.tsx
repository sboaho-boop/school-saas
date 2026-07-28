'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaffStore } from '@/stores/staff';
import { useTransportStore } from '@/stores/transport';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';
import { Plus, X, CheckCircle2, Copy } from 'lucide-react';
import type { StaffType } from '@/types';

const CLASS_OPTIONS = [
  'Basic 1A', 'Basic 1B', 'Basic 2A', 'Basic 2B',
  'Basic 3A', 'Basic 3B', 'Basic 4A', 'Basic 4B',
  'Basic 5A', 'Basic 5B', 'Basic 6A', 'Basic 6B',
  'JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B',
  'JHS 3A', 'JHS 3B', 'SHS 1A', 'SHS 1B',
  'SHS 2A', 'SHS 2B', 'SHS 3A', 'SHS 3B',
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Literature', 'Algebra', 'Geometry',
  'French', 'Swahili', 'Arabic', 'ICT', 'Physical Education',
  'Art', 'Music', 'Social Studies', 'Religious Studies',
];

export function AddStaffDialog() {
  const addStaff = useStaffStore((s) => s.addStaff);
  const routes = useTransportStore((s) => s.routes);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [open, setOpen] = useState(false);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [staffType, setStaffType] = useState<StaffType>('teaching');
  const [campusId, setCampusId] = useState('');

  const isAdmin = currentUser?.staffType === 'admin';
  const isHeadteacher = currentUser?.staffType === 'headteacher';

  // Admin can only create headteacher; headteacher cannot create headteacher or admin
  const allowedStaffTypes = isAdmin
    ? [{ value: 'headteacher' as StaffType, label: 'Headteacher / Principal' }]
    : isHeadteacher
    ? [
        { value: 'teaching' as StaffType, label: 'Teaching Staff' },
        { value: 'non-teaching' as StaffType, label: 'Non-Teaching Staff' },
        { value: 'accountant' as StaffType, label: 'Accountant' },
      ]
    : [
        { value: 'teaching' as StaffType, label: 'Teaching Staff' },
        { value: 'non-teaching' as StaffType, label: 'Non-Teaching Staff' },
        { value: 'headteacher' as StaffType, label: 'Headteacher / Principal' },
        { value: 'admin' as StaffType, label: 'Admin' },
        { value: 'accountant' as StaffType, label: 'Accountant' },
      ];
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [classInput, setClassInput] = useState('');
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [assignedRouteId, setAssignedRouteId] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [verification, setVerification] = useState<any>(null);

  useEffect(() => {
    if (open) api.get<any[]>('/campus').then(setCampuses).catch(() => {});
  }, [open]);

  const addClass = (cls: string) => {
    if (cls && !assignedClasses.includes(cls)) setAssignedClasses([...assignedClasses, cls]);
    setClassInput('');
  };
  const removeClass = (cls: string) => setAssignedClasses(assignedClasses.filter((c) => c !== cls));

  const addSubject = (subject: string) => {
    if (subject && !assignedSubjects.includes(subject)) {
      setAssignedSubjects([...assignedSubjects, subject]);
    }
    setSubjectInput('');
  };

  const removeSubject = (subject: string) => {
    setAssignedSubjects(assignedSubjects.filter((s) => s !== subject));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role || !department) return;
    const route = assignedRouteId ? routes.find((r) => r.id === assignedRouteId) : undefined;
    try {
      const result = await addStaff({
        name, email, phone, role, department, staffType, status,
        campusId: campusId || undefined,
        assignedClasses: staffType === 'teaching' ? assignedClasses : undefined,
        assignedSubjects: staffType === 'teaching' ? assignedSubjects : undefined,
        assignedRouteId: assignedRouteId || undefined,
        assignedRouteName: route?.name,
        hireDate: new Date().toISOString().split('T')[0],
      });
      if (result?.verification) setVerification(result.verification);
      else { resetForm(); setOpen(false); }
    } catch {}
  };

  const resetForm = () => {
    setName(''); setEmail(''); setPhone(''); setRole(''); setDepartment('');
    setStaffType('teaching'); setCampusId(''); setAssignedClasses([]); setClassInput(''); setAssignedSubjects([]);
    setSubjectInput(''); setAssignedRouteId(''); setStatus('active');
    setVerification(null);
  };

  const handleClose = () => { resetForm(); setOpen(false); };

  const openDialog = (o: boolean) => {
    if (o) {
      // Set default staff type based on role
      if (isAdmin) setStaffType('headteacher');
    }
    if (!o) handleClose();
    setOpen(o);
  };

  const copyCode = () => { if (verification?.otp) navigator.clipboard.writeText(verification.otp); };
  const copyPassword = () => { if (verification?.tempPassword) navigator.clipboard.writeText(verification.tempPassword); };

  const activeRoutes = routes.filter((r) => r.status === 'active');

  return (
    <Dialog open={open} onOpenChange={openDialog}>
      <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" /> Add Staff</Button>} />
      <DialogContent className="sm:max-w-lg">
        {verification ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><CheckCircle2 size={20} className="text-emerald-500" /> Staff Created</DialogTitle>
              <DialogDescription>Account created. A verification code has been sent.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-200 p-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{email}</p>
              </div>
              <div className="rounded-lg bg-indigo-500/10 border border-indigo-200 p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">Verification Code</p>
                <p className="text-3xl font-bold tracking-widest text-indigo-600">{verification.otp}</p>
                <button onClick={copyCode} className="text-xs text-indigo-500 hover:text-indigo-700 inline-flex items-center gap-1"><Copy size={12} /> Copy</button>
                <p className="text-xs text-muted-foreground">Expires at {new Date(verification.expiresAt).toLocaleTimeString()}</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 border border-amber-200 p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">Temporary Password</p>
                <p className="text-lg font-mono font-bold tracking-wider text-amber-600">{verification.tempPassword}</p>
                <button onClick={copyPassword} className="text-xs text-amber-500 hover:text-amber-700 inline-flex items-center gap-1"><Copy size={12} /> Copy</button>
                <p className="text-xs text-muted-foreground">Share this with the staff member. They will use it to log in after verifying.</p>
              </div>
              {!verification.sentVia?.email && !verification.sentVia?.sms && (
                <p className="text-xs text-amber-600 text-center">No email/SMS configured. Share this code with the staff member.</p>
              )}
              <div className="rounded-lg bg-amber-500/10 border border-amber-200 p-3 text-sm space-y-1">
                <p className="font-medium">Next step:</p>
                <p>Staff member should visit the <strong>Verification</strong> page, enter their email and this code to activate their account and set a password.</p>
              </div>
            </div>
            <DialogFooter><Button onClick={handleClose}>Done</Button></DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>
                {isAdmin
                  ? 'As Admin, you can create the Headteacher. The Headteacher will manage all other staff.'
                  : 'Fill in the details below. An account will be created with a verification code.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Staff Type</Label>
                <Select value={staffType} onValueChange={(v) => v && setStaffType(v as StaffType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select staff type" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStaffTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role / Title</Label>
                  <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
                </div>
              </div>
              {campuses.length > 0 && (
                <div className="space-y-2">
                  <Label>Campus</Label>
                  <Select value={campusId} onValueChange={(v) => setCampusId(v || '')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select campus (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No campus</SelectItem>
                      {campuses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {staffType === 'teaching' && (
                <>
                  <div className="space-y-2">
                    <Label>Assigned Classes</Label>
                    <div className="flex gap-2">
                      <Select value={classInput} onValueChange={(v) => { if (v) addClass(v); }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Add a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLASS_OPTIONS.filter((c) => !assignedClasses.includes(c)).map((cls) => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {assignedClasses.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {assignedClasses.map((cls) => (
                          <span key={cls} className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary text-xs px-2 py-1">
                            {cls}
                            <button type="button" onClick={() => removeClass(cls)} className="hover:text-destructive"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned Subjects</Label>
                    <div className="flex gap-2">
                      <Select value={subjectInput} onValueChange={(v) => { if (v) addSubject(v); }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Add a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECT_OPTIONS.filter((s) => !assignedSubjects.includes(s)).map((sub) => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {assignedSubjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {assignedSubjects.map((sub) => (
                          <span key={sub} className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary text-xs px-2 py-1">
                            {sub}
                            <button type="button" onClick={() => removeSubject(sub)} className="hover:text-destructive"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Transport Route (Bus Duty)</Label>
                    <Select value={assignedRouteId} onValueChange={(v) => v && setAssignedRouteId(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="No route assigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No route</SelectItem>
                        {activeRoutes.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => v && setStatus(v as 'active' | 'inactive')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button">Cancel</Button>} />
              <Button type="submit">Add Staff</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
