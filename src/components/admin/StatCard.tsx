import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
  icon: LucideIcon;
  to?: string;
  color?: 'navy' | 'gold' | 'maroon' | 'emerald' | 'amber' | 'indigo' | 'violet';
}

export function StatCard({ label, value, hint, trend, icon: Icon, to, color = 'navy' }: Props) {
  const iconBgClasses = {
    navy: 'bg-navy-50 text-navy group-hover:bg-navy group-hover:text-white',
    gold: 'bg-amber-50 text-crossgold-dark group-hover:bg-crossgold group-hover:text-navy-950',
    maroon: 'bg-navy-50 text-navy group-hover:bg-navy group-hover:text-white',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
    indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
  };

  const body = (
    <div className="group relative flex h-full flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-card-hover">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 ${iconBgClasses[color]}`}>
            <Icon size={18} />
          </div>
        </div>
        <p className="mt-3 font-sans text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
      </div>

      {(hint || trend || to) && (
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          {hint && <span className="text-slate-500 font-medium truncate">{hint}</span>}
          {trend && (
            <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
              {trend}
            </span>
          )}
          {to && (
            <span className="ml-auto inline-flex items-center text-slate-400 group-hover:text-navy transition-colors font-medium">
              View <ArrowUpRight size={13} className="ml-0.5" />
            </span>
          )}
        </div>
      )}
    </div>
  );

  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}
