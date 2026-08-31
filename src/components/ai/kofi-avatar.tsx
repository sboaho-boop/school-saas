'use client';

import { cn } from '@/lib/utils';

interface KofiAvatarProps {
  size?: number;
  className?: string;
  /** Optional label title for the avatar (e.g. screen readers). */
  title?: string;
}

export function KofiAvatar({ size = 20, className, title }: KofiAvatarProps) {
  return (
    <span
      role="img"
      aria-label={title || 'Teacher Kofi'}
      title={title || 'Teacher Kofi'}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full select-none',
        'bg-gradient-to-br from-[#f7d39a] via-[#e8b06a] to-[#c98a3d]',
        'ring-2 ring-amber-200/70 shadow-inner',
        className
      )}
      style={{ width: size * 1.9, height: size * 1.9, fontSize: size * 0.95 }}
    >
      <span aria-hidden="true" style={{ lineHeight: 1 }}>
        👨‍🏫
      </span>
    </span>
  );
}
