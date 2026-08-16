'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Plus, User, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/stores/locale';

interface ConferenceSlot {
  id: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParents: number;
  bookedCount: number;
  teacher: { id: string; name: string; email: string };
  bookings: ConferenceBooking[];
}

interface ConferenceBooking {
  id: string;
  studentId: string;
  parentEmail: string;
  notes: string;
  status: string;
  createdAt: string;
  student: { id: string; name: string; className: string };
}

export default function ConferencesPage() {
  const user = useAuthStore((s) => s.currentUser);
  const { t } = useI18n();
  const [slots, setSlots] = useState<ConferenceSlot[]>([]);
  const [mySlots, setMySlots] = useState<ConferenceSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxParents, setMaxParents] = useState('5');
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const [all, mine] = await Promise.all([
        api.get<ConferenceSlot[]>('/conferences/slots'),
        api.get<ConferenceSlot[]>('/conferences/my-slots'),
      ]);
      setSlots(all);
      setMySlots(mine);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const createSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/conferences/slots', { date, startTime, endTime, maxParents: parseInt(maxParents) });
    setOpen(false);
    setDate(''); setStartTime(''); setEndTime(''); setMaxParents('5');
    fetchSlots();
  };

  const isTeaching = user?.staffType === 'teaching' || user?.staffType === 'headteacher' || user?.staffType === 'admin';

  const displaySlots = tab === 'mine' ? mySlots : slots;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-500/10 via-primary/10 to-indigo-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('pages.conferences')}</h1>
          <p className="text-muted-foreground">Schedule and manage parent-teacher meeting slots.</p>
        </div>
        {isTeaching && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" /> Create Slot</Button>} />
            <DialogContent className="sm:max-w-md">
              <form onSubmit={createSlot}>
                <DialogHeader>
                  <DialogTitle>Create Conference Slot</DialogTitle>
                  <DialogDescription>Define a time slot for parent-teacher meetings.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParents">Max Parents per Slot</Label>
                    <Input id="maxParents" type="number" value={maxParents} onChange={(e) => setMaxParents(e.target.value)} min="1" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <Button type="submit">Create Slot</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      <div className="flex gap-2">
        <Button variant={tab === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTab('all')}>All Slots</Button>
        {isTeaching && (
          <Button variant={tab === 'mine' ? 'default' : 'outline'} size="sm" onClick={() => setTab('mine')}>My Slots</Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : displaySlots.length === 0 ? (
        <p className="text-sm text-muted-foreground">No conference slots found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displaySlots.map((slot) => {
            const isFull = slot.bookedCount >= slot.maxParents;
            return (
              <Card key={slot.id} className="border-border/50 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={isFull ? 'secondary' : 'default'} className={isFull ? 'bg-slate-100 text-slate-600' : ''}>
                      {slot.bookedCount}/{slot.maxParents} booked
                    </Badge>
                    <Badge variant="outline">{slot.date}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={14} className="text-muted-foreground" />
                      <span>{slot.teacher?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-muted-foreground" />
                      <span>{slot.startTime} – {slot.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={14} className="text-muted-foreground" />
                      <span>{slot.maxParents - slot.bookedCount} spots left</span>
                    </div>
                  </div>
                  {slot.bookings.length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedSlot(expandedSlot === slot.id ? null : slot.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {expandedSlot === slot.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {slot.bookings.length} booking(s)
                      </button>
                      {expandedSlot === slot.id && (
                        <div className="mt-2 space-y-1.5">
                          {slot.bookings.map((b) => (
                            <div key={b.id} className="rounded-md bg-muted/50 p-2 text-xs space-y-0.5">
                              <p className="font-medium">{b.student.name}</p>
                              <p className="text-muted-foreground">{b.student.className} — {b.parentEmail}</p>
                              {b.notes && <p className="text-muted-foreground italic">"{b.notes}"</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
