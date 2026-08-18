'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import Link from 'next/link';
import { Smartphone, Download, Monitor, Apple, ArrowLeft, Check } from 'lucide-react';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Download className="h-4 w-4" />
            Download EduPlatform
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Get the App
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your school from anywhere. Download the app or install it directly from your browser.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          <div className="border border-border/50 rounded-2xl p-8 bg-card hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Smartphone className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Android APK</h2>
            <p className="text-muted-foreground mb-6">
              Download the APK file and install it on your Android device.
            </p>
            <a href="/EduPlatform.apk" download="EduPlatform.apk">
              <Button className="w-full" size="lg">
                <Download className="h-5 w-5 mr-2" />
                Download APK
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              ~4MB &middot; Requires Android 5.0+
            </p>
          </div>

          <div className="border border-border/50 rounded-2xl p-8 bg-card hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Apple className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">iPhone &amp; iPad</h2>
            <p className="text-muted-foreground mb-6">
              Open in Safari and add to your home screen for a native app experience.
            </p>
            <a href="https://eduplatformsoftware.com" target="_blank" rel="noopener noreferrer">
              <Button className="w-full" size="lg" variant="outline">
                <Monitor className="h-5 w-5 mr-2" />
                Open in Safari
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Tap Share &rarr; Add to Home Screen
            </p>
          </div>
        </div>

        <div className="border border-border/50 rounded-2xl p-8 bg-card">
          <h3 className="text-lg font-semibold mb-4">How to install on Android</h3>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Tap <strong className="text-foreground">Download APK</strong> above</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Open the downloaded file from your notifications</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Allow &quot;Install from unknown sources&quot; if prompted</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0 mt-0.5">4</span>
              <span>Open EduPlatform and log in with your school credentials</span>
            </li>
          </ol>
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> The app loads the live website, so any updates are automatic — no need to re-download.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
