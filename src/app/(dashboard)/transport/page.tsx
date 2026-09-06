'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Bus, MapPin, Phone, Users, Clock, CheckCircle, ArrowRight, MapPin as PinArrive, UserPlus, X } from 'lucide-react';
import { useTransportStore } from '@/stores/transport';
import { useStaffStore } from '@/stores/staff';
import { useStudentStore } from '@/stores/students';
import { useI18n } from '@/stores/locale';
import { api } from '@/lib/api';

interface DriverTrip {
  id: string;
  driver: { id: string; name: string; indexNumber: string };
  route: { id: string; name: string };
  checkInTime: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
  completedAt: string | null;
  status: string;
  date: string;
}

const statusConfig = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

export default function TransportPage() {
  const { routes, addRoute, assignStudents, unassignStudent, fetchRouteStudents } = useTransportStore();
  const staff = useStaffStore((s) => s.staff);
  const students = useStudentStore((s) => s.students);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stopsInput, setStopsInput] = useState('');
  const [driverId, setDriverId] = useState('');
  const [capacity, setCapacity] = useState('30');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [tripLoading, setTripLoading] = useState(false);
  const [assignRouteId, setAssignRouteId] = useState<string | null>(null);
  const [routeAssignment, setRouteAssignment] = useState<Record<string, string>>({});
  const [prevAssignment, setPrevAssignment] = useState<string[]>([]);
  const [routeCounts, setRouteCounts] = useState<Record<string, number>>({});
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchTrips();
    fetchStudents();
    loadRouteCounts();
  }, []);

  const loadRouteCounts = async () => {
    const counts: Record<string, number> = {};
    await Promise.all(
      routes.map(async (r) => {
        try {
          const list = await fetchRouteStudents(r.id);
          counts[r.id] = list.length;
        } catch { counts[r.id] = 0; }
      })
    );
    setRouteCounts(counts);
  };

  const openAssign = async (routeId: string) => {
    setAssignRouteId(routeId);
    const list = await fetchRouteStudents(routeId);
    const map: Record<string, string> = {};
    list.forEach((s) => { if (s.pickupStop) map[s.id] = s.pickupStop; });
    setRouteAssignment(map);
    setPrevAssignment(list.map((s) => s.id));
  };

  const toggleAssign = (studentId: string, firstStop: string) => {
    setRouteAssignment((prev) => {
      const next = { ...prev };
      if (studentId in next) delete next[studentId];
      else next[studentId] = firstStop;
      return next;
    });
  };

  const saveAssignment = async () => {
    if (!assignRouteId) return;
    setAssignLoading(true);
    try {
      const assignments = Object.entries(routeAssignment).map(([studentId, pickupStop]) => ({ studentId, pickupStop }));
      await assignStudents(assignRouteId, assignments);
      for (const id of prevAssignment) {
        if (!(id in routeAssignment)) await unassignStudent(assignRouteId, id);
      }
      const list = await fetchRouteStudents(assignRouteId);
      setRouteCounts((c) => ({ ...c, [assignRouteId]: list.length }));
      setAssignRouteId(null);
    } catch {
      /* keep dialog open */
    } finally {
      setAssignLoading(false);
    }
  };

  const assignRoute = routes.find((r) => r.id === assignRouteId);
  const firstStop = typeof assignRoute?.stops[0] === 'string' ? assignRoute.stops[0] : '';

  const fetchTrips = async () => {
    setTripLoading(true);
    try {
      const data = await api.get<DriverTrip[]>('/transport/driver-trips');
      setTrips(data);
    } catch { /* ignore */ }
    setTripLoading(false);
  };

  const updateTrip = async (id: string, action: 'depart' | 'arrive' | 'complete') => {
    await api.put(`/transport/driver-trip/${id}/${action}`, {});
    fetchTrips();
  };

  const teachingStaff = staff.filter((s) => s.status === 'active' && (s.staffType === 'teaching' || (s.role && s.role.toLowerCase().includes('driver'))));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const driver = driverId ? teachingStaff.find((s) => s.id === driverId) : undefined;
    addRoute({
      name,
      description,
      stops: stopsInput.split(',').map((s) => s.trim()).filter(Boolean),
      driverName: driver ? driver.name : 'Unassigned',
      driverPhone: driver ? driver.phone : '',
      capacity: parseInt(capacity) || 30,
      status,
      driverIds: driver ? [driver.id] : [],
    });
    setOpen(false);
    setName(''); setDescription(''); setStopsInput('');
    setDriverId(''); setCapacity('30'); setStatus('active');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-orange-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{t('pages.transport')}</h1>
          <p className="text-muted-foreground">Manage school bus routes and driver assignments.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" /> Create Route</Button>} />
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Bus Route</DialogTitle>
                <DialogDescription>Define a new transport route and assign a driver.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Route Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. North Route" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Covers northern residential areas" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stops">Stops (comma-separated)</Label>
                  <Input id="stops" value={stopsInput} onChange={(e) => setStopsInput(e.target.value)} placeholder="e.g. Main Gate, Zongo, School" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver">Assign Teacher/Driver</Label>
                    <select
                      id="driver"
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {teachingStaff.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} — {(s.assignedClasses && s.assignedClasses.length > 0) ? s.assignedClasses.join(', ') : s.role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Bus Capacity</Label>
                    <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit">Create Route</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 text-center">
            <Bus size={28} className="mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold">{routes.length}</p>
            <p className="text-sm text-muted-foreground">Total Routes</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 text-center">
            <Users size={28} className="mx-auto mb-2 text-emerald-600" />
            <p className="text-3xl font-bold">{routes.filter((r) => r.status === 'active').length}</p>
            <p className="text-sm text-muted-foreground">Active Routes</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 text-center">
            <MapPin size={28} className="mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold">{routes.reduce((sum, r) => sum + r.stops.length, 0)}</p>
            <p className="text-sm text-muted-foreground">Total Stops</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {routes.map((route) => {
          const statusStyle = statusConfig[route.status];
          return (
            <Card key={route.id} className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Bus size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{route.name}</p>
                      <p className="text-xs text-muted-foreground">{route.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge variant="secondary" className={statusStyle.className}>
                    {statusStyle.label}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users size={14} />
                    <span>Driver: <strong>{route.driverName}</strong></span>
                  </div>
                  {route.driverPhone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} />
                      <span>{route.driverPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={14} />
                    <span>{route.capacity} seats — {route.stops.length} stops</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {route.stops.map((stop) => (
                    <Badge key={stop} variant="outline" className="text-xs">{stop}</Badge>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users size={14} />
                    <span><strong className="text-foreground">{routeCounts[route.id] ?? 0}</strong> assigned</span>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => openAssign(route.id)}>
                    <UserPlus size={14} className="mr-1" /> Assign Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock size={18} className="text-primary" /> Today's Driver Trips
          </h2>
          <Button variant="outline" size="sm" onClick={fetchTrips} disabled={tripLoading}>
            Refresh
          </Button>
        </div>
        {tripLoading ? (
          <p className="text-sm text-muted-foreground">Loading trips...</p>
        ) : trips.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trips today. Drivers can check in via the terminal.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const statusColors: Record<string, string> = {
                checked_in: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                departed: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                arrived: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                completed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
              };
              return (
                <Card key={trip.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{trip.driver.name}</p>
                        <p className="text-xs text-muted-foreground">{trip.driver.indexNumber} — {trip.route.name}</p>
                      </div>
                      <Badge variant="secondary" className={statusColors[trip.status] || ''}>
                        {trip.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                      {trip.checkInTime && <span>Check-in: {new Date(trip.checkInTime).toLocaleTimeString()}</span>}
                      {trip.departureTime && <span>Departed: {new Date(trip.departureTime).toLocaleTimeString()}</span>}
                      {trip.arrivalTime && <span>Arrived: {new Date(trip.arrivalTime).toLocaleTimeString()}</span>}
                    </div>
                    <div className="flex gap-2">
                      {trip.status === 'checked_in' && (
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => updateTrip(trip.id, 'depart')}>
                          <ArrowRight size={14} className="mr-1" /> Depart
                        </Button>
                      )}
                      {trip.status === 'departed' && (
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => updateTrip(trip.id, 'arrive')}>
                          <PinArrive size={14} className="mr-1" /> Arrive
                        </Button>
                      )}
                      {trip.status === 'arrived' && (
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => updateTrip(trip.id, 'complete')}>
                          <CheckCircle size={14} className="mr-1" /> Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>

      <Dialog open={!!assignRouteId} onOpenChange={(v) => { if (!v) setAssignRouteId(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Students — {assignRoute?.name}</DialogTitle>
            <DialogDescription>
              Select students riding this route and set each one's pickup stop.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {students.filter((s) => s.status === 'active').length === 0 && (
              <p className="text-sm text-muted-foreground">No active students yet.</p>
            )}
            {students
              .filter((s) => s.status === 'active')
              .map((s) => {
                const assigned = s.id in routeAssignment;
                return (
                  <div key={s.id} className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${assigned ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <button
                      onClick={() => toggleAssign(s.id, firstStop || (Array.isArray(assignRoute?.stops) ? String(assignRoute?.stops[0]) : ''))}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <div className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-xs ${assigned ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                        {assigned ? <CheckCircle size={12} /> : null}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.className}{s.indexNumber ? ` · ${s.indexNumber}` : ''}</p>
                      </div>
                    </button>
                    {assigned && (
                      <select
                        value={routeAssignment[s.id] || ''}
                        onChange={(e) => setRouteAssignment((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs"
                      >
                        {(assignRoute?.stops ?? []).map((stop) => (
                          <option key={stop} value={stop}>{stop}</option>
                        ))}
                      </select>
                    )}
                    <button onClick={() => toggleAssign(s.id, firstStop || String(assignRoute?.stops?.[0]))} className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignRouteId(null)}>Cancel</Button>
            <Button onClick={saveAssignment} disabled={assignLoading}>
              {assignLoading ? 'Saving...' : `Save (${Object.keys(routeAssignment).length} students)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
