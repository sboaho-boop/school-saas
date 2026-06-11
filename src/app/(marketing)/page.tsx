'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardCheck,
  Globe,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Check,
  Zap,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Building2,
  QrCode,
  Scan,
  UsersRound,
  Import,
  Shield,
  Smartphone,
} from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: 'Digital Wallet & NFC Tap',
    description: 'Student wallets with NFC card tap for attendance, canteen, transport, and fee payments.',
  },
  {
    icon: QrCode,
    title: 'QR Answer Sheets',
    description: 'Print QR-coded answer sheets, scan to auto-fill marks — no manual entry needed.',
  },
  {
    icon: UsersRound,
    title: 'Parent Portal',
    description: 'Parents log in to view attendance, marks, wallet balance, and top-up in real time.',
  },
  {
    icon: Scan,
    title: 'Tablet Tap Terminal',
    description: 'Full-screen PWA tap terminal for gate, canteen, transport, printing & fees.',
  },
  {
    icon: Import,
    title: 'CSV Import',
    description: 'Bulk import students, staff, and marks from spreadsheets with validation.',
  },
  {
    icon: Shield,
    title: 'Audit Trail',
    description: 'Complete activity logging for every create, update, and delete action.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for small schools getting started.',
    features: [
      'Up to 100 students',
      'Basic dashboard',
      'Student management',
      'Attendance tracking',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: 'GHS 299',
    period: '/month',
    description: 'For growing schools that need more features.',
    features: [
      'Up to 1,000 students',
      'Full dashboard & analytics',
      'Fee management',
      'Task management',
      'Custom branding',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For school chains and large institutions.',
    features: [
      'Unlimited students',
      'Multi-campus support',
      'API access',
      'Dedicated manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <span className="text-xl font-bold text-primary">EduPlatform</span>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/parent/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Parents
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex items-center justify-center overflow-hidden px-6 py-32 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99,102,241,0.4) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139,92,246,0.4) 0%, transparent 50%)`,
            animation: 'pulse 8s ease-in-out infinite alternate',
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
          }} />
          <style>{`
            @keyframes pulse {
              0% { opacity: 0.2; transform: scale(1); }
              100% { opacity: 0.5; transform: scale(1.1); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
          `}</style>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <span
            className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm mb-4"
          >
            <Globe size={12} className="mr-1" />
            Built for Africa, Ready for the World
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            School Management
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            A modern, cloud-based platform that helps schools manage students, staff,
            fees, and academics. Built for schools across Africa and beyond.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90">
                Start Free Trial
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                See Features
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Everything You Need</h2>
          <p className="mt-4 text-muted-foreground">
            Powerful features designed for modern school management.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-muted/30 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Simple Pricing</h2>
            <p className="mt-4 text-muted-foreground">
              Choose the plan that works for your school.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div
                  className={`rounded-xl border p-8 ${
                    plan.popular
                      ? 'border-primary shadow-lg shadow-primary/10'
                      : 'border-border/50'
                  } bg-card`}
                >
                  {plan.popular && (
                    <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Zap size={12} />
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check size={16} className="text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-8 w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold">About EduPlatform</h2>
            <div className="mt-6 space-y-4 text-left text-muted-foreground">
              <p>
                EduPlatform is a modern, cloud-based school management system designed
                to simplify the day-to-day operations of schools across Africa and beyond.
                From student enrollment and attendance tracking to fee management and
                staff coordination, we provide everything your school needs in one place.
              </p>
              <p>
                Our mission is to empower educators with technology that makes school
                administration effortless, so they can focus on what truly matters —
                providing quality education to students.
              </p>
              <p>
                Built with care by a team passionate about education technology,
                EduPlatform serves schools of all sizes, from small private institutions
                to large multi-campus organizations.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold">Get In Touch</h2>
            <p className="mt-3 text-muted-foreground">
              Have questions? We&apos;d love to hear from you.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <a
                href="https://wa.me/447735310744"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors"
              >
                <MessageCircle size={18} />
                WhatsApp Us
              </a>
              <a
                href="tel:+233502262294"
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600 transition-colors"
              >
                <Phone size={18} />
                Call Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/20 py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold text-primary">EduPlatform</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Modern school management platform built for Africa and beyond.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                <Link href="#about" className="hover:text-foreground transition-colors">About</Link>
                <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
                <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
                <Link href="/parent/login" className="hover:text-foreground transition-colors">Parent Portal</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Contact Us</h4>
              <div className="flex flex-col gap-3 text-sm">
                <a
                  href="https://wa.me/447735310744"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-emerald-500 transition-colors"
                >
                  <MessageCircle size={16} className="shrink-0" />
                  WhatsApp: +44 7735 310744
                </a>
                <a
                  href="tel:+233502262294"
                  className="flex items-center gap-2 text-muted-foreground hover:text-sky-500 transition-colors"
                >
                  <Phone size={16} className="shrink-0" />
                  Call: 050 226 2294
                </a>
                <a href="mailto:sboaho@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Mail size={16} className="shrink-0" />
                  sboaho@gmail.com
                </a>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={16} className="shrink-0" />
                  Accra, Ghana
                </span>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} EduPlatform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
