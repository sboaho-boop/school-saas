'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/logo';
import { driverApi, getDriverToken, setDriverToken } from '@/lib/driver-api';
import { Bus, LogOut, MapPin, RefreshCw, CheckCircle2, CircleDashed } from 'lucide-react';

type Stop = { name: string; time?: string };
type Route = { id: string; name: string; description?: string; stops: Stop[]; capacity?: number; status: string };
type Trip = {
  id: string;
  status: string;
  date: string;
  checkInTime?: string;
  departureTime?: string;
  arrivalTime?: string;
  completedAt?: string;
  route?: { id: string; name: string };
};
type Driver = { id: string; name: string; indexNumber: string; role?: string; phone?: string };

const STATUS_STEPS = ['checked_in', 'departed', 'arrived', 'completed'] as const;

function fmt(t?: string) {
  if (!t) return null;
  try {
    return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return null;
  }
}

export default function DriverDashboardPage() {
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [today, setToday] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await driverApi.get<{ driver: Driver; routes: Route[]; trip: Trip | null }>('/driver/me');
      setDriver(data.driver);
      setRoutes(data.routes);
      setTrip(data.trip);
      setToday(data.trip?.date ? new Date(data.trip.date + 'T00:00:00').toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getDriverToken()) {
      router.replace('/driver/login');
      return;
    }
    load();
  }, [load, router]);

  const act = async (kind: 'start' | 'depart' | 'arrive' | 'complete') => {
    setActing(kind);
    setError('');
    try {
      let updated: Trip;
      if (kind === 'start') {
        updated = await driverApi.post<Trip>('/driver/trip/start');
      } else {
        updated = await driverApi.put<Trip>(`/driver/trip/${trip!.id}/${kind}`);
      }
      setTrip(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActing(null);
    }
  };

  const logout = () => {
    setDriverToken(null);
    router.replace('/driver/login');
  };

  const btn = (kind: 'start' | 'depart' | 'arrive' | 'complete', label: string) => (
    <Button onClick={() => act(kind)} disabled={!!acting} className="flex-1">
      {acting === kind ? 'Updating...' : label}
    </Button>
  );

  const tripStatus = trip?.status ?? null;
  const tripIndex = tripStatus ? STATUS_STEPS.indexOf(tripStatus as (typeof STATUS_STEPS)[number]) : -1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw size={24} className="animate-spin" />
          <p className="text-sm">Loading your route...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-16">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-semibold">Driver</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut size={16} className="mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {driver?.name}</h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary">{driver?.indexNumber}</Badge>
            {driver?.phone && <p className="mt-1 text-xs text-muted-foreground">{driver.phone}</p>}
          </div>
        </motion.div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {routes.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Bus size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No route has been assigned to you yet. Please contact your school admin.</p>
            </CardContent>
          </Card>
        ) : (
          routes.map((route) => (
            <motion.div key={route.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bus size={18} /> {route.name}
                      </CardTitle>
                      {route.description && <CardDescription className="mt-1">{route.description}</CardDescription>}
                    </div>
                    <Badge variant={tripStatus ? 'default' : 'secondary'}>
                      {tripStatus === 'completed' ? 'Completed' : tripStatus ? 'On Duty' : 'Not Started'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Stops{route.capacity ? ` · Capacity ${route.capacity}` : ''}</p>
                    <div className="space-y-1.5">
                      {route.stops.map((stop, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className={i === 0 ? 'text-green-500' : 'text-muted-foreground'} />
                          <span>{stop.name}</span>
                          {stop.time && <span className="ml-auto text-xs text-muted-foreground">{stop.time}</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-muted/40 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Today&apos;s Trip</p>
                    {!tripStatus ? (
                      <p className="mb-3 text-sm text-muted-foreground">You have not started your trip yet.</p>
                    ) : (
                      <div className="mb-3 flex items-center gap-1">
                        {(() => {
                          const t = trip!;
                          return STATUS_STEPS.map((step, i) => (
                            <div key={step} className="flex flex-1 flex-col items-center gap-1">
                              {i <= tripIndex ? <CheckCircle2 size={18} className="text-green-500" /> : <CircleDashed size={18} className="text-muted-foreground/50" />}
                              <span className={`text-[10px] capitalize ${i <= tripIndex ? 'text-green-600' : 'text-muted-foreground/60'}`}>{step.replace('_', ' ')}</span>
                              <span className="text-[10px] text-muted-foreground/70">
                                {fmt(i === 0 ? t.checkInTime : i === 1 ? t.departureTime : i === 2 ? t.arrivalTime : t.completedAt) || '—'}
                              </span>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                    {!tripStatus && btn('start', 'Start Trip')}
                    {tripStatus === 'checked_in' && btn('depart', 'Depart')}
                    {tripStatus === 'departed' && btn('arrive', 'Arrive at School')}
                    {tripStatus === 'arrived' && btn('complete', 'Mark Complete')}
                    {tripStatus === 'completed' && (
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <CheckCircle2 size={24} className="text-green-500" />
                        <p className="text-sm font-medium">Trip completed</p>
                        <p className="text-xs text-muted-foreground">Completed at {fmt(trip!.completedAt)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}