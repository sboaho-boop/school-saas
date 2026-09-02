import type { Metadata } from "next";
import { Inter, Caveat, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { ThemeToggleFloating } from "@/components/layout/theme-toggle";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-chalk",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const patrick = Patrick_Hand({
  variable: "--font-chalk-body",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "EDUPLATFORM SOFTWARE SERVICES - School Management SaaS",
  description: "A modern, cloud-based school management platform built for Africa and beyond.",
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon.png', sizes: '64x64' },
    { rel: 'icon', url: '/favicon-192.png', sizes: '192x192' },
    { rel: 'icon', url: '/favicon-512.png', sizes: '512x512' },
    { rel: 'apple-touch-icon', url: '/favicon-192.png' },
  ],
  openGraph: {
    title: 'EDUPLATFORM SOFTWARE SERVICES',
    description: 'School management software for Africa and beyond.',
    url: 'https://eduplatformsoftware.com',
    siteName: 'EDUPLATFORM SOFTWARE SERVICES',
    images: [{ url: 'https://eduplatformsoftware.com/brand-logo.png', width: 200, height: 60 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EDUPLATFORM SOFTWARE SERVICES',
    description: 'School management software for Africa and beyond.',
    images: ['https://eduplatformsoftware.com/brand-logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable} ${patrick.variable} antialiased`} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EduPlatform" />
        <meta name="theme-color" content="#2563eb" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
                var lang = localStorage.getItem('eduplatform-lang');
                if (lang && lang.length <= 4) {
                  document.documentElement.setAttribute('lang', lang);
                }
              } catch(e) {}
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            })();
          `
        }} />
      </head>
      <body className="font-sans">
        {children}
        <ThemeToggleFloating />
      </body>
    </html>
  );
}
