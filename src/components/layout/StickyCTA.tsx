import { Link } from 'react-router-dom';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { dateRange } from '../../utils/format';

/** Mobile-only persistent registration CTA. Hidden on the registration flow itself. */
export function StickyCTA({ hidden }: { hidden: boolean }) {
  const event = useCurrentEvent();
  if (hidden) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md sm:hidden shadow-lg">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-slate-900">{dateRange(event.startDate, event.endDate)}</p>
          <p className="truncate text-[11px] text-slate-500">{event.venueName}, {event.venueCity}</p>
        </div>
        <Link to="/registration" className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-sm">
          Register
        </Link>
      </div>
    </div>
  );
}
