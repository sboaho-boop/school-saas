'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperAdminStore } from '@/stores/super-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminLoginPage() {
  const { login, loading } = useSuperAdminStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/super-admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-xl bg-indigo-500/20">
              <Shield size={28} className="text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Super Admin</h1>
            <p className="text-sm text-white/50">Platform administration login</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30" required
            />
            <Input
              type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30" required
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-white/30 hover:text-white/50 transition-colors">← Back to main site</Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-white/20">Default: super@eduplatform.com / superadmin123</p>
      </div>
    </div>
  );
}
