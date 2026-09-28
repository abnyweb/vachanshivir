import type { Stall } from '../../types';
import { STALL_STATUS_STYLE, zonesOf } from '../../services/stallService';
import { cn } from '../../utils/cn';

interface Props {
  stalls: Stall[];
  selectedId?: string | null;
  onSelect?: (stall: Stall) => void;
}

/** Interactive grid floor plan. Keyboard operable; status is conveyed by text as well as colour. */
export function FloorPlan({ stalls, selectedId, onSelect }: Props) {
  const zones = zonesOf(stalls);

  return (
    <div className="space-y-8">
      {zones.map(({ zone, stalls: zoneStalls }) => {
        const columns = Math.max(...zoneStalls.map((s) => s.column));
        return (
          <div key={zone}>
            <h3 className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-slate-700">{zone}</h3>
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div
                className="grid min-w-max gap-2"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(2.75rem, 1fr))` }}
              >
              {zoneStalls.map((stall) => {
                const interactive = Boolean(onSelect) && stall.status !== 'blocked';
                return (
                  <button
                    key={stall.id}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onSelect?.(stall)}
                    aria-label={`Stall ${stall.number}, ${stall.size}, ${stall.status}`}
                    aria-pressed={selectedId === stall.id}
                    className={cn(
                      'flex aspect-square flex-col items-center justify-center border p-1 text-center transition-colors rounded-lg',
                      STALL_STATUS_STYLE[stall.status],
                      selectedId === stall.id && 'ring-2 ring-amber-500 ring-offset-2 ring-offset-white',
                      interactive ? 'hover:shadow-md' : 'cursor-not-allowed',
                    )}
                  >
                    <span className="text-[13px] font-bold">{stall.number}</span>
                    <span className="mt-0.5 text-[9px] leading-tight font-medium uppercase">{stall.status}</span>
                  </button>
                );
              })}
              </div>
            </div>
          </div>
        );
      })}

      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
        {Object.entries(STALL_STATUS_STYLE).map(([status, style]) => (
          <li key={status} className="flex items-center gap-2">
            <span className={cn('inline-block h-3.5 w-3.5 rounded border', style)} />
            <span className="capitalize">{status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
