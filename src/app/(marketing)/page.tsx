'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import {
  ArrowRight,
  Check,
  Star,
  Users,
  School,
  Globe,
  Shield,
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  ClipboardCheck,
  BarChart3,
  ScanLine,
  UsersRound,
  QrCode,
  Bus,
  BadgeCheck,
  Receipt,
  Calendar,
  Zap,
  ChevronRight,
  Play,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Sparkles,
  Menu,
  X,
  GraduationCap,
  BookOpen,
  FileText,
  Wallet,
  Building2,
  Smartphone,
  Clock,
  Award,
  Bot,
  Mic,
  Send,
} from 'lucide-react';
import { useState, useCallback } from 'react';

const stats = [
  { label: 'Active Schools', value: '125K+', icon: School },
  { label: 'Students Managed', value: '2.3M+', icon: Users },
  { label: 'Client Reviews', value: '9,300+', icon: Star },
  { label: 'User Satisfaction', value: '99.8%', icon: BadgeCheck },
];

const clientLogos = [
  'Demo International', 'Riverside Academy', 'Gracehill Academy',
  'St. Mary\'s Int\'l', 'Sunrise Preparatory', 'EduTech Global',
  'Learn Africa', 'Bright Future Schools', 'Elite Education',
  'Pioneer Academy', 'Heritage School', 'Summit Institute',
  'Meridian College', 'Apex Learning', 'Nova Academy', 'Prime Education',
];

const whyUs = [
  {
    icon: Sparkles,
    title: 'Innovation at our core',
    description: 'EDUPLATFORM SOFTWARE SERVICES stands as the vanguard of school-management solutions, consistently pioneering next-generation technologies that redefine educational administration worldwide.',
  },
  {
    icon: LayoutDashboard,
    title: 'Simplifying complexity',
    description: 'Infographics & animations distill complex academic data into intuitive visuals—transforming every report and result into an easily grasped, optimized experience.',
  },
  {
    icon: TrendingUp,
    title: 'Empowering institutional growth',
    description: 'Automated workflows, real-time analytics, and streamlined communication free educators to focus on teaching while driving enrollment, retention, and financial health.',
  },
];

const offeringFeatures = [
  {
    icon: UsersRound,
    title: 'Multi-user access',
    description: 'Dedicated portals for admin, teachers, students, and parents.',
    image: 'layout-dashboard',
  },
  {
    icon: MessageSquare,
    title: 'Stay Connected',
    description: 'Built-in real-time Chat and secure file sharing enable seamless team communication.',
    image: 'message-square',
  },
  {
    icon: BarChart3,
    title: 'Comprehensive Reports',
    description: 'AI-powered performance reports instantly pinpoint every learner\'s strengths, gaps, and growth trajectory.',
    image: 'bar-chart-3',
  },
  {
    icon: Globe,
    title: 'Communication tools',
    description: 'Send unlimited SMS and WhatsApp alerts instantly.',
    image: 'globe',
  },
  {
    icon: GraduationCap,
    title: 'Live Classes',
    description: 'Conduct free live classes with EDUPLATFORM SOFTWARE SERVICES. No third-party apps needed!',
    image: 'graduation-cap',
  },
];

const allFeatures = [
  { icon: Building2, title: 'Institute Profile', desc: 'Customize your institution\'s details, logo, and branding.' },
  { icon: Receipt, title: 'Fee Structure', desc: 'Define and manage fee categories and discounts effortlessly.' },
  { icon: Globe, title: 'Theme & Language', desc: 'Personalize the dashboard with themes and multilingual support.' },
  { icon: BookOpen, title: 'Classes & Subjects', desc: 'Create and assign classes, subjects, and chapters with ease.' },
  { icon: Users, title: 'Admissions', desc: 'Simplify student enrollment with automated credential generation.' },
  { icon: Calendar, title: 'Timetable Management', desc: 'Design schedules for classes and teachers effortlessly.' },
  { icon: Wallet, title: 'Accounts', desc: 'Manage income, expenses, and financial tracking transparently.' },
  { icon: ClipboardCheck, title: 'Exams & Tests', desc: 'Create exams, manage marks, and generate result cards.' },
  { icon: FileText, title: 'Question Papers', desc: 'Build question banks and generate custom question papers.' },
  { icon: BadgeCheck, title: 'ID Cards', desc: 'Generate and print Student & Staff ID cards in bulk.' },
  { icon: BookOpen, title: 'Homework', desc: 'Assign and track homework and assignments to keep students engaged.' },
  { icon: ScanLine, title: 'Card Attendance', desc: 'Tap-card technology for quick attendance marking.' },
  { icon: UsersRound, title: 'Employee Management', desc: 'Add staff, issue letters, process salary, and track logins.' },
  { icon: CreditCard, title: 'Fee Management', desc: 'Generate invoices, collect fees, and track defaulters.' },
  { icon: Smartphone, title: 'Online Store & POS', desc: 'Sell uniforms, books, and supplies with integrated POS.' },
  { icon: Award, title: 'Certificates & Reports', desc: 'Design and issue certificates using customizable templates.' },
  { icon: BarChart3, title: 'Behavior & Skills', desc: 'Monitor and report on affective and psychomotor domains.' },
  { icon: Shield, title: 'Data Protection', desc: 'GDPR & Data Act 843 compliant with full audit trails.' },
];

