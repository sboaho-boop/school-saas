'use client';

import { useEffect } from 'react';
import { useSuperAdminStore } from '@/stores/super-admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function SchoolsPage() {
  const { schools, loading, fetchSchools } = useSuperAdminStore();

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schools</h1>
          <p className="text-muted-foreground">{schools.length} school{schools.length !== 1 ? 's' : ''} registered.</p>
        </div>
        <Link href="/super-admin/schools/new">
          <Button><Plus size={16} className="mr-2" />New School</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schools.map((s) => (
          <Link key={s.id} href={`/super-admin/schools/${s.id}`} className="block">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-indigo-500/30">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10">
                    <Building2 size={20} className="text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{s.name}</CardTitle>
                    <p className="text-xs font-mono text-muted-foreground">{s.code}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">{s.subscriptions?.[0]?.plan || 'free'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div><p className="font-bold">{s._count?.students || 0}</p><p className="text-xs text-muted-foreground">Students</p></div>
                <div><p className="font-bold">{s._count?.staff || 0}</p><p className="text-xs text-muted-foreground">Staff</p></div>
                <div><p className="font-bold">{s._count?.users || 0}</p><p className="text-xs text-muted-foreground">Users</p></div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Created {new Date(s.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card></Link>
        ))}
        {schools.length === 0 && !loading && (
          <div className="col-span-full flex flex-col items-center gap-4 py-16 text-center">
            <Building2 size={48} className="text-muted-foreground/30" />
            <p className="text-muted-foreground">No schools registered yet.</p>
            <Link href="/super-admin/schools/new"><Button variant="outline">Create First School</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
