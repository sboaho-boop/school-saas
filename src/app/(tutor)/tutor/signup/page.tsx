'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTutorAuth } from '@/stores/tutor-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { KofiAvatar } from '@/components/ai/kofi-avatar';
import { useI18n } from '@/stores/locale';
import { Mail, Lock, User } from 'lucide-react';

export default function TutorSignupPage() {
  const router = useRouter();
  const { register, loading, error, clearError } = useTutorAuth();
  const { t } = useI18n();
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
            <KofiAvatar size={26} title="Teacher Kofi" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-1">{t('tutor.createAccount')}</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">{t('tutor.startLearningWithKofi')}</p>

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
                placeholder={t('tutor.yourName')}
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
                placeholder={t('tutor.emailAddress')}
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
                placeholder={t('tutor.passwordMin')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
              {loading ? t('tutor.creatingAccount') : t('tutor.createFreeAccount')}
            </Button>
          </form>

          <p className="text-xs text-center mt-4 text-muted-foreground">
            {t('tutor.freePlanInfo')}
          </p>

          <p className="text-sm text-center mt-4 text-muted-foreground">
            {t('tutor.alreadyHaveAccount')}{' '}
            <Link href="/tutor/login" className="text-violet-600 hover:underline font-medium">{t('tutor.signIn')}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
