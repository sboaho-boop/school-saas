'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSuperAdminStore } from '@/stores/super-admin';
import { superApi } from '@/lib/super-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, WandSparkles, RefreshCw, Building2, Plus, Trash2, School, Download, Printer, SmartphoneNfc, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function SchoolDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { updateSchool, createSchoolCampus, deleteSchoolCampus } = useSuperAdminStore();

  const [school, setSchool] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [genMsg, setGenMsg] = useState('');

  const [wristbandOpen, setWristbandOpen] = useState(false);
  const [wristbandStudent, setWristbandStudent] = useState('');
  const [wristbandUid, setWristbandUid] = useState('');
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpStudent, setTopUpStudent] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');

  const [campusOpen, setCampusOpen] = useState(false);
  const [campusName, setCampusName] = useState('');
  const [campusAddress, setCampusAddress] = useState('');
  const [htEmail, setHtEmail] = useState('');
  const [htPass, setHtPass] = useState('');
  const [htName, setHtName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [schoolData, studentsData, walletsData, campusesData] = await Promise.all([
        superApi.get<any>(`/super/schools/${id}`),
        superApi.get<any[]>(`/super/schools/${id}/students`),
        superApi.get<any[]>(`/super/schools/${id}/wallets`),
        superApi.get<any[]>(`/super/schools/${id}/campuses`),
      ]);
      setSchool(schoolData);
      setStudents(studentsData);
      setWallets(walletsData);
      setCampuses(campusesData);
      setEditName(schoolData.name);
      setEditCode(schoolData.code || '');
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (id) load(); }, [id]);

  const handleSave = async () => {
    setSaving(true); setSaveMsg('');
    try {
      await updateSchool(id, { name: editName, code: editCode });
      setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(''), 2000);
      load();
    } catch (err: any) { setSaveMsg(err.message); }
    setSaving(false);
  };

  const handleGenerate = async (studentId: string) => {
    try {
      const { cardUid } = await (useSuperAdminStore.getState()).generateCardForStudent(id, studentId);
      setGenMsg(`Card generated: ${cardUid}`); setTimeout(() => setGenMsg(''), 3000);
      load();
    } catch (err: any) { setGenMsg(err.message); }
  };

  const handleZplDownload = async (studentId: string) => {
    try {
      const token = localStorage.getItem('edu_super_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/super/schools/${id}/zpl/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'card.zpl'; a.click();
      URL.revokeObjectURL(url);
    } catch { setGenMsg('Download failed'); setTimeout(() => setGenMsg(''), 3000); }
  };

  const handleBulkZpl = async () => {
    try {
      const token = localStorage.getItem('edu_super_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/super/schools/${id}/zpl-bulk`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'all-cards.zpl'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handleLinkWristband = async () => {
    if (!wristbandStudent || !wristbandUid) return;
    try {
      await superApi.post(`/super/schools/${id}/link-wristband`, { studentId: wristbandStudent, wristbandUid });
      setWristbandOpen(false); setWristbandStudent(''); setWristbandUid(''); load();
    } catch (err: any) { alert(err.message); }
  };

  const handleTopUp = async () => {
    if (!topUpStudent || !topUpAmount) return;
    try {
      await superApi.post(`/super/schools/${id}/top-up`, { studentId: topUpStudent, amount: parseFloat(topUpAmount) });
      setTopUpOpen(false); setTopUpStudent(''); setTopUpAmount(''); load();
    } catch (err: any) { alert(err.message); }
  };

  const handleCreateCampus = async () => {
    if (!campusName) return;
    setCreating(true);
    try {
      await createSchoolCampus(id, { name: campusName, address: campusAddress, headTeacherEmail: htEmail || undefined, headTeacherPassword: htPass || undefined, headTeacherName: htName || undefined });
      setCampusOpen(false);
      setCampusName(''); setCampusAddress(''); setHtEmail(''); setHtPass(''); setHtName('');
      load();
    } catch (err: any) { alert(err.message); }
    setCreating(false);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!school) return <div className="p-8 text-center text-muted-foreground">School not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/schools"><Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{school.name}</h1>
            <Badge variant="outline" className="font-mono">{school.code || 'No code'}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">Created {new Date(school.createdAt).toLocaleDateString()}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw size={14} className="mr-1" />Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Students</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{school._count?.students || 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Staff</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{school._count?.staff || 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cards Issued</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{wallets.filter((w) => w.cardUid).length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Campuses</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{campuses.length}</p></CardContent></Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Edit School</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">School Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="w-[160px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Index Code</label>
              <Input value={editCode} onChange={(e) => setEditCode(e.target.value.toUpperCase())} placeholder="SCH-001" />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save size={16} className="mr-1" />{saving ? 'Saving...' : 'Save'}
            </Button>
            {saveMsg && <span className={`text-sm ${saveMsg === 'Saved!' ? 'text-emerald-500' : 'text-red-500'}`}>{saveMsg}</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Campuses ({campuses.length})</CardTitle>
            <Button size="sm" onClick={() => setCampusOpen(true)}><Plus size={14} className="mr-1" />Add Campus</Button>
          </div>
        </CardHeader>
        <CardContent>
          {campuses.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No campuses yet. Add one to manage multiple locations.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {campuses.map((c) => (
                <div key={c.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <School size={16} className="text-indigo-500" />
                      <span className="font-medium">{c.name}</span>
                      <Badge variant="outline" className="font-mono text-xs">{c.code}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => { if (confirm('Delete this campus?')) deleteSchoolCampus(id, c.id).then(load); }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  {c.address && <p className="text-xs text-muted-foreground">{c.address}</p>}
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{c._count?.staff || 0} staff</span>
                    <span>{c._count?.users || 0} users</span>
                  </div>
                  {c.headTeacher && (
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="bg-indigo-500/5">Head: {c.headTeacher.name}</Badge>
                    </div>
                  )}
                  {!c.headTeacher && <p className="text-xs text-amber-600">No head teacher assigned</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={campusOpen} onOpenChange={setCampusOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Campus</DialogTitle>
            <DialogDescription>Create a new campus under {school.name}. Optionally assign a head teacher.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Campus Name</Label>
              <Input value={campusName} onChange={(e) => setCampusName(e.target.value)} placeholder="Main Campus" />
            </div>
            <div className="space-y-2">
              <Label>Address (optional)</Label>
              <Input value={campusAddress} onChange={(e) => setCampusAddress(e.target.value)} placeholder="123 School Street" />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Head Teacher Account (optional)</p>
              <div className="space-y-2">
                <Input value={htEmail} onChange={(e) => setHtEmail(e.target.value)} placeholder="head@campus.com" type="email" />
                <Input value={htPass} onChange={(e) => setHtPass(e.target.value)} placeholder="Temporary password" type="password" />
                <Input value={htName} onChange={(e) => setHtName(e.target.value)} placeholder="Head Teacher Name" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampusOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCampus} disabled={creating || !campusName}>{creating ? 'Creating...' : 'Create Campus'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {school.users && school.users.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Admin Users</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {school.users.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                  <Badge variant="outline" className="text-xs">{u.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {genMsg && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-200 p-3 text-center text-sm font-medium text-emerald-700">{genMsg}</div>
      )}

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Students ({students.length})</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleBulkZpl}><Download size={14} className="mr-1" />All ZPL</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No students enrolled yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => {
                  const wallet = wallets.find((w) => w.studentId === s.id);
                  const hasCard = wallet?.cardUid;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.className}</TableCell>
                      <TableCell>
                        {hasCard ? <Badge variant="outline" className="font-mono text-xs">{wallet.cardUid}</Badge> : <span className="text-xs text-muted-foreground">No card</span>}
                      </TableCell>
                      <TableCell className="font-mono text-sm">GHS {wallet ? wallet.balance.toFixed(2) : '0.00'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!hasCard && <Button size="sm" variant="outline" onClick={() => handleGenerate(s.id)} title="Generate Card"><WandSparkles size={14} /></Button>}
                          {hasCard && <Button size="sm" variant="outline" onClick={() => handleZplDownload(s.id)} title="Download ZPL"><Download size={14} /></Button>}
                          <Button size="sm" variant="outline" onClick={() => { setWristbandStudent(s.id); setWristbandUid(''); setWristbandOpen(true); }} title="Link Wristband"><SmartphoneNfc size={14} /></Button>
                          <Button size="sm" variant="outline" onClick={() => { setTopUpStudent(s.id); setTopUpAmount(''); setTopUpOpen(true); }} title="Top Up"><Wallet size={14} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={wristbandOpen} onOpenChange={setWristbandOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Link Wristband</DialogTitle>
            <DialogDescription>Enter the NFC wristband UID for this student.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Wristband UID</Label>
              <Input value={wristbandUid} onChange={(e) => setWristbandUid(e.target.value)} placeholder="04:AB:CD:EF:12:34" className="font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWristbandOpen(false)}>Cancel</Button>
            <Button onClick={handleLinkWristband} disabled={!wristbandUid}>Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Top Up Wallet</DialogTitle>
            <DialogDescription>Add funds to this student's wallet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Amount (GHS)</Label>
              <Input type="number" step="1" min="1" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopUpOpen(false)}>Cancel</Button>
            <Button onClick={handleTopUp} disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}>Top Up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
