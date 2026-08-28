'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Mic, Globe, BookOpen, Shield, Zap, Star, Volume2 } from 'lucide-react';

const FEATURES = [
  { icon: BookOpen, title: 'Ghanaian Curriculum', desc: 'Follows Basic 1-9, JHS, and SHS curriculum with step-by-step explanations.' },
  { icon: Mic, title: 'Voice Input', desc: 'Speak in English, Twi, Ga, Ewe, Fante, Hausa, or Dagbani — Teacher Kofi understands.' },
  { icon: Volume2, title: 'Read Aloud', desc: 'Every answer can be read aloud — perfect for younger learners.' },
  { icon: Globe, title: '8 Languages', desc: 'Supports English, French, and 6 Ghanaian languages with code-switching.' },
  { icon: Shield, title: 'Safe & Age-Appropriate', desc: 'Built for children ages 4-16 with content filters and gentle corrections.' },
  { icon: Zap, title: 'Instant Answers', desc: 'Get help with Math, Science, English, and Social Studies in seconds.' },
];

const TESTIMONIALS = [
  { name: 'Ama K.', text: 'My daughter loves Teacher Kofi! She practices Twi and Math every evening.', role: 'Parent' },
  { name: 'Kwame D.', text: 'The voice feature is amazing. My son speaks Ewe and Teacher Kofi responds in Ewe!', role: 'Parent' },
  { name: 'Nana A.', text: 'Best AI tutor for Ghanaian students. The curriculum alignment is spot on.', role: 'Teacher' },
];

export default function TutorLanding() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-600 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star size={14} /> Built for Ghanaian students
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Meet <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Teacher Kofi</span>
            <br />Your AI Learning Companion
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A friendly AI tutor that helps kids ages 4-16 learn Math, English, Science, and Ghanaian languages — in English, Twi, Ga, Ewe, Fante, Hausa, and more.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/tutor/signup">
              <Button size="lg" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-base px-8">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/tutor/login">
              <Button size="lg" variant="outline" className="text-base px-8">Sign In</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Free plan includes 5 messages/day. No credit card required.</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Why Kids Love Teacher Kofi</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Designed specifically for the Ghanaian curriculum with multi-language support
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Free Account', desc: 'Sign up with your email in seconds. No school needed.' },
              { step: '2', title: 'Ask Anything', desc: 'Type or speak your question in your preferred language.' },
              { step: '3', title: 'Learn & Grow', desc: 'Get step-by-step explanations tailored to your level.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="size-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Loved by Parents & Teachers</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-violet-500 to-fuchsia-500 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of Ghanaian students learning with Teacher Kofi. Start free — upgrade anytime.
          </p>
          <Link href="/tutor/signup">
            <Button size="lg" className="bg-white text-violet-600 hover:bg-white/90 text-base px-8 font-semibold">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-violet-500" />
            <span className="text-sm font-semibold">Teacher Kofi</span>
            <span className="text-xs text-muted-foreground">by EduPlatform</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/tutor" className="hover:text-foreground">Home</Link>
            <Link href="/tutor/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/tutor/login" className="hover:text-foreground">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
