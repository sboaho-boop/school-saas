import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, iconOnly, size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const fontSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-primary" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="32" height="32" rx="8" fill="url(#logo-primary)" />

        <path
          d="M10 18 L10 26 Q10 28 12 28 L24 28 Q26 28 26 26 L26 18"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M8 14 L18 8 L28 14"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M14 28 L14 22 Q14 20 18 20 Q22 20 22 22 L22 28"
          stroke="white"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M10 16 L10 22 L14 22"
          stroke="white"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />

        <circle cx="22" cy="12" r="1.5" fill="white" opacity="0.4" />
      </svg>

      {!iconOnly && (
        <span
          className={cn(
            'font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent',
            fontSize
          )}
        >
          EduPlatform
        </span>
      )}
    </div>
  );
}