const testimonials = [
  {
    name: 'Maheshwari Lall',
    role: 'School Head',
    school: 'Redhill School, SA',
    quote: 'EDUPLATFORM SOFTWARE SERVICES has transformed our administrative processes, making communication and resource management seamless. The platform\'s user-friendly interface has been a game-changer for our staff and parents.',
  },
  {
    name: 'Jane Lunnon',
    role: 'School Head',
    school: 'Alleyn\'s School, UK',
    quote: 'EDUPLATFORM SOFTWARE SERVICES\'s robust features have streamlined our school operations, from attendance tracking to parent engagement. It\'s reliable, intuitive, and has significantly enhanced our efficiency.',
  },
  {
    name: 'Jamie Flegg',
    role: 'Class Teacher',
    school: 'Wellington College, TH',
    quote: 'Using EDUPLATFORM SOFTWARE SERVICES has made classroom management so much easier, with instant access to student data and teaching resources. It\'s a fantastic tool that saves time and boosts productivity.',
  },
];

const footerLinks = {
  Information: ['Products', 'Plans & Pricing', 'Services', 'Features', 'Affiliate Program', 'Sitemap'],
  Support: ['Knowledge Base', 'Video Tutorials', 'Our Blogs', 'Changelogs', 'Contact Us'],
  Legal: ['Terms of Service', 'Privacy Policy', 'Data Protection', 'Cookie Policy'],
};

function TrendingUp(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function AnimatedGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
    </div>
  );
}

function StatsCounter({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 mb-3">
        <Icon size={24} />
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </motion.div>
  );
}

