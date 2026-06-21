'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperAdminStore } from '@/stores/super-admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewSchoolPage() {
  const router = useRouter();
  const { createSchool } = useSuperAdminStore();
  const [name, setName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ code: string; name: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await createSchool({ name, adminEmail, adminPassword, adminName: adminName || undefined }) as any;
      setResult({ code: res.school?.code || res.code, name: res.school?.name || name });
    } catch (err: any) {
      setError(err.message);
    } finally { setSubmitting(false); }
  };

  if (result) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold">School Created!</h2>
          <div className="mt-6 rounded-lg border bg-card p-6 text-left space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">School</span><span className="font-medium">{result.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Code</span><span className="font-mono font-bold text-indigo-600">{result.code}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Admin Email</span><span className="font-medium">{adminEmail}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Password</span><span className="font-mono">{adminPassword}</span></div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Give the admin email and code to the school. They can log in at the main site.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setResult(null); setName(''); setAdminEmail(''); setAdminPassword(''); setAdminName(''); }}>Create Another</Button>
            <Button onClick={() => router.push('/super-admin/schools')}>View All Schools</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/schools"><Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button></Link>
        <div><h1 className="text-2xl font-bold">New School</h1><p className="text-muted-foreground">Create a school and its admin account.</p></div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">School Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">School Name</label>
              <Input placeholder="e.g. St. Mary's International School" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Admin Account</p>
              <div className="space-y-3">
                <Input placeholder="Admin Name (optional)" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                <Input type="email" placeholder="Admin Email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
                <Input type="password" placeholder="Admin Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required minLength={6} />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create School'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
