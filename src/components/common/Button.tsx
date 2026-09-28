import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'ghost' | 'outline' | 'gold' | 'danger' | 'light';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-800 border-2 border-navy font-bold font-raleway shadow-[3px_3px_0px_0px_#0B1D33] active:translate-x-[1px] active:translate-y-[1px]',
  gold: 'bg-crossgold text-navy font-black hover:bg-crossgold-400 border-2 border-navy font-raleway shadow-[3px_3px_0px_0px_#1B4980] active:translate-x-[1px] active:translate-y-[1px]',
  outline: 'border-2 border-navy/40 bg-white text-navy hover:bg-navy-50 hover:border-navy font-bold font-raleway shadow-[2px_2px_0px_0px_rgba(27,73,128,0.2)]',
  ghost: 'text-navy-800 hover:text-navy hover:bg-navy-50 font-bold font-raleway',
  light: 'border-2 border-slate-200 bg-white text-slate-800 hover:border-navy hover:text-navy shadow-xs font-bold font-raleway',
  danger: 'border-2 border-red-500 bg-red-50 text-red-700 hover:bg-red-100 font-bold font-raleway',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-5 py-2.5 text-sm',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
  href?: string;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', to, href, className, children, ...rest }: Props) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-wide transition-all disabled:opacity-40 disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
  if (to) return <Link to={to} className={classes}>{children}</Link>;
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={classes}>{children}</a>;
  return <button className={classes} {...rest}>{children}</button>;
}
