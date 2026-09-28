import type { ReactNode } from 'react';

interface Props {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
  tone?: 'dark' | 'light';
  children: ReactNode;
}

export function FormField({ label, name, error, required, hint, tone = 'light', children }: Props) {
  const isWhite = tone === 'dark';
  return (
    <div>
      <label htmlFor={name} className={`mb-1.5 block text-[13px] font-medium ${isWhite ? 'text-white/80' : 'text-slate-700'}`}>
        {label}
        {required && <span className="ml-1 text-rose-600 font-bold" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {hint && !error && <p className={`mt-1 text-xs ${isWhite ? 'text-white/50' : 'text-slate-500'}`}>{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
