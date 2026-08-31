'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Volume2, VolumeX, Loader2, Link2, PlayCircle } from 'lucide-react';
import { KofiChalk } from './kofi-chalk';
import { mediaSrc } from '@/stores/tutor-chat';
import type { MediaBlock } from '@/stores/tutor-chat';

interface BoardMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  media?: MediaBlock[];
}

interface ClassroomBoardProps {
  messages: BoardMessage[];
  loading: boolean;
  speakingIdx: number | null;
  onToggleSpeak: (idx: number, text: string) => void;
}

function ChalkMedia({ media }: { media?: MediaBlock[] }) {
  if (!media || !media.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {media.map((m, i) => {
        if (m.type === 'image') {
          const src = m.data ? mediaSrc(m.data) : undefined;
          if (!src) return null;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={m.keywords || 'Lesson picture'}
              className="max-w-full rounded-lg border-2 border-white/20 shadow-lg max-h-64"
            />
          );
        }
        if (m.type === 'link' && m.url) {
          return (
            <a
              key={i}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="chalk-btn inline-flex items-center gap-2 px-3 py-2 text-xs max-w-full"
            >
              <PlayCircle size={16} className="chalk-color-pink shrink-0" />
              <span className="truncate">{m.label || 'Watch a lesson video'}</span>
              <Link2 size={14} className="chalk-color-blue shrink-0" />
            </a>
          );
        }
        return null;
      })}
    </div>
  );
}

export function ClassroomBoard({ messages, loading, speakingIdx, onToggleSpeak }: ClassroomBoardProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Teacher name on the top chalkboard ledge */}
      <div className="text-center py-1 select-none">
        <span className="chalk-heading text-xl text-emerald-50/90">Teacher Kofi&apos;s Classroom</span>
      </div>

      <div className="chalk-frame flex-1 min-h-0 rounded-2xl">
        <div className="chalk-board h-full rounded-lg overflow-y-auto overflow-x-hidden relative">
          <div className="chalk-dust" aria-hidden />
          <div className="relative z-10 p-4 space-y-5 min-h-full flex flex-col">
            <AnimatePresence>
              {messages.map((msg, i) =>
                msg.role === 'assistant' ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="chalk-text text-[15px] leading-relaxed"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0 size-9 rounded-full bg-emerald-900/60 border border-yellow-200/30 flex items-center justify-center shadow-inner">
                        <Bot size={16} className="text-yellow-100" />
                      </div>
                      <div className="min-w-0">
                        <span className="chalk-color-yellow chalk-underline text-sm">Teacher Kofi:</span>
                        <div className="mt-1">
                          <KofiChalk content={msg.content} />
                        </div>
                        <ChalkMedia media={msg.media} />
                        {msg.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaSrc(msg.image)}
                            alt="Teacher Kofi drawing"
                            className="mt-2 w-full max-w-sm rounded-lg border border-white/20 shadow-lg"
                          />
                        )}
                        <button
                          onClick={() => onToggleSpeak(i, msg.content)}
                          className="chalk-btn mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs"
                        >
                          {speakingIdx === i ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          {speakingIdx === i ? 'Stop' : 'Read aloud'}
                        </button>
                      </div>
                    </div>
                    <div className="chalk-line my-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, rotate: -1 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-auto max-w-[85%]"
                  >
                    <div className="bg-amber-50 text-amber-900 rounded-md p-2.5 shadow-md shadow-black/30 rotate-[0.5deg] border border-amber-200/60"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 22px, rgba(180,150,60,0.18) 22px 23px)',
                      }}>
                      <div className="flex items-start gap-2">
                        <User size={14} className="mt-0.5 text-amber-700 shrink-0" />
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </div>
                      </div>
                      {msg.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaSrc(msg.image)}
                          alt="Pinned photo"
                          className="mt-2 w-full max-w-xs rounded border border-amber-300/40"
                        />
                      )}
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chalk-text flex items-center gap-2 text-sm">
                <span className="chalk-color-green">Kofi is writing&hellip;</span>
                <div className="flex gap-1.5">
                  <span className="size-2 rounded-full bg-yellow-200 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="size-2 rounded-full bg-yellow-200 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="size-2 rounded-full bg-yellow-200 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}

            {/* chalk tray hint */}
            <div className="mt-auto pt-4">
              <div className="chalk-tray rounded-md px-4 py-2 flex items-center justify-between text-[11px] text-emerald-100/70">
                <span>✏️ Speak or type to learn on the board</span>
                {loading && <Loader2 size={13} className="animate-spin" />}
              </div>
            </div>
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
