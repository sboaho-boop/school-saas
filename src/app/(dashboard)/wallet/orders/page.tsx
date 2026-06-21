'use client';

import { useEffect } from 'react';
import { useOrdersStore, type CardOrder } from '@/stores/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
  approved: 'bg-blue-500/10 text-blue-600 border-blue-200',
  printing: 'bg-purple-500/10 text-purple-600 border-purple-200',
  shipped: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
};

export default function OrdersPage() {
  const { orders, loading, fetchOrders, deleteOrder, updateStatus } = useOrdersStore();

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Card Orders</h1>
          <p className="text-muted-foreground">Order printed NFC cards for your students.</p>
        </div>
        <Link href="/wallet/orders/new">
          <Button><Plus size={16} className="mr-2" />New Order</Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">All Orders</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <ShoppingBag size={48} className="text-muted-foreground/30" />
              <div>
                <p className="font-medium">No orders yet</p>
                <p className="text-sm text-muted-foreground">Create your first card order to get NFC cards printed.</p>
              </div>
              <Link href="/wallet/orders/new"><Button variant="outline">Create Order</Button></Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">#{o.id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell>{o.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[o.status] || ''}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{o.notes || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {o.status === 'pending' && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => deleteOrder(o.id)}>
                              <Trash2 size={14} className="text-red-500" />
                            </Button>
                          </>
                        )}
                        {o.status === 'shipped' && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, 'delivered')}>
                            Mark Received
                          </Button>
                        )}
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
