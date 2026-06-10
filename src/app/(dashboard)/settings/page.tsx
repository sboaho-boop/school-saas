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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useThemeStore } from '@/stores/theme';
import { motion } from 'framer-motion';
import { Building, Palette, Globe, Bell, Shield, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setSchoolName, setPrimaryColor, setTheme } = useThemeStore();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Settings</h1>
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
          <TabsTrigger value="billing">
            <CreditCard size={16} className="mr-2" />
            Billing
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

        <TabsContent value="notifications" className="mt-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Fee reminders', 'Task deadlines', 'Attendance alerts', 'Exam announcements', 'System updates'].map((pref) => (
                <div key={pref} className="flex items-center justify-between">
                  <Label className="cursor-pointer">{pref}</Label>
                  <input type="checkbox" defaultChecked className="size-4 accent-primary" />
                </div>
              ))}
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your plan and billing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-primary/5 p-4 mb-4">
                <p className="font-medium">Professional Plan</p>
                <p className="text-sm text-muted-foreground">GH₵ 299/month • Renews on June 1, 2026</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline">View Invoices</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
