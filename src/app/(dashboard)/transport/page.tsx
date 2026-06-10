'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Bus, MapPin, Phone, Users } from 'lucide-react';
import { useTransportStore } from '@/stores/transport';
import { useStaffStore } from '@/stores/staff';

const statusConfig = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

export default function TransportPage() {
  const { routes, addRoute } = useTransportStore();
  const staff = useStaffStore((s) => s.staff);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stopsInput, setStopsInput] = useState('');
  const [driverId, setDriverId] = useState('');
  const [capacity, setCapacity] = useState('30');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const teachingStaff = staff.filter((s) => s.staffType === 'teaching' && s.status === 'active');

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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Transport</h1>
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
                        <option key={s.id} value={s.id}>{s.name} — {s.assignedClass || s.role}</option>
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
              </CardContent>
            </Card>
          );
        })}
      </motion.div>
    </div>
  );
}
