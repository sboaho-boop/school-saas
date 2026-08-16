'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Building2, Plus, DoorOpen, Bed, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useI18n } from '@/stores/locale';

interface Allocation {
  id: string;
  student: { name: string };
  bedNumber: string;
  startDate: string;
}

interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  gender: string;
  allocations: Allocation[];
  _count?: { allocations: number };
}

interface Hostel {
  id: string;
  name: string;
  gender: string;
  warden: string;
  capacity: number;
  rooms: Room[];
}

export default function HostelPage() {
  const { t } = useI18n();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [addHostelOpen, setAddHostelOpen] = useState(false);
  const [hostelForm, setHostelForm] = useState({ name: '', gender: 'mixed', warden: '', capacity: '' });

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({ hostelId: '', roomNumber: '', capacity: '', gender: 'mixed' });

  const [allocateOpen, setAllocateOpen] = useState(false);
  const [allocateForm, setAllocateForm] = useState({ roomId: '', studentId: '', bedNumber: '', startDate: '' });

  const fetchHostels = async () => {
    try {
      const data = await api.get<Hostel[]>('/hostel/hostels');
      setHostels(data);
    } catch { setHostels([]); }
    setLoading(false);
  };

  useEffect(() => { fetchHostels(); }, []);

  const handleAddHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/hostel/hostels', { ...hostelForm, capacity: Number(hostelForm.capacity) });
    setAddHostelOpen(false);
    setHostelForm({ name: '', gender: 'mixed', warden: '', capacity: '' });
    fetchHostels();
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/hostel/rooms', { ...roomForm, capacity: Number(roomForm.capacity) });
    setAddRoomOpen(false);
    setRoomForm({ hostelId: '', roomNumber: '', capacity: '', gender: 'mixed' });
    fetchHostels();
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/hostel/allocate', allocateForm);
    setAllocateOpen(false);
    setAllocateForm({ roomId: '', studentId: '', bedNumber: '', startDate: '' });
    fetchHostels();
  };

  const handleDeallocate = async (id: string) => {
    await api.post(`/hostel/deallocate/${id}`);
    fetchHostels();
  };

  const genderBadge = (gender: string) => {
    const config: Record<string, { label: string; className: string }> = {
      boys: { label: 'Boys', className: 'bg-blue-500/10 text-blue-600' },
      girls: { label: 'Girls', className: 'bg-pink-500/10 text-pink-600' },
      mixed: { label: 'Mixed', className: 'bg-purple-500/10 text-purple-600' },
    };
    const c = config[gender] || { label: gender, className: 'bg-muted text-muted-foreground' };
    return <Badge variant="secondary" className={c.className}>{c.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-teal-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t('pages.hostel')}</h1>
          <p className="text-muted-foreground">Manage hostels, rooms, and bed allocations.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
            <DialogTrigger render={<Button size="sm" variant="outline"><DoorOpen size={16} className="mr-2" /> Add Room</Button>} />
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleAddRoom}>
                <DialogHeader>
                  <DialogTitle>Add Room</DialogTitle>
                  <DialogDescription>Add a new room to a hostel.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomHostel">Hostel</Label>
                    <Select value={roomForm.hostelId} onValueChange={(v) => setRoomForm({ ...roomForm, hostelId: v ?? '' })}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select hostel" /></SelectTrigger>
                      <SelectContent>
                        {hostels.map((h) => (
                          <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input id="roomNumber" value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="roomCapacity">Capacity</Label>
                      <Input id="roomCapacity" type="number" min="1" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomGender">Gender</Label>
                      <Select value={roomForm.gender} onValueChange={(v) => setRoomForm({ ...roomForm, gender: v ?? '' })}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mixed">Mixed</SelectItem>
                          <SelectItem value="boys">Boys</SelectItem>
                          <SelectItem value="girls">Girls</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <Button type="submit">Add Room</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={allocateOpen} onOpenChange={setAllocateOpen}>
            <DialogTrigger render={<Button size="sm" variant="outline"><Bed size={16} className="mr-2" /> Allocate Bed</Button>} />
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleAllocate}>
                <DialogHeader>
                  <DialogTitle>Allocate Bed</DialogTitle>
                  <DialogDescription>Assign a bed to a student.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="allocRoom">Room</Label>
                    <Select value={allocateForm.roomId} onValueChange={(v) => setAllocateForm({ ...allocateForm, roomId: v ?? '' })}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select room" /></SelectTrigger>
                      <SelectContent>
                        {hostels.flatMap((h) => h.rooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{h.name} - Room {r.roomNumber}</SelectItem>
                        )))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input id="studentId" value={allocateForm.studentId} onChange={(e) => setAllocateForm({ ...allocateForm, studentId: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedNumber">Bed Number</Label>
                      <Input id="bedNumber" value={allocateForm.bedNumber} onChange={(e) => setAllocateForm({ ...allocateForm, bedNumber: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" value={allocateForm.startDate} onChange={(e) => setAllocateForm({ ...allocateForm, startDate: e.target.value })} required />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <Button type="submit">Allocate</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={addHostelOpen} onOpenChange={setAddHostelOpen}>
            <DialogTrigger render={<Button size="sm"><Plus size={16} className="mr-2" /> Add Hostel</Button>} />
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleAddHostel}>
                <DialogHeader>
                  <DialogTitle>Add Hostel</DialogTitle>
                  <DialogDescription>Create a new hostel building.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hostel Name</Label>
                    <Input id="name" value={hostelForm.name} onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })} required placeholder="e.g. Mandela Hall" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={hostelForm.gender} onValueChange={(v) => setHostelForm({ ...hostelForm, gender: v ?? '' })}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mixed">Mixed</SelectItem>
                          <SelectItem value="boys">Boys</SelectItem>
                          <SelectItem value="girls">Girls</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input id="capacity" type="number" min="1" value={hostelForm.capacity} onChange={(e) => setHostelForm({ ...hostelForm, capacity: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warden">Warden</Label>
                    <Input id="warden" value={hostelForm.warden} onChange={(e) => setHostelForm({ ...hostelForm, warden: e.target.value })} placeholder="e.g. Mr. John Doe" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <Button type="submit">Create Hostel</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {hostels.map((hostel) => {
          const roomCount = hostel.rooms.length;
          const totalBeds = hostel.rooms.reduce((s, r) => s + r.capacity, 0);
          const allocatedBeds = hostel.rooms.reduce((s, r) => s + (r._count?.allocations ?? r.allocations?.length ?? 0), 0);
          const isExpanded = expanded[hostel.id];

          return (
            <Card key={hostel.id} className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{hostel.name}</p>
                      <p className="text-xs text-muted-foreground">Warden: {hostel.warden || 'Unassigned'}</p>
                    </div>
                  </div>
                  {genderBadge(hostel.gender)}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="font-medium">{roomCount}</p>
                    <p className="text-xs text-muted-foreground">Rooms</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="font-medium">{totalBeds}</p>
                    <p className="text-xs text-muted-foreground">Beds</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="font-medium">{allocatedBeds}/{totalBeds}</p>
                    <p className="text-xs text-muted-foreground">Occupied</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-3 w-full"
                  onClick={() => setExpanded({ ...expanded, [hostel.id]: !isExpanded })}
                >
                  <DoorOpen size={14} className="mr-2" />
                  {isExpanded ? 'Hide Rooms' : `View Rooms (${roomCount})`}
                </Button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 space-y-3"
                  >
                    {hostel.rooms.map((room) => (
                      <Card key={room.id} className="border-border/50 shadow-sm rounded-lg">
                        <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DoorOpen size={14} className="text-muted-foreground" />
                            Room {room.roomNumber}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {genderBadge(room.gender)}
                            <Badge variant="outline" className="text-xs">
                              {room._count?.allocations ?? room.allocations?.length ?? 0}/{room.capacity}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3">
                          {(room.allocations && room.allocations.length > 0) ? (
                            <div className="space-y-2">
                              {room.allocations.map((alloc) => (
                                <div key={alloc.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <UserCheck size={14} className="text-muted-foreground" />
                                    <span className="font-medium">{alloc.student.name}</span>
                                    <span className="text-muted-foreground">— Bed {alloc.bedNumber}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(alloc.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 h-7 text-xs"
                                    onClick={() => handleDeallocate(alloc.id)}
                                  >
                                    Deallocate
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                              <Bed size={14} className="mr-1" /> No allocations yet
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {hostel.rooms.length === 0 && (
                      <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                        No rooms added yet.
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {!loading && hostels.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <Building2 size={40} className="text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No hostels found. Click &quot;Add Hostel&quot; to get started.</p>
        </motion.div>
      )}
    </div>
  );
}
