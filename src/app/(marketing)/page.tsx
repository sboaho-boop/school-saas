'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
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
  ScanLine,
  UsersRound,
  Import,
  Shield,
  Smartphone,
  Bus,
  BadgeCheck,
  Receipt,
  Calendar,
  DollarSign,
  Contact,
} from 'lucide-react';

const colors = [
  { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  { bg: 'bg-sky-500/10', text: 'text-sky-500', border: 'border-sky-500/20' },
  { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' },
  { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
  { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
  { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20' },
  { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' },
  { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  { bg: 'bg-lime-500/10', text: 'text-lime-500', border: 'border-lime-500/20' },
  { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/20' },
  { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' },
];

const features = [
  {
    icon: LayoutDashboard,
    title: 'Modern Dashboard',
    description: 'Beautiful analytics and real-time insights for your school.',
  },
  {
    icon: Users,
    title: 'Student Management',
    description: 'Complete student lifecycle from enrollment to graduation with billing integration.',
  },
  {
    icon: BadgeCheck,
    title: 'Staff Management',
    description: 'Role-based access for teaching, non-teaching, headteacher, admin, and accountant staff.',
  },
  {
    icon: CreditCard,
    title: 'Digital Wallet & NFC Tap',
    description: 'Admin generates NFC cards upon admission. Students tap at the gate for automatic attendance, and at canteen, transport, or printing for instant payment — no cash, no manual logs.',
  },
  {
    icon: Calendar,
    title: 'Smart Attendance',
    description: 'NFC tap at the gate automatically marks students present. No more calling names or paper registers — attendance is done before the bell rings.',
  },
  {
    icon: QrCode,
    title: 'QR Answer Sheets',
    description: 'Print QR-coded answer sheets per student. Scan to auto-fill marks in seconds.',
  },
  {
    icon: UsersRound,
    title: 'Parent Portal',
    description: 'Parents log in to view attendance, marks, wallet balance, and top-up in real time.',
  },
  {
    icon: ScanLine,
    title: 'Tablet Tap Terminal',
    description: 'Mount a tablet at the gate or canteen — students tap their card and attendance or payment is processed instantly. No teacher or cashier needed.',
  },
  {
    icon: DollarSign,
    title: 'Fee Management',
    description: 'No more teachers collecting cash. Fees, transport, and canteen payments are deducted automatically from the student wallet with each tap.',
  },
  {
    icon: Import,
    title: 'CSV Import',
    description: 'Bulk import students, staff, and marks from spreadsheets with built-in validation.',
  },
  {
    icon: Receipt,
    title: 'Subscription & Billing',
    description: 'Plan-based pricing with student/staff limits and Hubtel payment integration.',
  },
  {
    icon: ClipboardCheck,
    title: 'Task Management',
    description: 'Assign, track, and manage school tasks efficiently across all staff.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Reports',
    description: 'Generate detailed reports for academics, finance, attendance, and more.',
  },
  {
    icon: MessageSquare,
    title: 'Communication',
    description: 'School-wide announcements and direct messaging to staff and parents.',
  },
  {
    icon: Bus,
    title: 'Transport Management',
    description: 'Students tap their card on the bus for automatic fare deduction. No driver collecting cash or teacher tracking payments.',
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
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-indigo-500 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-indigo-500 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-indigo-500 transition-colors">
              Login
            </Link>
            <Link href="/parent/login" className="text-sm text-muted-foreground hover:text-indigo-500 transition-colors">
              Parents
            </Link>
            <Link href="/student/login" className="text-sm text-muted-foreground hover:text-indigo-500 transition-colors">
              Students
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex items-center justify-center overflow-hidden px-6 py-32 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-amber-950">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(99,102,241,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(245,158,11,0.3) 0%, transparent 50%)`,
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
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
            A modern, cloud-based platform that automates attendance, fees, transport,
            and grading — so your teachers can focus on teaching, not paperwork.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-lg">
                Start Free Trial
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
                <Link href="/explainer">
                  <Button size="lg" className="bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm font-medium">
                    Watch Demo
                  </Button>
                </Link>
                <Link href="#features">
              <Button size="lg" className="bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm font-medium">
                See Features
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] via-transparent to-purple-500/[0.03]" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 mb-4">
              NFC Cards
            </span>
            <h2 className="text-3xl font-bold">Professional Student ID Cards</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Each student gets a printed NFC card at admission — tap for attendance, payments, and transport.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="shrink-0"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-2xl blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-[340px] h-[215px] rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl border border-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                  <div className="absolute top-4 left-5">
                    <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">EduPlatform</p>
                    <p className="text-[8px] text-white/20">Student ID · NFC Enabled</p>
                  </div>

                  <div className="absolute top-4 right-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 8C2 6.34315 3.34315 5 5 5H19C20.6569 5 22 6.34315 22 8V16C22 17.6569 20.6569 19 19 19H5C3.34315 19 2 17.6569 2 16V8Z" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
                      <path d="M7 12C7 10.8954 7.89543 10 9 10H15C16.1046 10 17 10.8954 17 12V14C17 15.1046 16.1046 16 15 16H9C7.89543 16 7 15.1046 7 14V12Z" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
                      <path d="M9 12H15" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M10 7H14" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>

                  <div className="absolute left-5 top-[68px] flex items-center gap-4">
                    <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-white/20">
                      <span className="text-white font-bold text-lg">BK</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Brian Omondi</p>
                      <p className="text-[10px] text-white/40">Grade 1 · Section A</p>
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-5 right-5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 flex-1 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                        <div className="flex gap-1 items-center">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="w-[18px] h-[18px] rounded-sm bg-white/10" style={{ opacity: 0.3 + (i % 3) * 0.2 }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-white/25">EDU-A7F3-2B9C</span>
                  </div>

                  <div className="absolute bottom-3 right-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 8L6 16" /><path d="M10 8L10 16" /><path d="M14 8L14 16" /><path d="M18 8L18 16" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-5 max-w-md"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                  <Check size={14} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Printed at Admission</p>
                  <p className="text-sm text-muted-foreground">Each student receives a personalized NFC card on day one.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Check size={14} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Tap to Attend</p>
                  <p className="text-sm text-muted-foreground">Students tap at the gate — attendance is marked automatically.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Check size={14} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Tap to Pay</p>
                  <p className="text-sm text-muted-foreground">Canteen, transport, printing — all deducted from the student wallet.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                  <Check size={14} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Parent Notifications</p>
                  <p className="text-sm text-muted-foreground">Parents receive SMS when the child arrives, pays, or has low balance.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                  <Check size={14} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Print at School or Order Ready Cards</p>
                  <p className="text-sm text-muted-foreground">Download ZPL for your Zebra printer, print on A4 with NFC stickers, or order pre-printed cards shipped to your school.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 mb-4">
            All Features
          </span>
          <h2 className="text-3xl font-bold">Everything You Need</h2>
          <p className="mt-4 text-muted-foreground">
            Powerful features designed for modern school management.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const c = colors[i % colors.length];
            return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className={`rounded-xl border ${c.border} bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300`}>
                <div className={`mb-4 flex size-12 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-amber-500/5" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 mb-4">
              Simple Plans
            </span>
            <h2 className="text-3xl font-bold">Transparent Pricing</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Start free. Upgrade when you need more. No hidden fees.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan, i) => {
              const planColors = [
                { border: 'border-slate-200 dark:border-slate-700', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300', accent: 'text-slate-600 dark:text-slate-300' },
                { border: 'border-indigo-200 dark:border-indigo-700 shadow-xl shadow-indigo-500/10', badge: 'bg-indigo-500 text-white', accent: 'text-indigo-500' },
                { border: 'border-amber-200 dark:border-amber-700', badge: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300', accent: 'text-amber-600 dark:text-amber-300' },
              ];
              const pc = planColors[i];
              return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className={`rounded-2xl border-2 p-8 ${pc.border} bg-card relative`}>
                  {plan.popular && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full ${pc.badge} px-4 py-1 text-xs font-medium shadow-lg`}>
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
                        <Check size={16} className={`${pc.accent} shrink-0`} />
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
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-indigo-500/5" />
        <div className="container mx-auto px-6 relative">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 mb-4">
                About Us
              </span>
              <h2 className="text-3xl font-bold">Why EduPlatform?</h2>
              <div className="mt-8 space-y-4 text-left text-muted-foreground bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
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
        </div>
      </section>

      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10" />
        <div className="container mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 mb-4">
              Contact
            </span>
            <h2 className="text-2xl font-bold">Get In Touch</h2>
            <p className="mt-3 text-muted-foreground">
              Have questions? We&apos;d love to hear from you.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <a
                href="https://wa.me/447735310744"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors hover:scale-105 active:scale-95"
              >
                <MessageCircle size={18} />
                WhatsApp Us
              </a>
              <a
                href="tel:+233502262294"
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600 transition-colors hover:scale-105 active:scale-95"
              >
                <Phone size={18} />
                Call Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border bg-gradient-to-b from-background to-indigo-500/5 py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <Link href="/"><Logo size="sm" /></Link>
              <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                Modern school management platform built for Africa and beyond.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="#features" className="hover:text-indigo-500 transition-colors">Features</Link>
                <Link href="#pricing" className="hover:text-indigo-500 transition-colors">Pricing</Link>
                <Link href="#about" className="hover:text-indigo-500 transition-colors">About</Link>
                <Link href="/login" className="hover:text-indigo-500 transition-colors">Login</Link>
                <Link href="/register" className="hover:text-indigo-500 transition-colors">Register</Link>
                <Link href="/parent/login" className="hover:text-indigo-500 transition-colors">Parent Portal</Link>
                <Link href="/student/login" className="hover:text-indigo-500 transition-colors">Student Portal</Link>
                <Link href="/explainer" className="hover:text-indigo-500 transition-colors">Watch Demo</Link>
                <Link href="/privacy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Contact Us</h4>
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
                <a href="mailto:sboaho@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-indigo-500 transition-colors">
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
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground group/copyright">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent font-semibold">
              &copy; {new Date().getFullYear()} EduPlatform
            </span>
            . All rights reserved.
            <Link href="/super-admin/login" className="inline-block ml-1 opacity-0 group-hover/copyright:opacity-30 hover:group-hover/copyright:opacity-100 transition-all text-[11px] select-none" tabIndex={-1} aria-hidden="true">[admin]</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
