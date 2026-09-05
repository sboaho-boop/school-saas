'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { driverApi, setDriverToken } from '@/lib/driver-api';
import { Logo } from '@/components/logo';
import { Bus } from 'lucide-react';

export default function DriverLoginPage() {
  const router = useRouter();
  const [indexNumber, setIndexNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await driverApi.post<{ token: string }>('/driver/login', { indexNumber });
      setDriverToken(token);
      router.push('/driver/dashboard');
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
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold">Driver Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in with your staff index number</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Driver Sign In</CardTitle>
            <CardDescription>Enter the index number issued to you by your school.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="indexNumber">Index Number</Label>
                <Input id="indexNumber" placeholder="e.g. SCH-DEMO-STF-004" value={indexNumber} onChange={(e) => setIndexNumber(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : (
                  <>
                    <Bus size={16} className="mr-2" /> Sign In
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Only staff assigned to a transport route can sign in. Ask your school admin if you have no route.
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}