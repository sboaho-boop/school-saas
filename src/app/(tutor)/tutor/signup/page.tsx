'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTutorAuth } from '@/stores/tutor-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { KofiAvatar } from '@/components/ai/kofi-avatar';
import { useI18n } from '@/stores/locale';
import { Mail, Lock, User, Shield } from 'lucide-react';

export default function TutorSignupPage() {
  const router = useRouter();
  const { register, loading, error, clearError } = useTutorAuth();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

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
              <Label htmlFor="tutorName" className="sr-only">{t('tutor.yourName')}</Label>
              <Input
                id="tutorName"
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
              <Label htmlFor="tutorEmail" className="sr-only">{t('tutor.emailAddress')}</Label>
              <Input
                id="tutorEmail"
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
              <Label htmlFor="tutorPassword" className="sr-only">{t('tutor.passwordMin')}</Label>
              <Input
                id="tutorPassword"
                type="password"
                placeholder={t('tutor.passwordMin')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10"
              />
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <label className="text-xs leading-relaxed text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    required
                    className="mr-2 size-4 accent-violet-600 align-text-top"
                  />
                  I have read and agree to the{' '}
                  <Link href="/privacy" className="text-primary underline hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                  . I consent to the collection and processing of my personal data in accordance with the Data Protection Act 2012 (Act 843) of Ghana.
                </label>
              </div>
            </div>
            <Button type="submit" disabled={loading || !privacyConsent} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
              {loading ? t('tutor.creatingAccount') : t('tutor.createFreeAccount')}
            </Button>
          </form>

          <p className="text-xs text-center mt-4 text-muted-foreground">
            {t('tutor.freePlanInfo')}
          </p>

          <p className="text-sm text-center mt-4 text-muted-foreground">
            {t('tutor.alreadyHaveAccount')}{' '}
            <Link href="/tutor/login" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">{t('tutor.signIn')}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
