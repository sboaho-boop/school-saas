'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Check, Bot, Zap, Infinity, Smartphone, Lock } from 'lucide-react';
import { useTutorAuth, tutorRequest } from '@/stores/tutor-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'GH\u20B50',
    period: '/forever',
    icon: Bot,
    color: 'from-gray-400 to-gray-500',
    features: ['5 messages per day', 'Text chat', 'Ghanaian curriculum', '7 languages', 'Read aloud'],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '',
    period: '/month',
    icon: Zap,
    color: 'from-violet-500 to-fuchsia-500',
    features: ['100 messages per day', 'Everything in Free', 'Voice input', 'Priority responses', 'Conversation history'],
    cta: 'Upgrade to Pro',
    popular: true,
    paystackPlan: 'pro',
    defaultPrice: 19,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '',
    period: '/month',
    icon: Infinity,
    color: 'from-amber-500 to-orange-500',
    features: ['Unlimited messages', 'Everything in Pro', 'No daily limits', 'Priority support', 'Early access to features'],
    cta: 'Go Unlimited',
    popular: false,
    paystackPlan: 'unlimited',
    defaultPrice: 39,
  },
];

type InitResponse = {
  success?: boolean;
  checkoutUrl?: string;
  checkoutId?: string;
  clientReference?: string;
  error?: string;
};

export default function TutorPricing() {
  const user = useTutorAuth((s) => s.user);
  const [prices, setPrices] = useState<Record<string, number>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_URL + '/tutor/subscription/plans')
      .then((res) => res.json())
      .then((data: Record<string, { priceGHS: number } | undefined>) => {
        const map: Record<string, number> = {};
        if (data?.pro?.priceGHS) map.pro = data.pro.priceGHS;
        if (data?.unlimited?.priceGHS) map.unlimited = data.unlimited.priceGHS;
        setPrices(map);
      })
      .catch(() => {});
  }, []);

  const openPayment = (plan: string) => {
    setSelectedPlan(plan);
    setError(null);
    setModalOpen(true);
  };

  const handleStartCheckout = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await tutorRequest<InitResponse>('/tutor/subscription/checkout/init', {
        method: 'POST',
        body: JSON.stringify({ plan: selectedPlan }),
      });
      if (!res?.checkoutUrl) {
        throw new Error(res?.error || 'Could not start payment.');
      }
      window.location.href = res.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the payment.');
      setBusy(false);
    }
  };

  return (
    <div className="flex-1">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Choose Your <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Learning Plan</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Start free and upgrade anytime. All plans include the full Teacher Kofi experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = user?.plan === plan.id;
            return (
              <Card
                key={plan.id}
                className={`relative border-border/50 ${
                  plan.popular ? 'border-violet-500 shadow-lg shadow-violet-500/10' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <div className={`size-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <plan.icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-3xl font-extrabold">
                      {plan.price || `GH\u20B5${(prices[plan.id] ?? plan.defaultPrice).toLocaleString()}`}
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.paystackPlan ? (
                    <Button
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600' : ''}`}
                      variant={isCurrent ? 'default' : plan.popular ? 'default' : 'outline'}
                      disabled={isCurrent}
                      onClick={() => openPayment(plan.paystackPlan!)}
                    >
                      {isCurrent ? 'Current Plan' : plan.cta}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      {isCurrent || (!user?.plan || user.plan === 'free') ? 'Current Plan' : plan.cta}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1.5">
            <Lock size={14} /> Pay by Mobile Money via Hubtel. Auto-renews monthly — cancel anytime from your dashboard.
          </p>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(o) => setModalOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone size={18} className="text-violet-500" />
              Pay {PLANS.find((p) => p.paystackPlan === selectedPlan)?.name || ''} with Mobile Money
            </DialogTitle>
            <DialogDescription>
              You will be taken to a secure Hubtel checkout page to pay with MTN / Telecel / AT Momo or card.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border/60 p-4 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold">{PLANS.find((p) => p.paystackPlan === selectedPlan)?.name || ''} (monthly)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-extrabold text-lg">
                  GH\u20B5{(prices[selectedPlan] ?? (selectedPlan === 'unlimited' ? 39 : 19)).toLocaleString()}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                After payment your plan activates immediately and automatically renews each month. Cancel anytime from your dashboard.
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button className="w-full" onClick={handleStartCheckout} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Opening secure payment...
                </>
              ) : (
                'Continue to Payment'
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">Secured by Hubtel. You confirm the amount before paying.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}