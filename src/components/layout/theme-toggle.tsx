'use client';

import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  };
  return { dark, toggle };
}

export function ThemeToggle() {
  const { dark, toggle } = useDark();
  return (
    <button onClick={toggle} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export function ThemeToggleFloating() {
  const { dark, toggle } = useDark();
  return (
    <button onClick={toggle} className="fixed bottom-6 left-6 z-[9999] flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
