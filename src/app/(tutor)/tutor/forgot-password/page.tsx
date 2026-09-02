'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTutorAuth } from '@/stores/tutor-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { KofiAvatar } from '@/components/ai/kofi-avatar';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function TutorForgotPasswordPage() {
  const { loading } = useTutorAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await useTutorAuth.getState().forgotPassword(email);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-violet-500/5 to-transparent">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold mb-2">Check your email</h1>
            <p className="text-sm text-muted-foreground mb-6">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
              Check your inbox and spam folder.
            </p>
            <Link href="/tutor/login">
              <Button variant="outline" className="w-full">Back to Sign In</Button>
            </Link>
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
          <h1 className="text-2xl font-bold text-center mb-1">Forgot Password?</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-muted-foreground">
            Remember your password?{' '}
            <Link href="/tutor/login" className="text-violet-600 hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
