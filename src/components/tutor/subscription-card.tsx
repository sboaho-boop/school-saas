'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { tutorRequest } from '@/stores/tutor-auth';
import Link from 'next/link';
import { Loader2, BadgeCheck, Repeat, Timer, AlertTriangle } from 'lucide-react';

interface SubscriptionStatus {
  plan: string;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
  dailyUsage: number;
  dailyLimit: number;
  remaining: number;
  isActive: boolean;
  autoRenew: boolean;
  paymentPhone: string | null;
  paymentChannel: string | null;
}

const PLAN_LABELS: Record<string, string> = { free: 'Free', pro: 'Pro', unlimited: 'Unlimited' };
const CHANNEL_LABELS: Record<string, string> = { 'mtn-gh': 'MTN', 'vodafone-gh': 'Vodafone' };

function maskPhone(phone: string): string {
  const p = phone.replace(/\D/g, '');
  if (p.length < 7) return p;
  return p.slice(0, p.length - 3) + '•••' + p.slice(-3);
}

export function TutorSubscriptionCard() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await tutorRequest<SubscriptionStatus>('/tutor/subscription/status');
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancelAutoRenew = async () => {
    if (!window.confirm('Turn off auto-renewal? Your current plan stays active until it expires.')) return;
    setCancelling(true);
    setNotice(null);
    try {
      const res = await tutorRequest<{ message?: string }>('/tutor/subscription/cancel', { method: 'POST' });
      await load();
      setNotice({ type: 'success', text: res.message || 'Auto-renewal turned off.' });
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Could not turn off auto-renewal.' });
    } finally {
      setCancelling(false);
    }
  };

  const isPaid = status?.plan && status.plan !== 'free';
  const expiry = status?.subscriptionEnd ? new Date(status.subscriptionEnd) : null;
  const channel = status?.paymentChannel ? (CHANNEL_LABELS[status.paymentChannel] ?? status.paymentChannel) : null;

  if (loading) {
    return (
      <Card className="mb-4 border-border/50 shadow-sm">
        <CardContent className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin text-violet-500 shrink-0" /> Checking your subscription…
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Card className="mb-4 border-border/50 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BadgeCheck size={18} className="text-violet-600 shrink-0" />
            <span className="text-sm font-semibold">{PLAN_LABELS[status.plan] ?? status.plan} plan</span>
          </div>
          {isPaid && expiry && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Timer size={13} /> Renews {isNaN(expiry.getTime()) ? '' : expiry.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.autoRenew ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
            {status.autoRenew ? 'Auto-renew ON' : 'Auto-renew OFF'}
          </span>
          {status.autoRenew && channel && status.paymentPhone && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Repeat size={13} /> via {channel} {maskPhone(status.paymentPhone)}
            </span>
          )}
        </div>

        {notice && (
          <p className={`text-xs flex items-center gap-1.5 ${notice.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {notice.type === 'error' && <AlertTriangle size={13} />} {notice.text}
          </p>
        )}

        <div className="flex items-center gap-2">
          {isPaid && status.autoRenew && (
            <Button size="sm" variant="outline" onClick={handleCancelAutoRenew} disabled={cancelling} className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
              {cancelling ? <Loader2 size={14} className="animate-spin mr-1" /> : <Repeat size={14} className="mr-1" />} Turn off auto-renew
            </Button>
          )}
          <Link href="/tutor/pricing">
            <Button size="sm" variant={status.autoRenew && isPaid ? 'ghost' : 'outline'} className={status.autoRenew && isPaid ? '' : 'text-violet-600 border-violet-300 hover:bg-violet-50'}>
              {isPaid ? 'Manage plan' : 'Upgrade'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}