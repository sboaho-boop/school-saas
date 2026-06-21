'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';
import { Eye, EyeOff, GraduationCap, Lock } from 'lucide-react';

export default function ParentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'setup'>('login');
  const [setupMsg, setSetupMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await api.post<{ token: string }>('/parent/login', { email, password: password || undefined });
      setToken(token);
      router.push('/parent/dashboard');
    } catch (err: any) {
      if (err.message === 'Password required') {
        setMode('setup');
        setError('Set a password to secure your account.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSetupMsg('');
    try {
      await api.post('/parent/set-password', { email, password });
      setSetupMsg('Password set! You can now sign in.');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Parent Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to monitor your child&apos;s progress</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>{mode === 'login' ? 'Sign In' : 'Set Your Password'}</CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Enter your email and password.'
                : 'Secure your account with a password.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Parent Email</Label>
                  <Input id="email" type="email" placeholder="parent@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {setupMsg && <p className="text-sm text-emerald-600">{setupMsg}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <button type="button" onClick={() => { setMode('setup'); setPassword(''); setError(''); }} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                  First time? Set a password
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  No account? Contact the school to register your email.
                </p>
              </form>
            ) : (
              <form onSubmit={handleSetup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setupEmail">Parent Email</Label>
                  <Input id="setupEmail" type="email" placeholder="parent@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setupPassword">New Password</Label>
                  <div className="relative">
                    <Input id="setupPassword" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Lock size={12} />At least 6 characters</p>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading || password.length < 6}>
                  {loading ? 'Setting password...' : 'Set Password'}
                </Button>
                <button type="button" onClick={() => { setMode('login'); setPassword(''); setError(''); }} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                  Already have a password? Sign in
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
