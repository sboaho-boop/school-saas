'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { UserCheck, Plus, GraduationCap, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Alumni {
  id: string;
  student: { firstName: string; lastName: string };
  graduationYear: string;
  currentOccupation: string;
  phone: string;
  email: string;
  address: string;
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    graduationYear: '',
    currentOccupation: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    api.get<Alumni[]>('/api/alumni')
      .then(setAlumni)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await api.post<Alumni>('/api/alumni', form);
      setAlumni((prev) => [...prev, created]);
      setForm({ studentId: '', graduationYear: '', currentOccupation: '', phone: '', email: '', address: '' });
      setShowForm(false);
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Alumni</h1>
          <p className="text-muted-foreground">Manage school alumni and their current occupations.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm"><Plus size={16} className="mr-2" />Add Alumni</Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><UserCheck size={16} />New Alumni Record</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-xs">Student ID</Label><Input className="h-8 text-sm" placeholder="e.g. STU-001" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required /></div>
                <div className="space-y-1"><Label className="text-xs">Graduation Year</Label><Input className="h-8 text-sm" placeholder="e.g. 2025" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} required /></div>
                <div className="space-y-1"><Label className="text-xs">Current Occupation</Label><Input className="h-8 text-sm" placeholder="e.g. Software Engineer" value={form.currentOccupation} onChange={(e) => setForm({ ...form, currentOccupation: e.target.value })} required /></div>
                <div className="space-y-1"><Label className="text-xs">Phone</Label><Input className="h-8 text-sm" placeholder="e.g. +233 XX XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
                <div className="space-y-1"><Label className="text-xs">Email</Label><Input className="h-8 text-sm" type="email" placeholder="e.g. alumni@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <div className="space-y-1 sm:col-span-2 lg:col-span-3"><Label className="text-xs">Address</Label><Input className="h-8 text-sm" placeholder="e.g. 123 Main St, City" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></div>
                <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
                  <Button type="submit" size="sm" disabled={submitting}>{submitting ? 'Saving...' : 'Save Alumni'}</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground p-3">Student</th>
                  <th className="text-left font-medium text-muted-foreground p-3"><GraduationCap size={14} className="inline mr-1" />Graduation Year</th>
                  <th className="text-left font-medium text-muted-foreground p-3"><Briefcase size={14} className="inline mr-1" />Occupation</th>
                  <th className="text-left font-medium text-muted-foreground p-3">Phone</th>
                  <th className="text-left font-medium text-muted-foreground p-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading alumni...</td></tr>
                ) : alumni.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No alumni records found.</td></tr>
                ) : alumni.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} className="text-muted-foreground shrink-0" />
                        <span className="font-medium">{a.student?.firstName} {a.student?.lastName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs font-normal">{a.graduationYear}</Badge>
                    </td>
                    <td className="p-3">{a.currentOccupation}</td>
                    <td className="p-3 text-muted-foreground">{a.phone}</td>
                    <td className="p-3 text-muted-foreground">{a.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
