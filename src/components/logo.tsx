import { cn } from '@/lib/utils';
import Image from 'next/image';

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
      <Image
        src="/logo.jpeg"
        alt="EDUPLATFORM"
        width={iconSize}
        height={iconSize}
        className="shrink-0 rounded-lg"
      />

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
