import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Registration progress">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border text-[11px] tabular-nums font-bold transition-all font-raleway',
                done && 'border-navy bg-navy text-white shadow-2xs',
                active && 'border-navy text-navy bg-navy-50 ring-2 ring-crossgold font-black',
                !done && !active && 'border-slate-300 text-slate-400 bg-white',
              )}
            >
              {done ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                'text-[13px] transition-colors',
                active ? 'text-navy font-bold font-raleway' : done ? 'text-slate-800 font-semibold' : 'text-slate-400',
              )}
            >
              {label}
              {active && <span className="sr-only"> (current step)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
