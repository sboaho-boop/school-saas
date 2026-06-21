'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  LayoutDashboard, Users, CreditCard, QrCode, ScanLine,
  UsersRound, BarChart3, Shield, Smartphone, Globe, Check,
  ArrowRight, School, Bus, UtensilsCrossed, Printer,
} from 'lucide-react';

interface Scene {
  id: string;
  title: string;
  subtitle: string;
  narration: string;
  duration: number;
  icon: any;
  color: string;
  render: () => React.ReactNode;
}

const PULSE = 'animate-pulse shadow-lg shadow-indigo-500/30';

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setN((p) => Math.min(p + Math.ceil(to / 30), to)), 40);
    return () => clearInterval(interval);
  }, [to]);
  return <>{n}{suffix}</>;
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function CardGrid({ items }: { items: { label: string; sub: string; icon: any }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
      {items.map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="bg-white/10 backdrop-blur rounded-xl p-3 text-center"
        >
          <item.icon size={20} className="mx-auto mb-1 text-indigo-300" />
          <div className="text-xs font-medium text-white">{item.label}</div>
          <div className="text-[10px] text-white/60">{item.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}

const scenes: Scene[] = [
  {
    id: 'problem',
    title: 'Too Many Moving Parts?',
    subtitle: 'School management can be overwhelming',
    narration: 'Running a school is rewarding — but the paperwork, attendance tracking, fee collection, and parent calls can feel like managing a thousand things at once.',
    duration: 7,
    icon: School,
    color: 'from-rose-500 to-pink-600',
    render: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          {[
            { label: 'Paper Registers', sub: 'Lost & damaged' },
            { label: 'Cash Payments', sub: 'Hard to track' },
            { label: 'Manual Grading', sub: 'Takes days' },
            { label: 'Parent Queries', sub: 'No visibility' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }}
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
            >
              <div className="text-sm font-medium text-white">{item.label}</div>
              <div className="text-xs text-rose-300 mt-1">{item.sub}</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="text-center text-white/60 text-sm"
        >
          There has to be a better way.
        </motion.div>
      </div>
    ),
  },
  {
    id: 'dashboard',
    title: 'Real-Time Dashboard',
    subtitle: 'Know your school in seconds',
    narration: 'Start your day with a beautiful dashboard showing attendance rates, fee collections, and student performance — all at a glance.',
    duration: 7,
    icon: LayoutDashboard,
    color: 'from-indigo-500 to-purple-600',
    render: () => (
      <div className="space-y-3 w-full max-w-xs mx-auto">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Students', value: 247, color: 'bg-emerald-400' },
            { label: 'Staff', value: 28, color: 'bg-sky-400' },
            { label: 'Fees', value: 89, suffix: '%', color: 'bg-amber-400' },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur rounded-xl p-2 text-center"
            >
              <div className="text-xl font-bold text-white"><Counter to={stat.value} suffix={stat.suffix || ''} /></div>
              <div className="text-[10px] text-white/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="bg-white/10 backdrop-blur rounded-xl p-3"
        >
          <div className="flex justify-between text-xs text-white/70 mb-2"><span>Attendance Today</span><span>94%</span></div>
          <ProgressBar value={94} max={100} color="bg-emerald-400" />
          <div className="flex justify-between text-xs text-white/70 mt-2"><span>Fees Collected</span><span>GHS 12,450</span></div>
          <ProgressBar value={78} max={100} color="bg-amber-400" />
        </motion.div>
      </div>
    ),
  },
  {
    id: 'roles',
    title: 'Role-Based Access',
    subtitle: 'Everyone sees what they need',
    narration: 'Headteachers, admins, teachers, accountants — each role gets the right level of access. Teachers see only their class. Accountants see finances. Nothing more, nothing less.',
    duration: 7,
    icon: Users,
    color: 'from-emerald-500 to-teal-600',
    render: () => (
      <CardGrid items={[
        { label: 'Headteacher', sub: 'Full access', icon: Shield },
        { label: 'Admin', sub: 'Full access', icon: Shield },
        { label: 'Teacher', sub: 'Their class only', icon: Users },
        { label: 'Accountant', sub: 'Finance only', icon: BarChart3 },
      ]} />
    ),
  },
  {
    id: 'nfc',
    title: 'NFC Card & Wallet',
    subtitle: 'Tap for everything',
    narration: 'Every student gets an NFC card at admission. Tap for attendance at the gate. Tap for canteen, transport, or printing. Payments are instant. Parents see every transaction in real time.',
    duration: 8,
    icon: CreditCard,
    color: 'from-amber-500 to-orange-600',
    render: () => (
      <div className="space-y-3 max-w-xs mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white text-center mx-auto w-48 shadow-xl"
        >
          <div className="text-[8px] uppercase tracking-widest opacity-70">Student Card</div>
          <div className="text-lg font-bold mt-1">GHS 25.00</div>
          <div className="text-xs opacity-80 mt-1">•••• 4582</div>
        </motion.div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: ScanLine, label: 'Gate' },
            { icon: UtensilsCrossed, label: 'Canteen' },
            { icon: Bus, label: 'Transport' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
              className="bg-white/10 backdrop-blur rounded-xl p-2 text-center"
            >
              <item.icon size={18} className="mx-auto text-emerald-300" />
              <div className="text-[10px] text-white/80 mt-1">{item.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-2 text-center text-xs text-emerald-300"
        >
          ✓ GHS 5.00 deducted — Canteen
        </motion.div>
      </div>
    ),
  },
  {
    id: 'parent',
    title: 'Parent Portal',
    subtitle: 'Parents stay connected',
    narration: 'Parents log in with just their email to see attendance history, exam scores, and wallet balance. They can top up in seconds — no more cash envelopes.',
    duration: 7,
    icon: UsersRound,
    color: 'from-sky-500 to-blue-600',
    render: () => (
      <div className="space-y-3 max-w-xs mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur rounded-xl p-3 text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Parent Dashboard</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">Online</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">AK</div>
            <div>
              <div className="text-sm font-medium text-white">Abena Kwarteng</div>
              <div className="text-[10px] text-white/50">Class 1A</div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/70 mt-2">
            <span>Balance</span>
            <span className="text-emerald-300 font-bold">GHS 35.00</span>
          </div>
          <ProgressBar value={35} max={100} color="bg-emerald-400" />
          <div className="text-[10px] text-white/40 text-center mt-1">Tap to top up</div>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'qr',
    title: 'QR Answer Sheets',
    subtitle: 'Grade in seconds, not days',
    narration: 'Print answer sheets with QR codes for each student. Scan with any phone, enter the score, and save. The system auto-advances to the next student.',
    duration: 7,
    icon: QrCode,
    color: 'from-purple-500 to-violet-600',
    render: () => (
      <div className="space-y-3 max-w-xs mx-auto">
        <div className="flex items-center justify-center gap-3">
          <motion.div initial={{ opacity: 0, rotate: -10 }} animate={{ opacity: 1, rotate: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-2 shadow-lg"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded flex items-center justify-center">
              <div className="grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
            className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-2"
          >
            <div className="text-xs text-white font-medium">Score: 85%</div>
            <div className="text-[10px] text-white/60">Student: 3 of 28</div>
            <div className="text-[10px] text-emerald-300 mt-1">✓ Saved</div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="text-center text-xs text-white/50"
        >
          Print → Scan → Score → Auto-advance
        </motion.div>
      </div>
    ),
  },
  {
    id: 'terminal',
    title: 'Tablet Tap Terminal',
    subtitle: 'Turn any tablet into a payment station',
    narration: 'Mount a tablet at the gate or canteen, and the tap terminal turns it into a full-service attendance and payment station. No expensive hardware needed.',
    duration: 7,
    icon: Smartphone,
    color: 'from-cyan-500 to-teal-600',
    render: () => (
      <div className="space-y-3 max-w-xs mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-2xl p-3 border border-gray-700 shadow-xl mx-auto w-56"
        >
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { icon: ScanLine, label: 'Gate', color: 'bg-emerald-500' },
              { icon: UtensilsCrossed, label: 'Canteen', color: 'bg-orange-500' },
              { icon: Bus, label: 'Transport', color: 'bg-sky-500' },
            ].map((btn) => (
              <div key={btn.label} className={`${btn.color} rounded-lg p-1.5 text-center text-white`}>
                <btn.icon size={14} className="mx-auto" />
                <div className="text-[8px] mt-0.5">{btn.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 bg-white/10 rounded-lg p-2 text-center">
            <div className="text-[10px] text-white/50">Card UID</div>
            <div className="text-sm font-mono text-white tracking-wider">•••• 4582</div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="mt-2 bg-emerald-500/20 rounded-lg p-1 text-center text-[10px] text-emerald-300"
          >
            ✓ GHS 5.00 — Canteen
          </motion.div>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'reports',
    title: 'Reports & Audit Trail',
    subtitle: 'Full visibility. Full accountability.',
    narration: 'Generate detailed reports for academics, finance, and attendance. Every action is logged — who did what and when. Because in a well-run school, transparency matters.',
    duration: 7,
    icon: Shield,
    color: 'from-slate-600 to-slate-800',
    render: () => (
      <div className="space-y-2 max-w-xs mx-auto w-full">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Academic', value: '87% avg', color: 'text-emerald-300' },
            { label: 'Attendance', value: '94%', color: 'text-sky-300' },
            { label: 'Fees Collected', value: 'GHS 12.4K', color: 'text-amber-300' },
            { label: 'Active Students', value: '247', color: 'text-indigo-300' },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-2 text-center"
            >
              <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[9px] text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-lg p-2 max-h-16 overflow-hidden"
        >
          <div className="text-[9px] text-white/40 font-mono">headteacher@school.com created Student "Kwame" — 10:32 AM</div>
          <div className="text-[9px] text-white/40 font-mono">admin@school.com updated Fee Record — 11:15 AM</div>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'cta',
    title: 'Start Free Today',
    subtitle: 'Built for Africa. Ready for the World.',
    narration: 'Start free with up to 30 students. Upgrade as you grow. Questions? We are one WhatsApp away.',
    duration: 6,
    icon: Globe,
    color: 'from-indigo-600 to-purple-600',
    render: () => (
      <div className="space-y-4 text-center">
        <div className="flex justify-center gap-4">
          {[
            { plan: 'Free', students: '30', staff: '10' },
            { plan: 'Professional', students: '200', staff: '50' },
            { plan: 'Enterprise', students: 'Unlimited', staff: 'Unlimited' },
          ].map((p, i) => (
            <motion.div key={p.plan} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
              className="bg-white/10 backdrop-blur rounded-xl p-3 text-center flex-1"
            >
              <div className="text-xs font-bold text-white">{p.plan}</div>
              <div className="text-lg font-bold text-indigo-300 mt-1">{p.students}</div>
              <div className="text-[9px] text-white/50">students</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="flex justify-center gap-3"
        >
          <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1.5 rounded-full">
            <MessageCircle size={12} /> WhatsApp Us
          </div>
          <div className="flex items-center gap-1.5 bg-sky-500/20 text-sky-300 text-xs px-3 py-1.5 rounded-full">
            <Phone size={12} /> Call Us
          </div>
        </motion.div>
      </div>
    ),
  },
];

import { MessageCircle, Phone } from 'lucide-react';

export default function ExplainerPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scene = scenes[currentScene];
  const isLast = currentScene === scenes.length - 1;

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let i = 0;
    const speakNext = () => {
      if (i >= sentences.length) return;
      const utterance = new SpeechSynthesisUtterance(sentences[i].trim());
      utterance.rate = 0.75;
      utterance.pitch = 1.05;
      utterance.volume = muted ? 0 : 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang.startsWith('en-GB')) || voices.find((v) => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => { i++; setTimeout(speakNext, 300); };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  }, [muted]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= scenes.length) return;
    setCurrentScene(idx);
    setProgress(0);
    progressRef.current = 0;
  }, []);

  const next = useCallback(() => {
    if (isLast) { setIsPlaying(false); return; }
    goTo(currentScene + 1);
  }, [currentScene, isLast, goTo]);

  const prev = useCallback(() => goTo(currentScene - 1), [currentScene, goTo]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = 50;
    const totalTicks = (scene.duration * 1000) / interval;
    timerRef.current = setInterval(() => {
      progressRef.current += 1;
      const pct = Math.min((progressRef.current / totalTicks) * 100, 100);
      setProgress(pct);
      if (progressRef.current >= totalTicks) {
        clearInterval(timerRef.current!);
        next();
      }
    }, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentScene, isPlaying, scene.duration, next]);

  useEffect(() => {
    if (isPlaying && !muted) {
      speak(scene.narration);
    } else {
      stopSpeech();
    }
  }, [currentScene, isPlaying, muted, scene.narration, speak, stopSpeech]);

  useEffect(() => {
    if (!muted && utteranceRef.current) {
      utteranceRef.current.volume = 1;
    } else if (utteranceRef.current) {
      utteranceRef.current.volume = 0;
    }
  }, [muted]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className={`w-full max-w-lg bg-gradient-to-br ${scene.color} rounded-3xl shadow-2xl overflow-hidden relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono text-white/50">
              {String(currentScene + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-2">
              <scene.icon size={14} className="text-white/60" />
              <span className="text-xs text-white/50">{scene.title}</span>
            </div>
          </div>

          <motion.div key={scene.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h2 className="text-xl font-bold text-white mb-1">{scene.title}</h2>
            <p className="text-xs text-white/60 mb-4">{scene.subtitle}</p>
            {scene.render()}
          </motion.div>

          <div className="mt-4 bg-white/10 rounded-full h-1 overflow-hidden">
            <motion.div className="h-full bg-white/60 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <button onClick={() => { setIsPlaying(false); prev(); }} disabled={currentScene === 0}
          className="text-white/40 hover:text-white/80 disabled:opacity-20 transition-colors"
        ><SkipBack size={18} /></button>

        <button onClick={() => { setMuted(!muted); }}
          className="text-white/40 hover:text-white/80 transition-colors"
        >{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>

        <button onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all shadow-lg"
        >{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>

        <span className="text-xs text-white/40 font-mono w-12 text-left">{scene.duration}s</span>

        <button onClick={() => { setIsPlaying(false); next(); }} disabled={isLast}
          className="text-white/40 hover:text-white/80 disabled:opacity-20 transition-colors"
        ><SkipForward size={18} /></button>
      </div>

      <div className="mt-3 text-center max-w-md">
        <p className="text-xs text-white/30 italic leading-relaxed">{scene.narration}</p>
      </div>

      <div className="mt-4 flex gap-1.5">
        {scenes.map((s, i) => (
          <button key={s.id} onClick={() => { setIsPlaying(false); goTo(i); }}
            className={`h-1.5 rounded-full transition-all ${i === currentScene ? 'w-6 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>

      <a href="/" className="mt-4 text-[10px] text-white/20 hover:text-white/40 transition-colors underline">
        Back to Home
      </a>
    </div>
  );
}
