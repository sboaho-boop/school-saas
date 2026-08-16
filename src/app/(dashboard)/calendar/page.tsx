'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, Trash2, Edit3 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/stores/locale';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  time: string | null;
  endTime: string | null;
  type: string;
  color: string;
  allDay: boolean;
  createdBy: string;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  event: 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
  holiday: 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
  exam: 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
  meeting: 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300',
  deadline: 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300',
};

export default function CalendarPage() {
  const user = useAuthStore((s) => s.currentUser);
  const { t } = useI18n();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState('event');
  const [allDay, setAllDay] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.get<CalendarEvent[]>('/calendar');
      setEvents(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setTitle(''); setDescription(''); setDate(''); setEndDate('');
    setTime(''); setEndTime(''); setType('event'); setAllDay(false);
    setOpen(true);
  };

  const openEdit = (e: CalendarEvent) => {
    setEditing(e);
    setTitle(e.title); setDescription(e.description); setDate(e.date);
    setEndDate(e.endDate || ''); setTime(e.time || ''); setEndTime(e.endTime || '');
    setType(e.type); setAllDay(e.allDay);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { title, description, date, endDate: endDate || undefined, time: time || undefined, endTime: endTime || undefined, type, allDay };
    if (editing) {
      await api.put(`/calendar/${editing.id}`, body);
    } else {
      await api.post('/calendar', body);
    }
    setOpen(false);
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/calendar/${id}`);
    fetchEvents();
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthEvents = events.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-green-500/10 via-primary/10 to-teal-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">{t('pages.calendar')}</h1>
          <p className="text-muted-foreground">Manage events, holidays, exams, and deadlines.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" onClick={openCreate}><Plus size={16} className="mr-2" /> Add Event</Button>} />
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Event' : 'Add Event'}</DialogTitle>
                <DialogDescription>Fill in the event details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                {!allDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time">Start Time</Label>
                      <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="allDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="rounded" />
                  <Label htmlFor="allDay" className="text-sm">All day</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
                    <option value="event">Event</option>
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam</option>
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit">{editing ? 'Update' : 'Add Event'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else { setMonth(m => m - 1); } }}>←</Button>
          <span className="font-medium text-sm">{months[month]} {year}</span>
          <Button variant="outline" size="sm" onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else { setMonth(m => m + 1); } }}>→</Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setMonth(new Date().getMonth()); setYear(new Date().getFullYear()); }}>Today</Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] rounded-md bg-muted/20" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = monthEvents.filter((e) => e.date === dateStr);
              const isToday = dateStr === new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={day}
                  className={`min-h-[80px] rounded-md border border-border/30 p-1 text-xs transition-colors hover:bg-muted/50 ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                >
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}`}>{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => openEdit(ev)}
                        className={`block w-full truncate rounded px-1 py-0.5 text-[10px] font-medium text-left border ${typeColors[ev.type] || typeColors.event}`}
                      >
                        {ev.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar size={18} className="text-primary" /> All Events
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <Card key={ev.id} className="border-border/50 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className={typeColors[ev.type] || typeColors.event}>{ev.type}</Badge>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(ev)} className="text-muted-foreground hover:text-foreground transition-colors"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(ev.id)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="font-medium">{ev.title}</p>
                  {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={12} />{ev.date}</span>
                    {ev.endDate && <span>— {ev.endDate}</span>}
                    {ev.time && <span className="flex items-center gap-1"><Clock size={12} />{ev.time}{ev.endTime ? `–${ev.endTime}` : ''}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
