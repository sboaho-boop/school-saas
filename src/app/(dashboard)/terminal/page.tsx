'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { useWalletStore } from '@/stores/wallet';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Check, X, CreditCard, Bus, UtensilsCrossed, Printer, School, ArrowLeft } from 'lucide-react';

const services = [
  { id: 'attendance', label: 'Attendance', icon: Scan, color: 'bg-emerald-500 hover:bg-emerald-600', textColor: 'text-white' },
  { id: 'canteen', label: 'Canteen', icon: UtensilsCrossed, color: 'bg-orange-500 hover:bg-orange-600', textColor: 'text-white' },
  { id: 'transport', label: 'Transport', icon: Bus, color: 'bg-sky-500 hover:bg-sky-600', textColor: 'text-white' },
  { id: 'printing', label: 'Printing', icon: Printer, color: 'bg-purple-500 hover:bg-purple-600', textColor: 'text-white' },
  { id: 'fees', label: 'School Fees', icon: School, color: 'bg-rose-500 hover:bg-rose-600', textColor: 'text-white' },
];

export default function TerminalPage() {
  const { tapCard } = useWalletStore();
  const [service, setService] = useState('');
  const [cardUid, setCardUid] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string; balance?: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTap = async () => {
    if (!cardUid || !service) return;
    setLoading(true);
    setResult(null);
    try {
      const isPayment = service !== 'attendance';
      const res = await tapCard(cardUid, service, isPayment ? parseFloat(amount) || 0 : 0, 'tablet-01');
      setResult({ ok: true, message: res.message || 'Success', balance: res.balance });
      if (isPayment) setAmount('');
      setCardUid('');
    } catch (err: any) {
      setResult({ ok: false, message: err.message || 'Failed' });
    } finally {
      setLoading(false);
      setTimeout(() => setResult(null), 4000);
    }
  };

  const reset = () => { setService(''); setCardUid(''); setAmount(''); setResult(null); };

  if (!service) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
          <Scan size={48} className="mx-auto text-primary mb-3" />
          <h1 className="text-2xl font-bold">Tap Terminal</h1>
          <p className="text-muted-foreground">Select a service to begin</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg w-full">
          {services.map((s) => (
            <motion.div key={s.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button onClick={() => setService(s.id)} className={`${s.color} ${s.textColor} rounded-2xl p-8 w-full flex flex-col items-center gap-3 shadow-lg transition-all`}>
                <s.icon size={36} />
                <span className="text-lg font-semibold">{s.label}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const svc = services.find((s) => s.id === service);
  const isPayment = service !== 'attendance';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={reset}><ArrowLeft size={16} className="mr-1" />Back</Button>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white ${svc?.color.split(' ')[0]}`}>
              {svc?.icon && <svc.icon size={14} />}
              {svc?.label}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tap or enter Card UID</label>
            <Input
              placeholder="Scan NFC card or type UID..."
              value={cardUid}
              onChange={(e) => setCardUid(e.target.value)}
              autoFocus
              className="text-center text-lg font-mono"
            />
          </div>

          {isPayment && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (GHS)</label>
              <Input
                type="number"
                step="0.5"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-center text-lg"
              />
            </div>
          )}

          <Button className="w-full h-14 text-lg gap-3" onClick={handleTap} disabled={loading || !cardUid}>
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <CreditCard size={20} />
            )}
            {loading ? 'Processing...' : `Tap ${isPayment ? '& Pay' : 'for Attendance'}`}
          </Button>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl p-4 text-center ${result.ok ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}
              >
                <div className="flex justify-center mb-1">
                  {result.ok ? <Check size={24} /> : <X size={24} />}
                </div>
                <p className="font-semibold">{result.message}</p>
                {result.balance !== undefined && <p className="text-sm">Balance: GHS {result.balance.toFixed(2)}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-2">
            {services.filter((s) => s.id !== service).slice(0, 3).map((s) => (
              <button key={s.id} onClick={() => { setService(s.id); setResult(null); }}
                className="flex flex-col items-center gap-1 rounded-xl p-3 bg-muted hover:bg-muted/80 transition-colors text-xs"
              >
                <s.icon size={18} className="text-muted-foreground" />
                {s.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
