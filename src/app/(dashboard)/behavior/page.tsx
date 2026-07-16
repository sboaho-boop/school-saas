'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Shield, Plus, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Incident {
  id: string;
  student: { firstName: string; lastName: string };
  type: string;
  description: string;
  date: string;
  status: string;
  location?: string;
  action?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  bullying: <AlertTriangle size={14} />,
  truancy: <Clock size={14} />,
  cheating: <Shield size={14} />,
  disruption: <AlertTriangle size={14} />,
  other: <Shield size={14} />,
};

const actionOptions = ['warning', 'detention', 'suspension'] as const;
const typeOptions = ['bullying', 'truancy', 'cheating', 'disruption', 'other'] as const;
const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
] as const;

export default function BehaviorPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState('open');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', type: 'bullying', description: '', location: '', date: '', action: 'warning' });
  const [submitting, setSubmitting] = useState(false);

  const fetchIncidents = async (status: string) => {
    try {
      const qs = status === 'all' ? '' : `?status=${status}`;
      const data = await api.get<Incident[]>(`/incidents/${qs}`);
      setIncidents(data);
    } catch { setIncidents([]); }
  };

  useEffect(() => { fetchIncidents(filter); }, [filter]);

  const handleResolve = async (id: string) => {
    try {
      await api.put(`/incidents/${id}/resolve`);
      fetchIncidents(filter);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/incidents', { ...form, studentId: Number(form.studentId) });
      setShowForm(false);
      setForm({ studentId: '', type: 'bullying', description: '', location: '', date: '', action: 'warning' });
      fetchIncidents(filter);
    } catch {}
    setSubmitting(false);
  };

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      open: { label: 'Open', className: 'bg-amber-500/10 text-amber-600' },
      resolved: { label: 'Resolved', className: 'bg-emerald-500/10 text-emerald-600' },
    };
    const c = config[status] || { label: status, className: 'bg-muted text-muted-foreground' };
    return (
      <Badge variant="secondary" className={c.className}>
        <span className="flex items-center gap-1">{c.label}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-emerald-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">Behavior</h1>
          <p className="text-muted-foreground">Track and manage student incidents.</p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md shadow-primary/20"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-2" /> Report Incident
        </Button>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? 'default' : 'outline'}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="text-base font-medium">Report New Incident</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input id="studentId" type="number" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="Enter student ID" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? '' })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((t) => (
                        <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the incident" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Classroom 3B" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="action">Action</Label>
                  <Select value={form.action} onValueChange={(v) => setForm({ ...form, action: v ?? '' })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {actionOptions.map((a) => (
                        <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Report'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {incidents.map((incident) => (
          <motion.div key={incident.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">{typeIcons[incident.type] || <Shield size={14} />}</div>
                    <div>
                      <p className="text-sm font-medium">{incident.student.firstName} {incident.student.lastName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{incident.type}</p>
                    </div>
                  </div>
                  {statusBadge(incident.status)}
                </div>
                <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{incident.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(incident.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {incident.action && <span className="capitalize">Action: {incident.action}</span>}
                </div>
                {incident.status === 'open' && (
                  <div className="mt-3">
                    <Button size="xs" variant="outline" className="text-emerald-600" onClick={() => handleResolve(incident.id)}>
                      <CheckCircle size={12} className="mr-1" /> Resolve
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {incidents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield size={32} className="text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">No incidents found.</p>
        </div>
      )}
    </div>
  );
}
