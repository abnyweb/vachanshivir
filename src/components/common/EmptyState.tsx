import type { ReactNode } from 'react';

interface Props {
  title: string;
  description: string;
  action?: ReactNode;
  tone?: 'dark' | 'light';
}

export function EmptyState({ title, description, action, tone = 'light' }: Props) {
  const isWhite = tone === 'dark';
  return (
    <div
      className={
        isWhite
          ? 'rounded-2xl border border-dashed border-white/20 bg-white/[0.02] px-6 py-12 text-center'
          : 'rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-xs'
      }
    >
      <h3 className={isWhite ? 'text-lg font-serif font-bold text-white' : 'text-lg font-serif font-bold text-slate-900'}>{title}</h3>
      <p className={`mx-auto mt-2 max-w-md text-sm ${isWhite ? 'text-white/70' : 'text-slate-600'}`}>{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
