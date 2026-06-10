'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaffStore } from '@/stores/staff';
import { useTransportStore } from '@/stores/transport';
import { Plus, X } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [staffType, setStaffType] = useState<StaffType>('teaching');
  const [assignedClass, setAssignedClass] = useState('');
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [assignedRouteId, setAssignedRouteId] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const addSubject = (subject: string) => {
    if (subject && !assignedSubjects.includes(subject)) {
      setAssignedSubjects([...assignedSubjects, subject]);
    }
    setSubjectInput('');
  };

  const removeSubject = (subject: string) => {
    setAssignedSubjects(assignedSubjects.filter((s) => s !== subject));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role || !department) return;
    const route = assignedRouteId ? routes.find((r) => r.id === assignedRouteId) : undefined;
    addStaff({
      name, email, phone, role, department, staffType, status,
      assignedClass: staffType === 'teaching' ? assignedClass : undefined,
      assignedSubjects: staffType === 'teaching' ? assignedSubjects : undefined,
      assignedRouteId: assignedRouteId || undefined,
      assignedRouteName: route?.name,
      hireDate: new Date().toISOString().split('T')[0],
    });
    setOpen(false);
    setName(''); setEmail(''); setPhone(''); setRole(''); setDepartment('');
    setStaffType('teaching'); setAssignedClass(''); setAssignedSubjects([]);
    setSubjectInput(''); setAssignedRouteId(''); setStatus('active');
  };

  const activeRoutes = routes.filter((r) => r.status === 'active');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" /> Add Staff</Button>} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Fill in the staff member details below.</DialogDescription>
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
                  <SelectItem value="teaching">Teaching Staff</SelectItem>
                  <SelectItem value="non-teaching">Non-Teaching Staff</SelectItem>
                  <SelectItem value="headteacher">Headteacher / Principal</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role / Title</Label>
                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} required placeholder={staffType === 'headteacher' ? 'e.g. Head Teacher' : staffType === 'teaching' ? 'e.g. Mathematics Teacher' : staffType === 'accountant' ? 'e.g. Accountant' : 'e.g. Admin'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
              </div>
            </div>

            {staffType === 'teaching' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="assignedClass">Assigned Class</Label>
                  <Select value={assignedClass} onValueChange={(v) => v && setAssignedClass(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_OPTIONS.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned Subjects</Label>
                  <div className="flex gap-2">
                    <Select value={subjectInput} onValueChange={(v) => { if (v) { addSubject(v); } }}>
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
                          <button type="button" onClick={() => removeSubject(sub)} className="hover:text-destructive">
                            <X size={12} />
                          </button>
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
                      {activeRoutes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
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
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Add Staff</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
