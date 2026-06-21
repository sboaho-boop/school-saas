'use client';

import { useEffect } from 'react';
import { useSuperAdminStore } from '@/stores/super-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, UserCog, CreditCard, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SuperAdminDashboard() {
  const { schools, fetchSchools } = useSuperAdminStore();

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  const totals = schools.reduce((acc, s) => ({
    students: acc.students + (s._count?.students || 0),
    staff: acc.staff + (s._count?.staff || 0),
    users: acc.users + (s._count?.users || 0),
  }), { students: 0, staff: 0, users: 0 });

  const subs = { free: schools.filter((s) => s.subscriptions?.[0]?.plan === 'free').length, pro: schools.filter((s) => s.subscriptions?.[0]?.plan === 'pro').length, enterprise: schools.filter((s) => s.subscriptions?.[0]?.plan === 'enterprise').length };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Dashboard</h1>
          <p className="text-muted-foreground">Overview of all schools on EduPlatform.</p>
        </div>
        <Link href="/super-admin/schools/new"><Button><Plus size={16} className="mr-2" />Add School</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex-row items-center gap-3 pb-2"><Building2 size={18} className="text-indigo-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Schools</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{schools.length}</p></CardContent></Card>
        <Card><CardHeader className="flex-row items-center gap-3 pb-2"><Users size={18} className="text-emerald-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totals.students}</p></CardContent></Card>
        <Card><CardHeader className="flex-row items-center gap-3 pb-2"><UserCog size={18} className="text-amber-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Staff</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totals.staff}</p></CardContent></Card>
        <Card><CardHeader className="flex-row items-center gap-3 pb-2"><CreditCard size={18} className="text-cyan-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Free / Pro / Enterprise</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{subs.free}<span className="text-base font-normal text-muted-foreground"> / {subs.pro} / {subs.enterprise}</span></p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Schools</CardTitle>
            <Link href="/super-admin/schools"><Button variant="outline" size="sm">Manage Schools</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 font-medium">School</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Students</th>
                  <th className="pb-3 font-medium">Staff</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-mono text-xs text-muted-foreground">{s.code}</td>
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3"><span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-600">{s.subscriptions?.[0]?.plan || 'free'}</span></td>
                    <td className="py-3">{s._count?.students || 0}</td>
                    <td className="py-3">{s._count?.staff || 0}</td>
                    <td className="py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {schools.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No schools yet. <Link href="/super-admin/schools/new" className="text-indigo-500 hover:underline">Create one</Link></td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
