'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { APP_VERSION, APP_RELEASE_YEAR } from '@/lib/version';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Building2,
  Bus,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic,
  Nfc,
  PenTool,
  Phone,
  Play,
  QrCode,
  Receipt,
  ScanLine,
  School,
  Send,
  Shield,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
  UserX,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { KofiAvatar } from '@/components/ai/kofi-avatar';

const features = [
  { icon: Users, title: 'Students & Admissions', desc: 'Enrol, store records, and generate student credentials in seconds.' },
  { icon: BookOpen, title: 'Classes & Subjects', desc: 'Structure classes, subjects, and chapters around your curriculum.' },
  { icon: ScanLine, title: 'Tap-Card Attendance', desc: 'NFC cards mark attendance at the gate or in the classroom instantly.' },
  { icon: ClipboardCheck, title: 'Exams & Marking', desc: 'Create exams, record marks, and compute results automatically.' },
  { icon: FileText, title: 'Results & Report Cards', desc: 'Banding, GPA, and printable report cards for every learner.' },
  { icon: PenTool, title: 'Homework & Assignments', desc: 'Share tasks with classes and track submissions from one place.' },
  { icon: BadgeCheck, title: 'ID Cards', desc: 'Design and print student and staff ID cards in bulk.' },
  { icon: Award, title: 'Certificates & Awards', desc: 'Issue certificates and track learner achievements.' },
  { icon: UsersRound, title: 'Staff & Payroll', desc: 'Manage staff, issue letters, and process salary records.' },
  { icon: Receipt, title: 'Fee Invoices & Collections', desc: 'Generate invoices and track payers and defaulters effortlessly.' },
  { icon: Wallet, title: 'Expenses & Accounts', desc: 'Monitor income and expenses with clear financial reporting.' },
  { icon: ShoppingBag, title: 'Online Store & POS', desc: 'Sell uniforms, books, and supplies with an integrated till.' },
  { icon: CreditCard, title: 'Mobile Money & Cards', desc: 'Collect fees and payments by mobile money or card.' },
  { icon: MessageCircle, title: 'SMS & WhatsApp Alerts', desc: 'Send unlimited alerts to parents and staff instantly.' },
  { icon: MessageSquare, title: 'Chat & File Sharing', desc: 'Secure in-app chat for staff, teachers, and parents.' },
  { icon: Building2, title: 'Profile & Branding', desc: 'Your logo, theme, and colours applied across the dashboard.' },
  { icon: Bus, title: 'Transport & Routes', desc: 'Assign students to routes and let drivers run live roll-call.' },
  { icon: Globe, title: 'Multilingual', desc: 'Use the platform in English, Twi, Ga, Ewe, Fante, Hausa, or Dagbani.' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Board-ready charts that surface trends at a glance.' },
  { icon: Shield, title: 'Data Protection', desc: 'Aligned with Ghana\u2019s Data Protection Act 843, with role-based access.' },
];

const valueProps = [
  { icon: School, title: 'Made in Ghana', desc: 'Built for Ghanaian schools with local support and seven languages.' },
  { icon: Wallet, title: 'Transparent plans', desc: 'Start free. Pay by card or mobile money only when you grow.' },
  { icon: Smartphone, title: 'Works on any phone', desc: 'Dedicated apps for admins, teachers, students, parents, and drivers.' },
  { icon: Shield, title: 'Data protected', desc: 'Encrypted data, daily backups, and role-based access controls.' },
];

const howItWorks = [
  { icon: UserPlus, step: 'Step 1', title: 'Create your school', desc: 'Sign up free and set up your school profile in a few minutes.' },
  { icon: Users, step: 'Step 2', title: 'Add your people', desc: 'Import students and staff or take a class list photo and let us fill it in.' },
  { icon: Sparkles, step: 'Step 3', title: 'Run & grow', desc: 'Attendance, fees, results, transport, and communication in one place.' },
];

const kofiBullets = [
  '100+ topics from the Ghanaian curriculum',
  'Voice chat in Twi, Ga, Ewe, Fante, Hausa & Dagbani',
  'Read-aloud answers for every response',
  'Free plan with 5 messages per day',
];

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'Perfect for small schools getting started.',
    features: ['Up to 100 students', 'Up to 10 staff', 'Student records & attendance', 'Results & report cards', 'Email support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: 'GHS 299',
    period: '/month',
    desc: 'For growing schools that need everything.',
    features: ['Up to 1,000 students', 'Fees, mobile money & card payments', 'NFC wallet & tap-card attendance', 'Transport & live roll-call', 'SMS & WhatsApp alerts', 'Priority support'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'GHS 999',
    period: '/month',
    desc: 'For school chains and large institutions.',
    features: ['Unlimited students & staff', 'Multi-campus support', 'API access', 'Custom integrations', 'Priority support'],
    cta: 'Contact Sales',
    popular: false,
  },
];

function SectionGlow() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[80%] max-w-3xl">
        {reduceMotion ? (
          <div className="h-full w-full rounded-full bg-white/[0.05] blur-3xl" />
        ) : (
          <motion.div
            className="h-full w-full rounded-full bg-white/[0.05] blur-3xl"
            animate={{ x: ['-30%', '30%', '-30%'] }}
            transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  );
}

function HeroVideo() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  return (
    <video
      className="absolute inset-0 h-full w-full object-cover opacity-60"
      src="https://upload.wikimedia.org/wikipedia/commons/5/5b/Playing.webm"
      poster="https://commons.wikimedia.org/wiki/Special:FilePath/Playing.webm?width=1920"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

function DriftingParticles() {
  const reduceMotion = useReducedMotion();
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${(i * 97 + 5) % 100}%`,
        size: 2 + ((i * 13) % 3),
        delay: (i * 3.7) % 12,
        duration: 18 + ((i * 5) % 10),
      })),
    []
  );
  if (reduceMotion) return null;
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-0 rounded-full bg-white/[0.06]"
          style={{ left: p.left, width: p.size, height: p.size }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -900, opacity: [0, 0.7, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, index }: { icon: any; title: string; desc: string; index: number }) {
  const colors = [
    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'bg-sky-500/10 text-sky-500 border-sky-500/20',
    'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'bg-violet-500/10 text-violet-500 border-violet-500/20',
    'bg-rose-500/10 text-rose-500 border-rose-500/20',
    'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'bg-teal-500/10 text-teal-500 border-teal-500/20',
    'bg-pink-500/10 text-pink-500 border-pink-500/20',
    'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'bg-purple-500/10 text-purple-500 border-purple-500/20',
  ];
  const c = colors[index % colors.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-lg ${c} mb-3`}>
          <Icon size={20} />
        </div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function SectionHeading({ pill, title, sub }: { pill: string; title: string; sub?: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-4">
        {pill}
      </span>
      <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground max-w-lg mx-auto">{sub}</p>}
    </div>
  );
}

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-5">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">Features</Link>
            <Link href="#payments" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">Payments</Link>
            <Link href="#transport" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">Transport</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">Pricing</Link>
            <Link href="#kofi" className="text-sm text-muted-foreground hover:text-amber-400 transition-colors flex items-center gap-1"><KofiAvatar size={5} title="Teacher Kofi" />Teacher Kofi</Link>
            <Link href="/download" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" />Download App</Link>
            <LanguageSwitcher />
            <div className="relative">
              <button
                onClick={() => setLoginOpen(!loginOpen)}
                aria-expanded={loginOpen}
                aria-haspopup="true"
                className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors flex items-center gap-0.5"
              >
                Log In
                <ChevronDown size={14} className={`transition-transform ${loginOpen ? 'rotate-180' : ''}`} />
              </button>
              {loginOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLoginOpen(false)} aria-hidden="true" />
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 z-20 w-48 rounded-xl border border-border/50 bg-background p-1.5 shadow-xl"
                  >
                    {[
                      { href: '/login', label: 'School / Staff' },
                      { href: '/parent/login', label: 'Parent' },
                      { href: '/student/login', label: 'Student' },
                      { href: '/driver/login', label: 'Driver' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setLoginOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
            <Link href="/login">
              <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                Start Free
              </Button>
            </Link>
          </div>
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenu}
            aria-controls="mobile-menu"
          >
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenu && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3"
          >
            <Link href="#features" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Features</Link>
            <Link href="#payments" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Payments</Link>
            <Link href="#transport" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Transport</Link>
            <Link href="#pricing" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Pricing</Link>
            <Link href="#kofi" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Teacher Kofi</Link>
            <Link href="/download" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Download App</Link>
            <Link href="/student/login" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Students</Link>
            <Link href="/parent/login" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Parents</Link>
            <Link href="/driver/login" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Drivers</Link>
            <Link href="/login" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Login</Link>
            <Link href="/register" onClick={() => setMobileMenu(false)}>
              <Button className="w-full bg-indigo-600 text-white mt-2">Start Free</Button>
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-emerald-950">
          <SectionGlow />
          <HeroVideo />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-950/40 to-emerald-950/20" />
          <DriftingParticles />
          <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-background to-transparent" />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 w-full">
          <div className="container mx-auto px-4 lg:px-6 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm border border-white/10">
                    <Nfc size={14} className="text-emerald-400" />
                    <span>New — NFC tap cards & instant school payments</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                    Run your entire school from
                    <span className="text-emerald-300">
                      {' '}one place
                    </span>
                  </h1>

                  <p className="text-lg text-white/70 max-w-lg">
                    EduPlatform brings admissions, classes, fees, results, transport, and
                    communication into a single easy platform — in English, Twi, Ga, Ewe,
                    Fante, Hausa, and Dagbani.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Link href="/register">
                      <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-xl shadow-white/20 text-base px-8">
                        Get Started Free
                        <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm text-base px-6" onClick={() => setShowVideo(true)}>
                      <Play size={18} className="mr-2" />
                      Watch Demo
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/50">
                    <span className="inline-flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" /> Free to start
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" /> No card required
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" /> Set up in minutes
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-emerald-500/10 rounded-2xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="bg-slate-800/50 px-4 py-3 border-b border-white/5 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
                    <div className="ml-3 text-xs text-white/40 font-mono">EduPlatform Dashboard</div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {['Total Students', 'Revenue', 'Attendance'].map((label, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                          <div className="text-[10px] text-white/50">{label}</div>
                          <div className="text-lg font-bold text-white mt-1">
                            {['1,247', 'GHS 48.2K', '96.3%'][i]}
                          </div>
                          <div className="text-[10px] text-emerald-400">+12.5%</div>
                        </div>
                      ))}
                    </div>
                    <div className="h-24 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center">
                      <div className="flex items-end gap-2 h-16">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 88].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: h }}
                            transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                            className="w-5 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-sm"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Clock size={12} /> Recent Activity
                        </div>
                        <div className="text-[10px] text-white/50 mt-1">5 new enrollments today</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Wallet size={12} /> Fee Collections
                        </div>
                        <div className="text-[10px] text-white/50 mt-1">GHS 12,450 collected</div>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 bg-card border border-border/50 rounded-xl p-3 shadow-lg hidden lg:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <ScanLine size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Tap. Done.</div>
                      <div className="text-[10px] text-muted-foreground">NFC attendance marked</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="absolute -top-4 -right-4 bg-card border border-border/50 rounded-xl p-3 shadow-lg hidden lg:block"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-medium">Loved by staff</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Value Props */}
      <section className="relative py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border/50 rounded-xl p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                  <v.icon size={24} />
                </div>
                <h3 className="font-semibold mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gradient-to-b from-emerald-500/[0.02] via-transparent to-amber-500/[0.02]">
        <div className="container mx-auto px-4 lg:px-6">
          <SectionHeading
            pill="All-in-one platform"
            title="Everything your school needs"
            sub="One subscription. One login. No juggling separate apps for attendance, fees, results, and communication."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* NFC Payments */}
      <section id="payments" className="py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-4">
                <Nfc size={14} className="mr-1" /> NFC Payments & Cards
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                Attendance and payments, one tap at a time
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg">
                Replace paper registers and cash lines with ordinary-looking NFC cards.
                Students tap to mark attendance — and to pay at the canteen, bookstore,
                and school events straight from their wallet.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Tap to mark attendance at the gate or classroom',
                  'Cashless payments at the canteen, bookstore, and events',
                  'Cards, terminals, and starter kits ordered directly from EduPlatform',
                  'Bulk pricing for 50+ cards with setup guidance',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-foreground/80"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <a href="https://wa.me/447735310744" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-emerald-700 text-white hover:bg-emerald-800 font-semibold shadow-xl shadow-emerald-500/20 text-base px-6">
                    <MessageCircle size={18} className="mr-2" /> Order NFC Cards
                  </Button>
                </a>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="text-base px-6">
                    See Plans
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-3xl" />
              <div className="relative space-y-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                        <Wallet size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">School Wallet</div>
                        <div className="text-xs text-white/50">Tap to pay</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-medium">
                      <Nfc size={12} /> NFC
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                    <div className="text-[10px] text-white/50">Available Balance</div>
                    <div className="text-3xl font-bold text-white mt-1">GHS 142.50</div>
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                      <QrCode className="h-4 w-4 text-white/50" />
                      <span className="text-xs text-white/50 flex-1">Tap card or scan QR</span>
                      <Zap className="h-4 w-4 text-amber-400" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      { icon: ShoppingBag, label: 'Bookstore — Mathematics Workbook', amount: 'GHS 24.00' },
                      { icon: ScanLine, label: 'Morning attendance tap', amount: '7:45 AM' },
                      { icon: CreditCard, label: 'Canteen — Banku & Tilapia', amount: 'GHS 15.00' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/5 px-3 py-2">
                        <row.icon size={14} className="text-indigo-300 shrink-0" />
                        <span className="text-xs text-white/60 flex-1">{row.label}</span>
                        <span className="text-xs text-white/80 font-medium">{row.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Transport */}
      <section id="transport" className="py-24 bg-slate-950 relative overflow-hidden">
        <SectionGlow />
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="absolute -inset-4 bg-amber-500/[0.07] rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                      <Bus size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Route A — KM 5</div>
                      <div className="text-xs text-white/50">Driver: Mr. Acheampong</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-medium">
                    <Users size={12} /> 12 on board
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { stop: 'Central Station', onboard: true, label: '5 picked up' },
                    { stop: 'Market Square', onboard: true, label: '4 picked up' },
                    { stop: 'School Gate', onboard: false, label: '3 pending' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 px-3 py-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-300 flex items-center justify-center shrink-0">
                        <UserCheck size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white">{row.stop}</div>
                        <div className="text-[10px] text-white/50">{row.label}</div>
                      </div>
                      {row.onboard ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-[10px] font-medium">
                          <CheckCircle2 size={11} /> On board
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 text-white/60 px-2 py-0.5 text-[10px] font-medium">
                          <UserX size={11} /> Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 mb-4 border border-white/10">
                <Bus size={14} className="mr-1" /> Transport & Roll-Call
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-6">
                Know who is on the bus — and where they get off
              </h2>
              <p className="text-white/60 mb-8 max-w-lg">
                Assign every student to a route and pickup stop. Drivers run live
                roll-call from their phone as they go, so you always know which
                students are on board, picked up, or dropped off.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Assign students to routes with their pickup stop',
                  'Drivers mark students on and off at every stop in the driver app',
                  'Live on-board counts and pickup status per route',
                  'Works on any smartphone — no extra hardware needed',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/driver/login">
                  <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-xl shadow-indigo-500/20 text-base px-8">
                    Try the Driver App
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm text-base px-6">
                    Start Free
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Teacher Kofi */}
      <section id="kofi" className="relative py-24 overflow-hidden bg-gradient-to-b from-amber-950 to-stone-950">
        <div className="absolute inset-0 overflow-hidden">
          <SectionGlow />
        </div>
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 mb-4 border border-white/10">
                <KofiAvatar size={6} title="Teacher Kofi" className="mr-1" /> Meet Teacher Kofi
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 tracking-tight">
                Your AI tutor now follows students{' '}
                <span className="text-amber-300">home</span>
              </h2>
              <p className="text-white/60 mb-8 max-w-lg">
                Teacher Kofi helps students learn anytime, anywhere — Math, English, Science, and Ghanaian
                languages with voice support. Start free, then subscribe for unlimited learning.
              </p>
              <ul className="space-y-4 mb-8">
                {kofiBullets.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/tutor">
                  <Button size="lg" className="bg-amber-500 text-stone-950 hover:bg-amber-600 font-semibold shadow-xl shadow-amber-500/20 text-base px-8">
                    <KofiAvatar size={9} title="Teacher Kofi" className="mr-2" /> Try Teacher Kofi Free
                  </Button>
                </Link>
                <Link href="/tutor/pricing">
                  <Button size="lg" variant="outline" className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm text-base px-6">
                    See Plans
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-amber-500/10 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl p-6">
                <div className="bg-slate-800/50 px-4 py-3 border-b border-white/5 flex items-center gap-2 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                  <div className="w-3 h-3 rounded-full bg-red-400/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
                  <div className="ml-3 text-xs text-white/40 font-mono">Teacher Kofi — Student Chat</div>
                </div>
                <div className="space-y-3">
                  {[
                    { role: 'user', text: 'Help me with fractions' },
                    { role: 'kofi', text: 'Sure! Imagine a pizza cut into 8 slices. If you eat 2, you ate 2/8 = 1/4 of it. Great start!' },
                    { role: 'kofi', text: 'Want a quick practice quiz on that?' },
                  ].map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          m.role === 'user'
                            ? 'bg-white/10 text-white rounded-br-md'
                            : 'bg-amber-500/90 text-stone-950 rounded-bl-md'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                  <Mic className="h-4 w-4 text-white/50" />
                  <span className="text-xs text-white/50 flex-1">Talk in English, Twi or Ga...</span>
                  <Send className="h-4 w-4 text-amber-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-4">
                <Shield size={14} className="mr-1" /> Security & Trust
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                Your data, protected
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg">
                Built for Ghanaian schools with privacy in mind. Your records are
                encrypted, backed up daily, and visible only to the people you give
                access to.
              </p>
              <ul className="space-y-4">
                {[
                  'Aligned with Ghana\u2019s Data Protection Act 843',
                  'Encrypted data in transit and at rest',
                  'Role-based access for admins, teachers, parents, and students',
                  'Daily backups with off-site storage',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-foreground/80"
                  >
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl p-8">
                <Shield size={48} className="text-emerald-300 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Made in Ghana, built to last</h3>
                <p className="text-white/60 text-sm">
                  Local team, local support, and clear plans in Ghana Cedis.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {['Data Act 843', 'Encrypted', 'Daily Backups', 'Local Support'].map((badge) => (
                    <div key={badge} className="bg-white/5 rounded-lg px-3 py-2 text-xs text-white/70 border border-white/5 text-center">
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-amber-500/5" />
        <div className="container mx-auto px-4 lg:px-6 relative">
          <SectionHeading
            pill="Simple Plans"
            title="Transparent Pricing"
            sub="Prices in Ghana Cedis per month. Pay by card or mobile money."
          />
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
                  <div className={`rounded-2xl border-2 p-8 ${pc.border} bg-card relative h-full flex flex-col`}>
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
                    <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                    <ul className="mt-6 space-y-3 flex-1">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2 text-sm">
                          <Check size={16} className={`${pc.accent} shrink-0`} />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className="block mt-8 w-full">
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>{plan.cta}</Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <p className="text-center mt-8 text-sm text-muted-foreground max-w-xl mx-auto">
            Teacher Kofi is sold separately in US Dollars (Pro $19/month, Unlimited $39/month).
            Every school subscription starts free — no card required.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-emerald-500/[0.02] via-transparent to-amber-500/[0.02]">
        <div className="container mx-auto px-4 lg:px-6">
          <SectionHeading
            pill="Get started"
            title="Running your school in three steps"
          />
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-4 mx-auto">
                  <s.icon size={28} />
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{s.step}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-950">
          <SectionGlow />
        </div>
        <div className="container mx-auto px-4 lg:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to run your school on EduPlatform?
            </h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8">
              Free to start — set up in minutes with no card required. Need help getting
              started? Message us on WhatsApp.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-xl text-base px-8">
                  Get Started Today
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/447735310744" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm text-base px-6">
                  <MessageCircle size={18} className="mr-2" /> WhatsApp Us
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-to-b from-background to-emerald-500/5 pt-16 pb-8">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 mb-12">
            <div className="lg:col-span-2">
              <Logo />
              <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                EduPlatform — school management software made in Ghana, for modern schools.
                Admissions, attendance, fees, results, transport, and payments in one place.
              </p>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://wa.me/447735310744"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/50 transition-all"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={16} />
                </a>
                <a
                  href="tel:+233556674353"
                  className="w-9 h-9 rounded-full bg-white/5 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-sky-500 hover:border-sky-500/50 transition-all"
                  aria-label="Call us"
                >
                  <Phone size={16} />
                </a>
                <a
                  href="mailto:sboaho@gmail.com"
                  className="w-9 h-9 rounded-full bg-white/5 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/50 transition-all"
                  aria-label="Email us"
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>
            {Object.entries({
              Product: [
                { label: 'Features', href: '#features' },
                { label: 'Payments', href: '#payments' },
                { label: 'Transport', href: '#transport' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Teacher Kofi', href: '#kofi' },
              ],
              Access: [
                { label: 'Download App', href: '/download' },
                { label: 'Student Login', href: '/student/login' },
                { label: 'Parent Login', href: '/parent/login' },
                { label: 'Driver Login', href: '/driver/login' },
                { label: 'Staff Login', href: '/login' },
              ],
              Company: [
                { label: 'Contact Us', href: 'mailto:sboaho@gmail.com' },
                { label: 'WhatsApp', href: 'https://wa.me/447735310744' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Refund Policy', href: '/refund' },
                { label: 'Cookie Policy', href: '/cookies' },
              ],
            }).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold mb-4 text-foreground">{category}</h4>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {links.map((link) => (
                    <Link key={link.label} href={link.href} className="hover:text-indigo-500 transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 border-t border-border pt-8">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">Contact Us</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="https://wa.me/447735310744" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                  <MessageCircle size={14} /> WhatsApp: +44 7735 310744
                </a>
                <a href="tel:+233556674353" className="flex items-center gap-2 hover:text-sky-500 transition-colors">
                  <Phone size={14} /> Call: 055 667 4353
                </a>
                <a href="mailto:sboaho@gmail.com" className="flex items-center gap-2 hover:text-indigo-500 transition-colors">
                  <Mail size={14} /> sboaho@gmail.com
                </a>
                <span className="flex items-center gap-2">
                  <MapPin size={14} /> Accra, Ghana
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-4 lg:justify-end">
              {['Data Act 843', 'Encrypted', 'Daily Backups', 'Made in Ghana'].map((badge) => (
                <div key={badge} className="bg-white/5 border border-border/50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} EduPlatform. All rights reserved.
              <Link href="/super-admin/login" className="ml-2 opacity-0 hover:opacity-30 transition-all select-none" tabIndex={-1} aria-hidden="true">[admin]</Link>
            </p>
            <p className="mt-1">
              Hero background video: &ldquo;Playing&rdquo; by Salifu Wumpini Hussein, CC BY-SA 4.0, via Wikimedia Commons.
            </p>
            <p className="mt-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-white/5 px-2.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> v{APP_VERSION} · {APP_RELEASE_YEAR} Release
              </span>
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Watch the EduPlatform demo"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowVideo(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Close video"
            >
              <X size={16} />
            </button>
            <iframe
              src="https://www.youtube-nocookie.com/embed/MhqlAqyyMf4?rel=0"
              className="w-full h-full"
              title="EduPlatform demo video"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}