'use client';

import { useEffect, useState, useCallback } from 'react';
import { superApi } from '@/lib/super-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Nfc } from 'lucide-react';

interface CardOrder {
  id: string;
  schoolId: string;
  schoolName: string;
  quantity: number;
  status: 'pending' | 'approved' | 'printing' | 'shipped' | 'delivered';
  notes: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
  approved: 'bg-blue-500/10 text-blue-600 border-blue-200',
  printing: 'bg-purple-500/10 text-purple-600 border-purple-200',
  shipped: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
};

export default function SuperOrdersPage() {
  const [orders, setOrders] = useState<CardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setError('');
      setOrders(await superApi.get<CardOrder[]>('/super/orders'));
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const advance = async (id: string, status: string) => {
    try {
      await superApi.patch(`/super/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    }
  };

  const nextAction = (status: string): { label: string; to: string } | null => {
    switch (status) {
      case 'pending': return { label: 'Approve', to: 'approved' };
      case 'approved': return { label: 'Start Printing', to: 'printing' };
      case 'printing': return { label: 'Mark Shipped', to: 'shipped' };
      case 'shipped': return { label: 'Confirm Delivered', to: 'delivered' };
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">NFC Card Orders</h1>
          <p className="text-muted-foreground">All schools&apos; NFC card &amp; wristband supply orders — EduPlatform is the only supplier.</p>
        </div>
        <Nfc size={40} className="text-indigo-500/40" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Incoming Orders ({orders.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <Nfc size={48} className="text-muted-foreground/30" />
              <div>
                <p className="font-medium">No card orders yet</p>
                <p className="text-sm text-muted-foreground">When a school submits a card order it will appear here for fulfillment.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => {
                    const action = nextAction(o.status);
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">#{o.id.slice(-6).toUpperCase()}</TableCell>
                        <TableCell className="text-sm font-medium">{o.schoolName}</TableCell>
                        <TableCell>{o.quantity}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[o.status] || ''}>
                            {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{o.notes || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {action && (
                            <Button size="sm" variant="outline" onClick={() => advance(o.id, action.to)}>
                              {action.label}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}