'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { useTutorAuth } from '@/stores/tutor-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { KofiAvatar } from '@/components/ai/kofi-avatar';
import { Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { loading, error, clearError } = useTutorAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      useTutorAuth.setState({ error: 'Passwords do not match' });
      return;
    }
    try {
      await useTutorAuth.getState().resetPassword(token, password);
      setDone(true);
    } catch {}
  };

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-violet-500/5 to-transparent">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle size={40} className="text-orange-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Invalid Link</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This password reset link is invalid or missing. Please request a new one.
            </p>
            <Link href="/tutor/forgot-password">
              <Button className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500">Request New Link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-violet-500/5 to-transparent">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Password Reset!</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Button onClick={() => router.push('/tutor/login')} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-violet-500/5 to-transparent">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-center mb-6">
            <KofiAvatar size={26} title="Teacher Kofi" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-1">New Password</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Choose a new password for your account.
          </p>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 text-center">
              {error}
              <button onClick={clearError} className="ml-2 underline">Dismiss</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="New password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-muted-foreground">
            <Link href="/tutor/login" className="text-violet-600 hover:underline font-medium">Back to Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TutorResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Loading...</div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
