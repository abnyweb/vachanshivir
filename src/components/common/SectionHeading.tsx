import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  title: ReactNode;
  intro?: ReactNode;
  tone?: 'dark' | 'light' | 'white' | 'dark-bg';
  className?: string;
}

export function SectionHeading({ title, intro, tone = 'light', className }: Props) {
  const isWhite = tone === 'dark' || tone === 'white' || tone === 'dark-bg';
  return (
    <div className={cn('max-w-2xl', className)}>
      <h2 className={cn('text-3xl font-serif font-bold tracking-tight leading-tight sm:text-[2.6rem]', isWhite ? 'text-white' : 'text-slate-900')}>
        {title}
      </h2>
      {intro && (
        <p className={cn('mt-4 text-[15px] leading-relaxed', isWhite ? 'text-white/80' : 'text-slate-600')}>
          {intro}
        </p>
      )}
    </div>
  );
}
