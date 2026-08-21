'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTutorAuth } from '@/stores/tutor-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Mail, Lock, User } from 'lucide-react';

export default function TutorSignupPage() {
  const router = useRouter();
  const { register, loading, error, clearError } = useTutorAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      router.push('/tutor/dashboard');
    } catch {}
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-violet-500/5 to-transparent">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-1">Create Your Account</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">Start learning with Teacher Kofi for free</p>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 text-center">
              {error}
              <button onClick={clearError} className="ml-2 underline">Dismiss</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10"
              />
            </div>
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
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
              {loading ? 'Creating account...' : 'Create Free Account'}
            </Button>
          </form>

          <p className="text-xs text-center mt-4 text-muted-foreground">
            Free plan includes 5 messages/day. No credit card required.
          </p>

          <p className="text-sm text-center mt-4 text-muted-foreground">
            Already have an account?{' '}
            <Link href="/tutor/login" className="text-violet-600 hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
