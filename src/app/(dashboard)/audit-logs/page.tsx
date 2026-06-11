'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Search, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AuditEntry {
  id: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AuditEntry[]>('/audit-logs').then(setLogs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) =>
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase())
  );

  const actionColors: Record<string, string> = {
    create: 'bg-emerald-500/10 text-emerald-600',
    update: 'bg-amber-500/10 text-amber-600',
    delete: 'bg-red-500/10 text-red-600',
    import: 'bg-blue-500/10 text-blue-600',
    freeze: 'bg-purple-500/10 text-purple-600',
    unfreeze: 'bg-teal-500/10 text-teal-600',
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">Audit Logs</h1>
          <p className="text-muted-foreground">Track who changed what in the system.</p>
        </div>
        <Shield size={20} className="text-rose-500" />
      </motion.div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Activity History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search logs..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 100).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-sm">{log.userName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={actionColors[log.action] || ''}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{log.resource}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{log.details}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No logs found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
