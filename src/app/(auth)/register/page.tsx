'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { api } from '@/lib/api';
import { ArrowRight, ArrowLeft, Building, Palette, UserCheck, Shield, CheckCircle2, Copy } from 'lucide-react';

const countries = [
  { value: 'GH', label: 'Ghana', currency: 'GHS' },
  { value: 'NG', label: 'Nigeria', currency: 'NGN' },
  { value: 'KE', label: 'Kenya', currency: 'KES' },
  { value: 'US', label: 'United States', currency: 'USD' },
  { value: 'GB', label: 'United Kingdom', currency: 'GBP' },
];

const academicStructures = [
  { value: 'ghana', label: 'Ghana (KG, Basic 1-9, SHS)' },
  { value: 'nigeria', label: 'Nigeria (Primary, JSS, SSS)' },
  { value: 'uk', label: 'UK (Year 1-13)' },
  { value: 'custom', label: 'Custom Structure' },
];

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const [step, setStep] = useState(1);
  const [schoolName, setSchoolName] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [academicStructure, setAcademicStructure] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [registered, setRegistered] = useState<any>(null);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [verified, setVerified] = useState(false);

  const handleSubmit = async () => {
    try {
      const res = await register(email, adminPassword, adminName, phone, { privacyConsent: true, schoolName });
      setRegistered(res);
      setStep(4);
    } catch {}
  };

  const handleVerify = async () => {
    try {
      await api.post('/auth/verify-otp', { email, otp: verificationOtp });
      setVerified(true);
    } catch {}
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <div className="absolute right-6 top-6 z-10">
        <LanguageSwitcher />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <p className="mt-2 text-muted-foreground">Set up your school in minutes</p>
        </div>

        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 w-16 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Card className="border-border/50 shadow-lg shadow-primary/5">
          <div className="h-1.5 rounded-t-xl bg-gradient-to-r from-primary via-accent to-secondary" />
          {error && <p className="mx-6 mt-4 px-3 py-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">{error}</p>}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building size={20} />
                  School Information
                </CardTitle>
                <CardDescription>
                  Tell us about your school to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    placeholder="e.g., Marcoff Preparatory"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={(v) => v && setCountry(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label} ({c.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@school.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md shadow-primary/20"
                  onClick={() => setStep(2)}
                  disabled={!schoolName || !country}
                >
                  Continue
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={20} />
                  Academic Structure
                </CardTitle>
                <CardDescription>
                  Choose your school&apos;s academic structure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="structure">Academic Structure</Label>
                  <Select
                    value={academicStructure}
                    onValueChange={(v) => v && setAcademicStructure(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select structure" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicStructures.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Brand Color</Label>
                  <div className="flex gap-3">
                    {['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map(
                      (color) => (
                        <button
                          key={color}
                          className={`size-8 rounded-full border-2 transition-transform ${
                            primaryColor === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setPrimaryColor(color)}
                        />
                      )
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md shadow-primary/20"
                    onClick={() => setStep(3)}
                    disabled={!academicStructure}
                  >
                    Continue
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck size={20} />
                  Admin Account
                </CardTitle>
                <CardDescription>
                  Create your admin account to manage the school.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Full Name</Label>
                  <Input
                    id="adminName"
                    placeholder="John Doe"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Min 8 characters"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
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
                        className="mr-2 size-4 accent-primary align-text-top"
                      />
                      I have read and agree to the{' '}
                      <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                        Privacy Policy
                      </Link>
                      . I consent to the collection and processing of my personal data in accordance with the Data Protection Act 2012 (Act 843) of Ghana.
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md shadow-primary/20"
                    onClick={handleSubmit}
                    disabled={!adminName || adminPassword.length < 8 || !privacyConsent || loading}
                  >
                    {loading ? 'Creating account...' : 'Complete Setup'}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && !verified && registered && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  Verify Your Email
                </CardTitle>
                <CardDescription>
                  {registered.verification?.sentVia?.email
                    ? 'A verification code has been sent to your email.'
                    : registered.verification?.sentVia?.sms
                    ? 'A verification code has been sent via SMS.'
                    : 'Your verification code is shown below.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!registered.verification?.sentVia?.email && !registered.verification?.sentVia?.sms && (
                  <div className="rounded-lg bg-indigo-500/10 border border-indigo-200 p-4 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">Verification Code</p>
                    <p className="text-3xl font-bold tracking-widest text-indigo-600">{registered.verification?.otp}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(registered.verification?.otp || '')}
                      className="text-xs text-indigo-500 hover:text-indigo-700 inline-flex items-center gap-1"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your email or phone:</p>
                <Input
                  placeholder="000000"
                  value={verificationOtp}
                  onChange={(e) => setVerificationOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent"
                  onClick={handleVerify}
                  disabled={verificationOtp.length !== 6}
                >
                  Verify
                </Button>
              </CardContent>
            </>
          )}

          {step === 4 && verified && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  Verified Successfully!
                </CardTitle>
                <CardDescription>
                  Your account has been verified. You can now log in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent"
                  onClick={() => router.push('/login')}
                >
                  Go to Login
                </Button>
              </CardContent>
            </>
          )}

          <div className="px-6 pb-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
