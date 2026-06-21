'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function VerifyPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;
    setStatus('loading');
    try {
      const res = await api.post<{ message: string; tempPassword: string }>('/auth/verify-otp', { email, otp });
      setTempPassword(res.tempPassword);
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
          <CardDescription>Enter the verification code sent to your email or phone.</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center"><CheckCircle2 size={40} className="text-emerald-500" /></div>
              <p className="font-medium text-emerald-600">Verified successfully!</p>
              <p className="text-sm text-muted-foreground">Your temporary password is:</p>
              <div className="bg-muted rounded-lg p-3 font-mono text-lg tracking-wider select-all">{tempPassword}</div>
              <p className="text-xs text-muted-foreground">Use this password to log in. Change it after logging in from your settings page.</p>
              <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="staff@school.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="000000" maxLength={6} className="text-center text-2xl tracking-widest" />
              </div>
              {status === 'error' && <p className="text-sm text-red-500 text-center">{message}</p>}
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
