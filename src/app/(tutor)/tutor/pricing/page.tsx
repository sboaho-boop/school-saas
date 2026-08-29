'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Check, Bot, Zap, Infinity, Smartphone, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTutorAuth, tutorRequest } from '@/stores/tutor-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const CHANNELS = [
  { id: 'mtn-gh', label: 'MTN Mobile Money', hint: '*170#' },
  { id: 'vodafone-gh', label: 'Vodafone / Telecel Cash', hint: '*110#' },
];

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
  message?: string;
  verificationType?: 'OTP' | 'USSD';
  otpPrefix?: string | null;
  hubtelPreApprovalId?: string;
  clientReferenceId?: string;
};

type ConfirmResponse = {
  success?: boolean;
  pending?: boolean;
  plan?: string;
  message?: string;
};

export default function TutorPricing() {
  const user = useTutorAuth((s) => s.user);
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, number>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [step, setStep] = useState<'phone' | 'otp' | 'approve'>('phone');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('mtn-gh');
  const [otpCode, setOtpCode] = useState('');
  const [initInfo, setInitInfo] = useState<InitResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
    setStep('phone');
    setInitInfo(null);
    setOtpCode('');
    setError(null);
    setNotice(null);
    setModalOpen(true);
  };

  const handleStart = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await tutorRequest<InitResponse>('/tutor/subscription/init', {
        method: 'POST',
        body: JSON.stringify({ plan: selectedPlan, phone, channel }),
      });
      setInitInfo(res);
      setStep(res.verificationType === 'OTP' ? 'otp' : 'approve');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the payment.');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async (withOtp?: boolean) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await tutorRequest<ConfirmResponse>('/tutor/subscription/confirm', {
        method: 'POST',
        body: JSON.stringify(withOtp ? { otpCode } : {}),
      });
      if (res.success) {
        router.replace('/tutor/dashboard?upgraded=1');
        return;
      }
      setNotice(res.message || 'Approval not confirmed yet. Approve on your phone, then try again.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm the payment.');
    } finally {
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
              {step === 'phone' && 'Enter your Mobile Money number to start the approval.'}
              {step === 'otp' && 'Enter the OTP sent to your phone to finish the approval.'}
              {step === 'approve' && 'Approve the request on your phone, then confirm below.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {step === 'phone' && (
              <>
                <div className="space-y-2">
                  <Label>Network</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CHANNELS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setChannel(c.id)}
                        className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                          channel === c.id ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' : 'border-border hover:border-border/70'
                        }`}
                      >
                        <span className="font-medium block">{c.label}</span>
                        <span className="text-xs text-muted-foreground">{c.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Money number</Label>
                  <Input
                    id="phone"
                    inputMode="tel"
                    placeholder="e.g. 0244 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button className="w-full" onClick={handleStart} disabled={busy || !phone.trim()}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : 'Continue'}
                </Button>
              </>
            )}

            {step === 'otp' && (
              <>
                <p className="text-sm text-muted-foreground">
                  An OTP has been sent to <strong>{phone}</strong>. Enter it below to finish.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP code</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {notice && <p className="text-sm text-amber-600">{notice}</p>}
                <Button className="w-full" onClick={() => handleConfirm(true)} disabled={busy || !otpCode.trim()}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : 'Verify & Activate My Plan'}
                </Button>
              </>
            )}

            {step === 'approve' && (
              <>
                <p className="text-sm text-muted-foreground">
                  An approval request was sent to <strong>{phone}</strong>. Follow the prompt on your phone
                  (use the <em>Hubtel/USSD code</em> shown) to approve {selectedPlan === 'pro' ? 'GHS 19' : 'GHS 39'}/month.
                  Once done, tap the button below.
                </p>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {notice && <p className="text-sm text-amber-600">{notice}</p>}
                <Button className="w-full" onClick={() => handleConfirm(false)} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : 'I have approved — Activate My Plan'}
                </Button>
              </>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Approval is required once. After approval, your plan renews automatically every month until you cancel.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}