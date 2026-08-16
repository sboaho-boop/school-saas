'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Package, Plus, ArrowRightLeft, CheckCircle, XCircle, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/stores/locale';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: string;
  location: string;
  status: string;
  purchaseDate?: string;
  purchasePrice?: number;
  assignments?: Assignment[];
}

interface Assignment {
  id: string;
  assignedTo: string;
  assignedType: string;
  assignedDate: string;
  notes?: string;
  returnDate?: string;
  status: string;
}

const conditionColors: Record<string, string> = {
  good: 'bg-emerald-500/10 text-emerald-600',
  fair: 'bg-amber-500/10 text-amber-600',
  poor: 'bg-red-500/10 text-red-600',
};

const statusColors: Record<string, string> = {
  available: 'bg-emerald-500/10 text-emerald-600',
  assigned: 'bg-blue-500/10 text-blue-600',
  maintenance: 'bg-amber-500/10 text-amber-600',
  retired: 'bg-slate-500/10 text-slate-600',
};

export default function InventoryPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({
    name: '', category: '', quantity: '', condition: '',
    location: '', purchaseDate: '', purchasePrice: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({
    assignedTo: '', assignedType: '', assignedDate: '', notes: '',
  });
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [returning, setReturning] = useState<Record<string, boolean>>({});

  const fetchItems = async () => {
    try {
      const data = await api.get<InventoryItem[]>('/inventory');
      setItems(data);
    } catch { setItems([]); }
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => {
    setForm({ name: '', category: '', quantity: '', condition: '', location: '', purchaseDate: '', purchasePrice: '' });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = { ...form, quantity: Number(form.quantity), purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined };
      if (editingItem) {
        await api.put(`/inventory/${editingItem.id}`, body);
      } else {
        await api.post('/inventory', body);
      }
      resetForm();
      fetchItems();
    } catch {}
    setSubmitting(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      condition: item.condition,
      location: item.location,
      purchaseDate: item.purchaseDate || '',
      purchasePrice: item.purchasePrice != null ? String(item.purchasePrice) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/inventory/${id}`);
      fetchItems();
    } catch {}
  };

  const handleAssign = async (itemId: string, e: React.FormEvent) => {
    e.preventDefault();
    setAssignSubmitting(true);
    try {
      await api.post(`/inventory/${itemId}/assign`, assignForm);
      setAssignForm({ assignedTo: '', assignedType: '', assignedDate: '', notes: '' });
      fetchItems();
    } catch {}
    setAssignSubmitting(false);
  };

  const handleReturn = async (assignmentId: string) => {
    setReturning((p) => ({ ...p, [assignmentId]: true }));
    try {
      await api.post(`/inventory/assignments/${assignmentId}/return`);
      fetchItems();
    } catch {}
    setReturning((p) => ({ ...p, [assignmentId]: false }));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-500/10 via-primary/10 to-purple-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{t('pages.inventory')}</h1>
          <p className="text-muted-foreground">Manage school assets and track assignments.</p>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md shadow-primary/20" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus size={16} className="mr-2" /> Add Item
        </Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="text-base font-medium">{editingItem ? 'Edit Item' : 'Add New Item'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v ?? '' })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select condition" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input id="purchaseDate" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <Input id="purchasePrice" type="number" step="0.01" min="0" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={submitting}>{submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="border-border/50 shadow-sm rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(item)}><Edit size={14} /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" onClick={() => handleDelete(item.id)}><XCircle size={14} /></Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className={(conditionColors[item.condition] || 'bg-muted text-muted-foreground') + ' text-xs'}>{item.condition}</Badge>
                  <Badge variant="secondary" className={(statusColors[item.status] || 'bg-muted text-muted-foreground') + ' text-xs'}>{item.status}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>Quantity: <span className="font-medium text-foreground">{item.quantity}</span></p>
                  <p>Location: <span className="font-medium text-foreground">{item.location}</span></p>
                  {item.purchasePrice != null && <p>Price: <span className="font-medium text-foreground">${item.purchasePrice.toFixed(2)}</span></p>}
                  {item.purchaseDate && <p>Purchased: <span className="font-medium text-foreground">{new Date(item.purchaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>}
                </div>

                <div className="mt-3 pt-3 border-t border-border/50">
                  <Button size="sm" variant="ghost" className="w-full text-xs justify-between" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                    <span className="flex items-center gap-1.5"><ArrowRightLeft size={12} /> Assignments ({item.assignments?.length || 0})</span>
                    <span>{expandedId === item.id ? '▲' : '▼'}</span>
                  </Button>
                </div>

                {expandedId === item.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.2 }} className="mt-2 space-y-3">
                    {item.assignments && item.assignments.length > 0 && (
                      <div className="space-y-2">
                        {item.assignments.map((a) => (
                          <div key={a.id} className="rounded-lg bg-muted/50 p-2.5 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{a.assignedTo} <Badge variant="outline" className="text-[10px] ml-1 capitalize">{a.assignedType}</Badge></p>
                              {a.status === 'active' ? (
                                <Button size="sm" variant="outline" className="h-6 text-[10px] text-emerald-600" disabled={returning[a.id]} onClick={() => handleReturn(a.id)}>
                                  <CheckCircle size={10} className="mr-1" /> Return
                                </Button>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] bg-slate-500/10 text-slate-600">Returned</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground">Assigned: {new Date(a.assignedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            {a.notes && <p className="text-muted-foreground">Notes: {a.notes}</p>}
                            {a.returnDate && <p className="text-muted-foreground">Returned: {new Date(a.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={(e) => handleAssign(item.id, e)} className="grid gap-2 sm:grid-cols-2 rounded-lg border border-border/50 p-3">
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Assign This Item</Label>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`assignTo-${item.id}`} className="text-[11px]">Assigned To</Label>
                        <Input id={`assignTo-${item.id}`} className="h-7 text-xs" value={assignForm.assignedTo} onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })} required />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`assignType-${item.id}`} className="text-[11px]">Type</Label>
                        <Select value={assignForm.assignedType} onValueChange={(v) => setAssignForm({ ...assignForm, assignedType: v ?? '' })}>
                          <SelectTrigger className="w-full h-7 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`assignDate-${item.id}`} className="text-[11px]">Assigned Date</Label>
                        <Input id={`assignDate-${item.id}`} type="date" className="h-7 text-xs" value={assignForm.assignedDate} onChange={(e) => setAssignForm({ ...assignForm, assignedDate: e.target.value })} required />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`assignNotes-${item.id}`} className="text-[11px]">Notes</Label>
                        <Input id={`assignNotes-${item.id}`} className="h-7 text-xs" value={assignForm.notes} onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2 flex justify-end pt-1">
                        <Button type="submit" size="sm" className="h-7 text-xs" disabled={assignSubmitting}>{assignSubmitting ? 'Assigning...' : 'Assign Item'}</Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package size={40} className="text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No inventory items found.</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Add Item" to get started.</p>
        </div>
      )}
    </div>
  );
}
