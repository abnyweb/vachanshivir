import { useCountdown } from '../../hooks/useCountdown';

export function Countdown({ targetDate, className = '' }: { targetDate: string; className?: string }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  if (expired) {
    return <p className={`text-sm text-gold ${className}`}>The conference is under way.</p>;
  }

  const units = [
    { value: days, label: days === 1 ? 'day' : 'days' },
    { value: hours, label: 'hours' },
    { value: minutes, label: 'minutes' },
    { value: seconds, label: 'seconds' },
  ];

  return (
    <div className={className}>
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Until check-in opens</p>
      <div className="flex gap-3 sm:gap-5">
        {units.map((u) => (
          <div key={u.label} className="min-w-[3.75rem] border-l-2 border-amber-500 pl-3">
            <p className="font-serif text-3xl font-bold leading-none text-slate-900 tabular-nums sm:text-4xl">
              {String(u.value).padStart(2, '0')}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