function LogoCarousel() {
  return (
    <div className="relative overflow-hidden py-8">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
      <motion.div
        className="flex gap-12 items-center"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {[...clientLogos, ...clientLogos].map((name, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-sm font-medium whitespace-nowrap shrink-0"
          >
            <School size={16} className="text-indigo-400" />
            {name}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function TestimonialCard({ t, index }: { t: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border border-border/50 rounded-xl p-6 shadow-sm"
    >
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground italic mb-4">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {t.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.role} | {t.school}</p>
        </div>
      </div>
    </motion.div>
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
      <Link href="#" className="block">
        <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-start gap-3">
            <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ${c}`}>
              <Icon size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold group-hover:text-indigo-500 transition-colors">{title}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);
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
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">Pricing</Link>
            <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">Testimonials</Link>
            <Link href="/download" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" />Download App</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">Login</Link>
            <Link href="/parent/login" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">Parents</Link>
            <Link href="/student/login" className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">Students</Link>
            <Link href="/tutor" className="text-sm text-muted-foreground hover:text-fuchsia-400 transition-colors flex items-center gap-1"><Bot className="h-3.5 w-3.5" />Teacher Kofi</Link>
            <LanguageSwitcher />
            <Link href="/register">
              <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                Sign Up Free
              </Button>
            </Link>
          </div>
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3"
          >
            <Link href="#features" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Features</Link>
            <Link href="#pricing" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Pricing</Link>
            <Link href="#testimonials" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Testimonials</Link>
            <Link href="/download" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Download App</Link>
            <Link href="/student/login" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Students</Link>
            <Link href="/tutor" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Teacher Kofi</Link>
            <Link href="/login" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileMenu(false)}>Login</Link>
            <Link href="/register" onClick={() => setMobileMenu(false)}>
              <Button className="w-full bg-indigo-600 text-white mt-2">Sign Up Free</Button>
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-amber-950">
          <AnimatedGradient />
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
          }} />
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
                    <Award size={14} className="text-amber-400" />
                    <span>#1 Globally Ranked</span>
                    <span className="text-white/40">|</span>
                    <BadgeCheck size={14} className="text-emerald-400" />
                    <span>Verified</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                    Free Online School
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400">
                      Management Software
                    </span>
                  </h1>

                  <p className="text-lg text-white/70 max-w-lg">
                    Manage your school, college, or any educational institution seamlessly
                    with EDUPLATFORM SOFTWARE SERVICES — completely free options available.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Link href="/register">
                      <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-xl shadow-white/20 text-base px-8">
                        Get Started Free
                        <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </Link>
                    <Link href="/download">
                      <Button size="lg" variant="outline" className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm text-base px-6">
                        <Smartphone size={18} className="mr-2" />
                        Download App
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm text-base px-6" onClick={() => setShowVideo(true)}>
                      <Play size={18} className="mr-2" />
                      Watch Demo
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <div className="flex -space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                          {['M', 'J', 'A', 'S'][i]}
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-white/10 flex items-center justify-center text-white text-xs">+</div>
                    </div>
                    <span>Trusted by 125,000+ schools worldwide</span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-amber-500/20 rounded-2xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                  {/* Dashboard screenshot mockup */}
                  <div className="bg-slate-800/50 px-4 py-3 border-b border-white/5 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
                    <div className="ml-3 text-xs text-white/30 font-mono">EDUPLATFORM SOFTWARE SERVICES Dashboard</div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {['Total Students', 'Revenue', 'Attendance'].map((label, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                          <div className="text-[10px] text-white/40">{label}</div>
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
                        <div className="text-[10px] text-white/40 mt-1">5 new enrollments today</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Wallet size={12} /> Fee Collections
                        </div>
                        <div className="text-[10px] text-white/40 mt-1">GHS 12,450 collected</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 bg-card border border-border/50 rounded-xl p-3 shadow-lg hidden lg:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">2.3M+</div>
                      <div className="text-[10px] text-muted-foreground">Students Managed</div>
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
                    <span className="text-xs font-medium">4.6 Rating</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-20 z-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 rounded-2xl p-8 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s) => (
                <StatsCounter key={s.label} {...s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Join <span className="font-semibold text-foreground">125,000+</span> schools worldwide
          </p>
          <LogoCarousel />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] via-transparent to-purple-500/[0.02]" />
        <div className="container mx-auto px-4 lg:px-6 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold">EDUPLATFORM SOFTWARE SERVICES is a revolution in education management</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whyUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-4 mx-auto">
                  <item.icon size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stands Out */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-indigo-950 relative overflow-hidden">
        <AnimatedGradient />
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  Why EDUPLATFORM SOFTWARE SERVICES Stands Out
                </h2>
                <p className="text-white/60 mb-8">
                  Fortified by GDPR, CCPA, and data protection compliance, EDUPLATFORM SOFTWARE SERVICES encrypts
                  every byte across secure data centers for 99.9% uptime and instant, limitless
                  scale — your data is safer here than on-premise.
                </p>
                <ul className="space-y-4">
                  {[
                    'GDPR & Data Act 843 compliant with full audit trails',
                    'AES-256 encryption at rest & in transit',
                    '99.9% uptime SLA + daily off-site backups',
                    'Role-based access control for staff, teachers, and parents',
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
                <Link href="/register">
                  <Button className="mt-8 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                    Sign Up Now
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-800/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <Shield size={48} className="text-indigo-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Enterprise-Grade Security</h3>
                <p className="text-white/60 text-sm">
                  Your data is protected with bank-level encryption and compliance
                  with international data protection standards.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {['ISO 27001', 'GDPR', 'CCPA', 'Act 843'].map((badge) => (
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

      {/* What We Offering */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 mb-4">
              What We Offer
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Everything your institute needs — delivered free, fast, and future-proof
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {offeringFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                  <f.icon size={24} />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Features */}
      <section className="py-24 bg-gradient-to-b from-indigo-500/[0.02] via-transparent to-amber-500/[0.02]">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 mb-4">
              Single Stop Solution
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Comprehensive Features for Every Need
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {allFeatures.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Teacher Kofi */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-violet-950 via-fuchsia-950 to-purple-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 mb-4 border border-white/10">
                <Bot size={14} className="mr-1 text-fuchsia-400" /> Meet Teacher Kofi
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Your AI tutor now follows students{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">home</span>
              </h2>
              <p className="text-white/60 mb-8 max-w-lg">
                Teacher Kofi helps students learn anytime, anywhere — Math, English, Science, and Ghanaian
                languages with voice support. Start free, then subscribe for unlimited learning.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  '100+ topics from the Ghanaian curriculum',
                  'Voice chat in Twi, Ga, Ewe, Fante, Hausa & Dagbani',
                  'Read-aloud answers for every response',
                  'Free plan with 5 messages per day',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/tutor">
                  <Button size="lg" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 font-semibold shadow-xl shadow-fuchsia-500/20 text-base px-8">
                    <Bot size={18} className="mr-2" /> Try Teacher Kofi Free
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
              <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl p-6">
                <div className="bg-slate-800/50 px-4 py-3 border-b border-white/5 flex items-center gap-2 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                  <div className="w-3 h-3 rounded-full bg-red-400/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
                  <div className="ml-3 text-xs text-white/30 font-mono">Teacher Kofi — Student Chat</div>
                </div>
                <div className="space-y-3">
                  {[
                    { role: 'user', text: 'Help me with fractions 😩' },
                    { role: 'kofi', text: 'Sure! 🎉 Imagine a pizza cut into 8 slices. If you eat 2, you ate 2/8 = 1/4 of it. Great start!' },
                    { role: 'kofi', text: 'Want a quick practice quiz on that?' },
                  ].map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          m.role === 'user'
                            ? 'bg-white/10 text-white rounded-br-md'
                            : 'bg-gradient-to-r from-violet-500/90 to-fuchsia-500/90 text-white rounded-bl-md'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                  <Mic className="h-4 w-4 text-white/40" />
                  <span className="text-xs text-white/40 flex-1">Talk in English, Twi or Ga...</span>
                  <Send className="h-4 w-4 text-fuchsia-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-amber-500/5" />
        <div className="container mx-auto px-4 lg:px-6 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 mb-4">
              Simple Plans
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold">Transparent Pricing</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Start free. Upgrade when you need more. No hidden fees.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: 'Free', desc: 'Perfect for small schools getting started.', features: ['Up to 100 students', 'Basic dashboard', 'Student management', 'Attendance tracking', 'Email support'], cta: 'Get Started', popular: false },
              { name: 'Professional', price: '$49', period: '/month', desc: 'For growing schools that need more features.', features: ['Up to 1,000 students', 'Full dashboard & analytics', 'Fee management', 'Task management', 'Custom branding', 'Priority support'], cta: 'Start Free Trial', popular: true },
              { name: 'Enterprise', price: 'Custom', desc: 'For school chains and large institutions.', features: ['Unlimited students', 'Multi-campus support', 'API access', 'Dedicated manager', 'Custom integrations', 'SLA guarantee'], cta: 'Contact Sales', popular: false },
            ].map((plan, i) => {
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
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500 mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold">What Our Clients Say About Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.name} t={t} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="#" className="text-sm text-indigo-500 hover:text-indigo-400 inline-flex items-center gap-1">
              Read all verified reviews
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600">
          <AnimatedGradient />
        </div>
        <div className="container mx-auto px-4 lg:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Institution?
            </h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8">
              With EDUPLATFORM SOFTWARE SERVICES, you&apos;re not just managing a school — you&apos;re building
              a brighter future for education.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-xl text-base px-8">
                Get Started Today
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-to-b from-background to-indigo-500/5 pt-16 pb-8">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 mb-12">
            <div className="lg:col-span-2">
              <Logo />
              <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                EDUPLATFORM SOFTWARE SERVICES — The free online school management software, empowering
                schools worldwide to manage everything digitally with ease and excellence.
              </p>
              <div className="flex gap-3 mt-4">
                {[MessageCircle, Phone, Mail].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-white/5 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/50 transition-all"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold mb-4 text-foreground">{category}</h4>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {links.map((link) => (
                    <Link key={link} href="#" className="hover:text-indigo-500 transition-colors">
                      {link}
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
              {['Apple Store', 'Capterra 4.6', 'GDPR', 'Forbes', 'Award 2024', 'QS Education'].map((badge) => (
                <div key={badge} className="bg-white/5 border border-border/50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} EDUPLATFORM SOFTWARE SERVICES. All rights reserved.
              <Link href="/super-admin/login" className="ml-2 opacity-0 hover:opacity-30 transition-all select-none" tabIndex={-1} aria-hidden="true">[admin]</Link>
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
            >
              <X size={16} />
            </button>
            <iframe
              src="https://www.youtube.com/embed/MhqlAqyyMf4?rel=0"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
