'use client';

import { useEffect } from 'react';
import { useOrdersStore, type CardOrder } from '@/stores/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Truck, Printer, CheckCircle, RefreshCw } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
  approved: 'bg-blue-500/10 text-blue-600 border-blue-200',
  printing: 'bg-purple-500/10 text-purple-600 border-purple-200',
  shipped: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
};

const statusButtons = [
  { label: 'Approve', status: 'approved', icon: CheckCircle, color: 'text-blue-500' },
  { label: 'Printing', status: 'printing', icon: Printer, color: 'text-purple-500' },
  { label: 'Ship', status: 'shipped', icon: Truck, color: 'text-cyan-500' },
  { label: 'Deliver', status: 'delivered', icon: Package, color: 'text-emerald-500' },
];

export default function AdminOrdersPage() {
  const { allOrders, loading, fetchAllOrders, updateStatus } = useOrdersStore();

  useEffect(() => { fetchAllOrders(); }, [fetchAllOrders]);

  const counts = {
    total: allOrders.length,
    pending: allOrders.filter((o) => o.status === 'pending').length,
    printing: allOrders.filter((o) => o.status === 'printing').length,
    shipped: allOrders.filter((o) => o.status === 'shipped').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fulfillment Dashboard</h1>
          <p className="text-muted-foreground">Manage card printing orders across all schools.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAllOrders}>
          <RefreshCw size={14} className="mr-2" />Refresh
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{counts.total}</p></CardContent></Card>
        <Card className="border-amber-200"><CardHeader><CardTitle className="text-sm text-amber-600">Pending</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-600">{counts.pending}</p></CardContent></Card>
        <Card className="border-purple-200"><CardHeader><CardTitle className="text-sm text-purple-600">Printing</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-purple-600">{counts.printing}</p></CardContent></Card>
        <Card className="border-cyan-200"><CardHeader><CardTitle className="text-sm text-cyan-600">To Ship</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-cyan-600">{counts.shipped}</p></CardContent></Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">All Orders</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : allOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders from any school yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">#{o.id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{o.schoolName}</TableCell>
                    <TableCell>{o.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[o.status] || ''}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {statusButtons.map((btn) => {
                          const idx = ['pending', 'approved', 'printing', 'shipped', 'delivered'].indexOf(o.status);
                          const target = ['pending', 'approved', 'printing', 'shipped', 'delivered'].indexOf(btn.status);
                          if (target <= idx) return null;
                          const Icon = btn.icon;
                          return (
                            <Button key={btn.status} size="sm" variant="ghost" onClick={() => updateStatus(o.id, btn.status)}>
                              <Icon size={14} className={btn.color} />
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
