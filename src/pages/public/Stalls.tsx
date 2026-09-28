import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/public/PageHeader';
import { FloorPlan } from '../../components/exhibition/FloorPlan';
import { Button } from '../../components/common/Button';
import { StatusPill } from '../../components/common/StatusPill';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listStalls, STALL_STATUSES } from '../../services/stallService';
import { inr } from '../../utils/format';
import type { Stall } from '../../types';

export default function Stalls() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Exhibition floor plan — ${event.name} ${event.year}`);

  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Stall | null>(null);
  const stalls = listStalls(db, event.id).filter((s) => filter === 'all' || s.status === filter);

  return (
    <>
      <PageHeader title="Exhibition floor plan" intro="Select a stall to see its size, facilities and price." />
      <section className="shell grid gap-10 py-14 lg:grid-cols-[1fr_18rem]">
        <div>
          <label className="mb-6 block w-full max-w-[14rem]">
            <span className="sr-only">Filter stalls by status</span>
            <select className="field" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All stalls</option>
              {STALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <FloorPlan stalls={stalls} selectedId={selected?.id} onSelect={setSelected} />
        </div>

        <aside className="h-fit border border-slate-200 bg-white rounded-2xl p-6 shadow-xs lg:sticky lg:top-24">
          {selected ? (
            <>
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-2xl font-bold text-slate-900">Stall {selected.number}</h2>
                <StatusPill value={selected.status} />
              </div>
              <dl className="mt-4 space-y-3">
                {[['Zone', selected.zone], ['Type', selected.type], ['Size', selected.size], ['Price', inr(selected.price)]].map(([k, v]) => (
                  <div key={k}><dt className="text-xs text-slate-500 font-medium">{k}</dt><dd className="text-sm font-semibold text-slate-900">{v}</dd></div>
                ))}
              </dl>
              <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-wider text-slate-700">Included</h3>
              <ul className="mt-2 space-y-1">
                {selected.facilities.map((f) => <li key={f} className="text-xs text-slate-600 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{f}</li>)}
              </ul>
              <Button to={`/stalls/${selected.id}`} className="mt-6 w-full" size="sm">Stall details</Button>
              <Button to="/exhibition" variant="outline" className="mt-2 w-full" size="sm">Enquire about this stall</Button>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-slate-600">
              Select a stall on the plan to see its details. Blocked stalls are not available.
            </p>
          )}
          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            Demonstration floor plan. <Link to="/exhibition" className="text-amber-800 font-semibold hover:underline">Read the exhibition notes</Link>.
          </p>
        </aside>
      </section>
    </>
  );
}
