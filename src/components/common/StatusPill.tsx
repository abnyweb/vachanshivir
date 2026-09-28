import { cn } from '../../utils/cn';
import { titleCase } from '../../utils/format';

const TONES: Record<string, string> = {
  paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  confirmed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  published: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'checked-in': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  held: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  submitted: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  new: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  reserved: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'in-progress': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  draft: 'bg-white/5 text-white/50 border-white/15',
  unpaid: 'bg-white/5 text-white/50 border-white/15',
  'not-arrived': 'bg-white/5 text-white/50 border-white/15',
  unassigned: 'bg-white/5 text-white/50 border-white/15',
  blocked: 'bg-white/5 text-white/40 border-white/10',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
  failed: 'bg-red-500/15 text-red-300 border-red-500/30',
  'no-show': 'bg-red-500/15 text-red-300 border-red-500/30',
};

export function StatusPill({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] tracking-wide',
        TONES[value] ?? 'bg-white/5 text-white/60 border-white/15',
        className,
      )}
    >
      {titleCase(value)}
    </span>
  );
}
