'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useThemeStore } from '@/stores/theme';
import { useBillingStore } from '@/stores/billing';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Building, Palette, Globe, Bell, Shield, CreditCard, Check, Sparkles, XCircle, Smartphone, QrCode, KeyRound, Download, Trash2, FileText, Wallet, Eye, EyeOff, Nfc, ShoppingCart, Zap } from 'lucide-react';
import { api, getToken } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/stores/locale';

const SMS_EVENT_LABELS: Record<string, string> = {
  registration_confirmation: 'Registration confirmation',
  login_alert: 'Login alerts',
  fee_receipt: 'Fee payment receipts',
  attendance_alert: 'Attendance alerts',
  low_balance_alert: 'Low wallet balance alerts',
  subscription_alert: 'Subscription change alerts',
};

const DEFAULT_SMS_PREFS: Record<string, boolean> = {
  registration_confirmation: true,
  login_alert: true,
  fee_receipt: true,
  attendance_alert: true,
  low_balance_alert: true,
  subscription_alert: true,
};

export default function SettingsPage() {
  const { theme, setSchoolName, setPrimaryColor, setTheme } = useThemeStore();
  const { subscription, plans, loading, fetchSubscription, fetchPlans, upgradePlan, cancelSubscription } = useBillingStore();
  const { t } = useI18n();

  const [phone, setPhone] = useState('');
  const [smsPrefs, setSmsPrefs] = useState<Record<string, boolean>>(DEFAULT_SMS_PREFS);

  const [twoFactorQr, setTwoFactorQr] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetupOtp, setTwoFactorSetupOtp] = useState('');
  const [twoFactorDisablePassword, setTwoFactorDisablePassword] = useState('');
  const [twoFactorMsg, setTwoFactorMsg] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [settingUp2fa, setSettingUp2fa] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  const [globalLoading, setGlobalLoading] = useState(false);

  const [hubtel, setHubtel] = useState({
    hubtelClientId: '',
    hubtelClientSecret: '',
    hubtelMerchantAccount: '',
    hubtelDisbursementAccount: '',
    hubtelSmsClientId: '',
    hubtelSmsClientSecret: '',
    smsSenderId: '',
  });
  const [showHubtelSecret, setShowHubtelSecret] = useState(false);
  const [hubtelMsg, setHubtelMsg] = useState('');
  const [hubtelError, setHubtelError] = useState('');
  const [hubtelLoading, setHubtelLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
    api.get<{ smsPreferences: Record<string, boolean> }>('/auth/sms-preferences').then((r) => {
      setSmsPrefs({ ...DEFAULT_SMS_PREFS, ...r.smsPreferences });
    }).catch(() => {});
    api.get<{ id: string; email: string; name: string; phone: string; twoFactorEnabled: boolean }>('/auth/me').then((r) => {
      setPhone(r.phone || '');
      setTwoFactorEnabled(r.twoFactorEnabled);
    }).catch(() => {});
    api.get<{ credentials: typeof hubtel }>('/school/hubtel').then((r) => {
      if (r.credentials) setHubtel(r.credentials);
    }).catch(() => {});
  }, [fetchSubscription, fetchPlans]);

  const saveSmsPrefs = async () => {
    setGlobalLoading(true);
    try {
      await api.put('/auth/sms-preferences', smsPrefs);
      setTwoFactorMsg('Notification preferences saved');
    } catch (err: any) {
      setTwoFactorError(err.message);
    }
    setGlobalLoading(false);
  };

  const setup2fa = async () => {
    setSettingUp2fa(true);
    setTwoFactorMsg('');
    setTwoFactorError('');
    try {
      const res = await api.post<{ secret: string; qrCode: string }>('/auth/2fa/setup');
      setTwoFactorSecret(res.secret);
      setTwoFactorQr(res.qrCode);
    } catch (err: any) {
      setTwoFactorError(err.message);
    }
  };

  const verify2fa = async () => {
    setGlobalLoading(true);
    setTwoFactorMsg('');
    setTwoFactorError('');
    try {
      await api.post('/auth/2fa/verify', { otp: twoFactorSetupOtp });
      setTwoFactorEnabled(true);
      setTwoFactorQr('');
      setTwoFactorSecret('');
      setTwoFactorSetupOtp('');
      setSettingUp2fa(false);
      setTwoFactorMsg('Two-factor authentication is now enabled');
    } catch (err: any) {
      setTwoFactorError(err.message);
    }
    setGlobalLoading(false);
  };

  const disable2fa = async () => {
    setGlobalLoading(true);
    setTwoFactorMsg('');
    setTwoFactorError('');
    try {
      await api.post('/auth/2fa/disable', { password: twoFactorDisablePassword });
      setTwoFactorEnabled(false);
      setTwoFactorDisablePassword('');
      setTwoFactorMsg('Two-factor authentication disabled');
    } catch (err: any) {
      setTwoFactorError(err.message);
    }
    setGlobalLoading(false);
  };

  const saveHubtel = async () => {
    setHubtelLoading(true);
    setHubtelMsg('');
    setHubtelError('');
    try {
      await api.put('/school/hubtel', hubtel);
      setHubtelMsg('Hubtel credentials saved successfully');
    } catch (err: any) {
      setHubtelError(err.message);
    }
    setHubtelLoading(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">{t('pages.settings')}</h1>
        <p className="text-muted-foreground">Manage your school settings and preferences.</p>
      </motion.div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Building size={16} className="mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette size={16} className="mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="regional">
            <Globe size={16} className="mr-2" />
            Regional
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell size={16} className="mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Wallet size={16} className="mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield size={16} className="mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard size={16} className="mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield size={16} className="mr-2" />
            Data & Privacy
          </TabsTrigger>
          <TabsTrigger value="nfc-cards">
            <Nfc size={16} className="mr-2" />
            NFC Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Update your school details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={theme.schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@school.edu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue="+233 24 123 4567" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Academic Year</CardTitle>
              <CardDescription>Configure your academic calendar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" defaultValue="2026-09-01" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" defaultValue="2027-07-31" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize your school&apos;s brand colors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="size-10 cursor-pointer rounded border-0"
                  />
                  <Input value={theme.primaryColor} className="w-32" readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Select
                  value={theme.borderRadius}
                  onValueChange={(v) => setTheme({ borderRadius: v as any })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save Branding</Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>School Logo</CardTitle>
              <CardDescription>Upload your school logo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="size-20 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Logo</span>
                </div>
                <Button variant="outline">Upload Logo</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="mt-6 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Configure locale, currency, and language.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select defaultValue="GH">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GH">Ghana</SelectItem>
                    <SelectItem value="NG">Nigeria</SelectItem>
                    <SelectItem value="KE">Kenya</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="GHS">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">GHS - Ghanaian Cedi (GH₵)</SelectItem>
                    <SelectItem value="NGN">NGN - Nigerian Naira (₦)</SelectItem>
                    <SelectItem value="KES">KES - Kenyan Shilling (KSh)</SelectItem>
                    <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Academic Structure</Label>
                <Select defaultValue="ghana">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ghana">Ghana (KG, Basic 1-9, SHS)</SelectItem>
                    <SelectItem value="nigeria">Nigeria (Primary, JSS, SSS)</SelectItem>
                    <SelectItem value="uk">UK (Year 1-13)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save Regional Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>SMS Notification Preferences</CardTitle>
              <CardDescription>Choose which events trigger SMS alerts. Requires a phone number on your account and a configured Hubtel SMS API key.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Your Phone Number (for alerts)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+233XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">International format, e.g. +233241234567</p>
              </div>
              <Separator />
              {Object.entries(SMS_EVENT_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="cursor-pointer">{label}</Label>
                  <input
                    type="checkbox"
                    checked={smsPrefs[key] || false}
                    onChange={(e) => setSmsPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                    className="size-4 accent-primary"
                  />
                </div>
              ))}
              <Button onClick={saveSmsPrefs} disabled={globalLoading}>
                {globalLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
              {twoFactorMsg && <p className="text-sm text-emerald-600">{twoFactorMsg}</p>}
              {twoFactorError && <p className="text-sm text-red-500">{twoFactorError}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Hubtel Payment Gateway</CardTitle>
              <CardDescription>Connect your Hubtel merchant account to accept payments from parents. Parents can pay school fees, top up wallets, and more via mobile money, card, or GHQR.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hubtelClientId">Hubtel Client ID</Label>
                <Input id="hubtelClientId" value={hubtel.hubtelClientId} onChange={(e) => setHubtel({ ...hubtel, hubtelClientId: e.target.value })} placeholder="Your Hubtel client ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hubtelClientSecret">Hubtel Client Secret</Label>
                <div className="relative">
                  <Input id="hubtelClientSecret" type={showHubtelSecret ? 'text' : 'password'} value={hubtel.hubtelClientSecret} onChange={(e) => setHubtel({ ...hubtel, hubtelClientSecret: e.target.value })} placeholder="Your Hubtel client secret" />
                  <button type="button" onClick={() => setShowHubtelSecret(!showHubtelSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showHubtelSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hubtelMerchantAccount">Merchant Account Number (Collection)</Label>
                <Input id="hubtelMerchantAccount" value={hubtel.hubtelMerchantAccount} onChange={(e) => setHubtel({ ...hubtel, hubtelMerchantAccount: e.target.value })} placeholder="Your Hubtel collection account number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hubtelDisbursementAccount">Disbursement Account Number (for withdrawals & staff payments)</Label>
                <Input id="hubtelDisbursementAccount" value={hubtel.hubtelDisbursementAccount} onChange={(e) => setHubtel({ ...hubtel, hubtelDisbursementAccount: e.target.value })} placeholder="Your Hubtel disbursement account number" />
              </div>
              <Separator />
              <p className="text-sm font-medium text-muted-foreground">SMS Credentials (for sending payment alerts to parents)</p>
              <div className="space-y-2">
                <Label htmlFor="hubtelSmsClientId">SMS Client ID</Label>
                <Input id="hubtelSmsClientId" value={hubtel.hubtelSmsClientId} onChange={(e) => setHubtel({ ...hubtel, hubtelSmsClientId: e.target.value })} placeholder="Hubtel SMS client ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hubtelSmsClientSecret">SMS Client Secret</Label>
                <Input id="hubtelSmsClientSecret" type="password" value={hubtel.hubtelSmsClientSecret} onChange={(e) => setHubtel({ ...hubtel, hubtelSmsClientSecret: e.target.value })} placeholder="Hubtel SMS client secret" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smsSenderId">SMS Sender ID</Label>
                <Input id="smsSenderId" value={hubtel.smsSenderId} onChange={(e) => setHubtel({ ...hubtel, smsSenderId: e.target.value })} placeholder="e.g. KATECOURT" />
                <p className="text-xs text-muted-foreground">This appears as the sender name on recipient phones. Must be registered with Hubtel.</p>
              </div>
              <Button onClick={saveHubtel} disabled={hubtelLoading}>
                {hubtelLoading ? 'Saving...' : 'Save Hubtel Credentials'}
              </Button>
              {hubtelMsg && <p className="text-sm text-emerald-600">{hubtelMsg}</p>}
              {hubtelError && <p className="text-sm text-red-500">{hubtelError}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account using an authenticator app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {twoFactorMsg && <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 rounded-md">{twoFactorMsg}</p>}
              {twoFactorError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/50 px-3 py-2 rounded-md">{twoFactorError}</p>}

              {!twoFactorEnabled && !settingUp2fa && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2"><Shield size={16} /> Status: <Badge variant="secondary">Disabled</Badge></p>
                    <p className="text-sm text-muted-foreground mt-1">Protect your account with an authenticator app (Google Authenticator, Authy, etc.)</p>
                  </div>
                  <Button onClick={setup2fa}>
                    <QrCode size={16} className="mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              )}

              {settingUp2fa && !twoFactorEnabled && (
                <div className="space-y-4">
                  <p className="text-sm font-medium">Scan this QR code with your authenticator app:</p>
                  {twoFactorQr && (
                    <div className="flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={twoFactorQr} alt="2FA QR Code" className="rounded-lg border" />
                    </div>
                  )}
                  {twoFactorSecret && (
                    <p className="text-xs text-muted-foreground text-center">
                      Or enter this key manually: <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{twoFactorSecret}</code>
                    </p>
                  )}
                  <Separator />
                  <div className="space-y-2">
                    <Label>Verify the code from your app</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={twoFactorSetupOtp}
                        onChange={(e) => setTwoFactorSetupOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="font-mono text-lg tracking-widest"
                      />
                      <Button onClick={verify2fa} disabled={twoFactorSetupOtp.length !== 6 || globalLoading}>
                        {globalLoading ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSettingUp2fa(false); setTwoFactorQr(''); setTwoFactorSecret(''); setTwoFactorSetupOtp(''); }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {twoFactorEnabled && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2"><Shield size={16} className="text-emerald-500" /> Status: <Badge variant="default" className="bg-emerald-500">Enabled</Badge></p>
                      <p className="text-sm text-muted-foreground mt-1">Your account is protected by two-factor authentication.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="disablePassword">Enter your password to disable 2FA</Label>
                    <div className="flex gap-2">
                      <Input
                        id="disablePassword"
                        type="password"
                        placeholder="Your current password"
                        value={twoFactorDisablePassword}
                        onChange={(e) => setTwoFactorDisablePassword(e.target.value)}
                      />
                      <Button variant="outline" onClick={disable2fa} disabled={!twoFactorDisablePassword || globalLoading}>
                        Disable 2FA
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Phone Number</CardTitle>
              <CardDescription>Your phone number is used for SMS alerts and account recovery.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="+233XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button onClick={async () => {
                  setGlobalLoading(true);
                  try {
                    await api.put('/auth/sms-preferences', { ...smsPrefs });
                    setTwoFactorMsg('Phone number updated');
                  } catch (err: any) { setTwoFactorError(err.message); }
                  setGlobalLoading(false);
                }}>Save</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Used for SMS alerts: login notifications, fee receipts, attendance alerts, and more.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your subscription and usage.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !subscription ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold capitalize">{subscription.planName}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Status: <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>{subscription.status}</Badge>
                      </p>
                    </div>
                    {subscription.plan === 'free' ? (
                      <Button onClick={() => upgradePlan('pro')}>
                        <Sparkles size={16} className="mr-2" />
                        Upgrade
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={cancelSubscription}>
                          <XCircle size={16} className="mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Students ({subscription.studentCount}/{subscription.studentLimit})</span>
                        <span className="text-muted-foreground">{Math.round((subscription.studentCount / subscription.studentLimit) * 100)}%</span>
                      </div>
                      <Progress value={Math.min(subscription.studentCount / subscription.studentLimit, 1)} className="h-2" />
                      </div>
                      <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Staff ({subscription.staffCount}/{subscription.staffLimit})</span>
                        <span className="text-muted-foreground">{Math.round((subscription.staffCount / subscription.staffLimit) * 100)}%</span>
                      </div>
                      <Progress value={Math.min(subscription.staffCount / subscription.staffLimit, 1)} className="h-2" />
                    </div>
                  </div>

                  {subscription.currentPeriodEnd && (
                    <p className="text-xs text-muted-foreground">
                      Current period ends: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Failed to load subscription.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>Choose the plan that fits your school.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {plans.filter(p => p.id !== 'enterprise').map((plan) => (
                  <div key={plan.id} className={`rounded-lg border p-4 ${subscription?.plan === plan.id ? 'border-primary ring-1 ring-primary' : 'border-border/50'}`}>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold capitalize">{plan.name}</p>
                        <p className="text-2xl font-bold">{plan.amount === 0 ? 'Free' : `GHS ${(plan.amount / 100).toFixed(0)}`}</p>
                        {plan.amount > 0 && <p className="text-xs text-muted-foreground">per month</p>}
                      </div>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" />Up to {plan.studentLimit} students</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" />Up to {plan.staffLimit} staff</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" />AI Tutor: {plan.id === 'free' ? '5 messages/day' : plan.id === 'pro' ? '100 messages/day' : 'Unlimited'}</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" />All modules included</li>
                        {plan.id === 'pro' && <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" />Priority support</li>}
                      </ul>
                      {subscription?.plan === plan.id ? (
                        <Badge variant="outline" className="w-full justify-center">Current Plan</Badge>
                      ) : (
                        <Button
                          variant={plan.id === 'free' ? 'outline' : 'default'}
                          className="w-full"
                          onClick={() => plan.amount === 0 ? null : upgradePlan(plan.id)}
                        >
                          {plan.amount === 0 ? 'Downgrade' : 'Upgrade'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Need More?</CardTitle>
              <CardDescription>Contact us for enterprise pricing with unlimited everything.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Enterprise plan includes unlimited students and staff, dedicated support, custom branding, and SLA guarantees.
              </p>
              <Button variant="outline" onClick={() => window.open('mailto:sboaho@gmail.com?subject=Enterprise%20Plan%20Inquiry')}>
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="privacy" className="mt-6 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Your Data</CardTitle>
              <CardDescription>Manage your personal data in accordance with data protection laws.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground space-y-2">
                <p>Under the Data Protection Act 2012 (Act 843) of Ghana, you have the right to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data (right to be forgotten)</li>
                  <li>Withdraw your consent at any time</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Export Your Data</Label>
                <p className="text-sm text-muted-foreground">Download a copy of all personal data we hold about you in JSON format.</p>
                <Button variant="outline" onClick={async () => {
                  try {
                    const data = await api.get<any>('/privacy/export');
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `eduplatform-data-export-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setTwoFactorMsg('Data export downloaded successfully');
                  } catch (err: any) {
                    setTwoFactorError(err.message);
                  }
                }}>
                  <Download size={16} className="mr-2" />
                  Export My Data
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Delete My Account</Label>
                <p className="text-sm text-muted-foreground">Permanently anonymize your personal data. This action cannot be undone. Your data will be replaced with anonymous placeholders.</p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type DELETE to confirm"
                    value={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    variant="destructive"
                    disabled={confirmDelete !== 'DELETE'}
                    onClick={async () => {
                      try {
                        await api.delete('/privacy/data');
                        setTwoFactorMsg('Your data has been anonymized. Logging out...');
                        setTimeout(() => {
                          useAuthStore.getState().logout();
                          window.location.href = '/';
                        }, 2000);
                      } catch (err: any) {
                        setTwoFactorError(err.message);
                      }
                    }}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete My Data
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Privacy Policy</Label>
                <p className="text-sm text-muted-foreground">Read the full privacy policy to understand how your data is collected, processed, and protected.</p>
                <Button variant="outline" onClick={() => window.open('/privacy', '_blank')}>
                  <FileText size={16} className="mr-2" />
                  View Privacy Policy
                </Button>
              </div>

              {twoFactorMsg && <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 rounded-md">{twoFactorMsg}</p>}
              {twoFactorError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/50 px-3 py-2 rounded-md">{twoFactorError}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nfc-cards" className="mt-6 space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Nfc size={20} className="text-primary" />
                NFC Card Guide
              </CardTitle>
              <CardDescription>What you need to set up NFC card tap for attendance, wallet payments, and student/staff identification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-1">Important</p>
                <p className="text-sm text-muted-foreground">
                  This system uses <strong>NFC cards (13.56 MHz)</strong>. Do NOT buy cheap 125 kHz RFID cards — they will not work with phones or tablets.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">What to Buy</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-border/50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Nfc size={16} className="text-emerald-500" />
                      NTAG213 NFC Cards
                    </div>
                    <p className="text-xs text-muted-foreground">
                      For students. Blank cards that get programmed with a unique ID. Buy in bulk — cheaper per card.
                    </p>
                    <p className="text-xs font-medium">~GH₵ 3–8 each</p>
                    <p className="text-xs text-muted-foreground">Search: &quot;NTAG213 NFC card bulk&quot;</p>
                  </div>
                  <div className="rounded-lg border border-border/50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Nfc size={16} className="text-blue-500" />
                      NFC Wristbands
                    </div>
                    <p className="text-xs text-muted-foreground">
                      For younger students (KG–Primary). Harder to lose, comfortable to wear daily.
                    </p>
                    <p className="text-xs font-medium">~GH₵ 5–12 each</p>
                    <p className="text-xs text-muted-foreground">Search: &quot;NTAG213 NFC wristband bulk&quot;</p>
                  </div>
                  <div className="rounded-lg border border-border/50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Nfc size={16} className="text-violet-500" />
                      NFC Key Fobs
                    </div>
                    <p className="text-xs text-muted-foreground">
                      For staff. Attach to lanyard or keyring. Professional look.
                    </p>
                    <p className="text-xs font-medium">~GH₵ 8–15 each</p>
                    <p className="text-xs text-muted-foreground">Search: &quot;NTAG213 NFC key fob&quot;</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">USB NFC Writer (One-time Purchase)</h3>
                <div className="rounded-lg border border-border/50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap size={16} className="text-amber-500" />
                    ACR122U USB NFC Reader/Writer
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Connects to your computer via USB. Used to write the generated card ID onto blank NFC cards. Only the school admin needs one.
                  </p>
                  <p className="text-xs font-medium">~GH₵ 150–300 (one-time)</p>
                  <p className="text-xs text-muted-foreground">Search: &quot;ACR122U NFC reader writer&quot; on Jumia Ghana or Amazon</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Where to Buy in Ghana</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex items-start gap-2 text-sm">
                    <ShoppingCart size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Jumia Ghana</p>
                      <p className="text-xs text-muted-foreground">Search &quot;NFC card&quot; or &quot;NFC wristband&quot; — fastest delivery</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <ShoppingCart size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">AliExpress</p>
                      <p className="text-xs text-muted-foreground">Cheapest for bulk orders (50+ cards). Ships in 15-30 days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <ShoppingCart size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Local Printing Shops</p>
                      <p className="text-xs text-muted-foreground">Some print custom NFC cards with school logos — ask around Accra/Kumasi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <ShoppingCart size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Amazon (via freight forwarder)</p>
                      <p className="text-xs text-muted-foreground">Best quality. Use GhanaShip or ShopToGhana to receive</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">How It Works</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
                  <li><strong>Generate card ID</strong> — In the wallet page, click &quot;Generate Card&quot; for a student. The system creates a unique ID like <code className="bg-muted px-1 rounded">EDU-A3F8K2M1</code></li>
                  <li><strong>Write to card</strong> — Connect the ACR122U to your computer, open the NFC writer app, and tap the blank card to write the ID onto it</li>
                  <li><strong>Issue the card</strong> — Hand the card to the student. Their ID is now linked to their wallet in the system</li>
                  <li><strong>Tap to use</strong> — At the terminal, the student taps their card on the admin&apos;s phone for attendance, wallet top-up, or payments</li>
                </ol>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Need help?</p>
                <p>Contact us at <strong>055 667 4353</strong> or <strong>sboaho@gmail.com</strong> for card setup assistance.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
