import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, iconOnly, size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const fontSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';
  const subSize = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

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

        <rect x="1" y="1" width="34" height="34" rx="9" fill="url(#logo-primary)" />

        {/* Open book base */}
        <path d="M8 16 L18 11 L28 16" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 16 L8 24 Q8 25.5 9 26 L18 22 L27 26 Q28 25.5 28 24 L28 16" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 11 L18 22" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" />

        {/* Graduation cap on top */}
        <path d="M13 14 L18 11 L23 14 L18 17 Z" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 14 L13 17 Q15.5 18.5 18 17" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Code bracket < / > on right page */}
        <path d="M21 17 L23 19 L21 21" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <path d="M15 17 L13 19 L15 21" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      </svg>

      {!iconOnly && (
        <div className="flex flex-col leading-tight">
          <span className={cn('font-extrabold tracking-wide', fontSize)}>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              EDUPLATFORM
            </span>
          </span>
          <span className={cn('font-medium text-muted-foreground tracking-wider', subSize)}>
            SOFTWARE SERVICES
          </span>
        </div>
      )}
    </div>
  );
}
