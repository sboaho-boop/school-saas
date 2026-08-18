'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ShieldCheck, XCircle, Loader2 } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const statusParam = searchParams.get('status');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already' | 'link-loading'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (statusParam === 'success') {
      setStatus('success');
      setMessage('Email verified successfully! You can now log in.');
    } else if (statusParam === 'already') {
      setStatus('already');
      setMessage('Your email is already verified. You can log in.');
    } else if (statusParam === 'error') {
      setStatus('error');
      setMessage('Invalid or expired verification link.');
    } else if (tokenParam) {
      setStatus('link-loading');
      api.get(`/auth/verify-email?token=${tokenParam}`).then(() => {
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
      }).catch((err: any) => {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be expired.');
      });
    }
  }, [tokenParam, statusParam]);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;
    setStatus('loading');
    try {
      const res = await api.post<{ message: string }>('/auth/verify-otp', { email, otp });
      setMessage(res.message);
      setStatus('success');
    } catch (err: any) {
      setMessage(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border-border/50 shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex size-12 items-center justify-center rounded-full bg-indigo-500/10">
              <ShieldCheck size={24} className="text-indigo-500" />
            </div>
          </div>
          <CardTitle>Verify Your Account</CardTitle>
          <CardDescription>
            {status === 'link-loading'
              ? 'Verifying your email...'
              : 'Enter the verification code sent to your email or phone.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' || status === 'already' ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <p className="font-medium text-emerald-600">{message}</p>
              <Button onClick={() => (window.location.href = '/login')}>Go to Login</Button>
            </div>
          ) : status === 'link-loading' ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
              <p className="text-sm text-muted-foreground">Verifying your email address...</p>
            </div>
          ) : status === 'error' && !email ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <XCircle size={40} className="text-red-500" />
              </div>
              <p className="font-medium text-red-600">{message}</p>
              <Button onClick={() => setStatus('idle')} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="staff@school.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              {status === 'error' && (
                <p className="text-sm text-red-500 text-center">{message}</p>
              )}
              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Verifying...' : 'Verify'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
