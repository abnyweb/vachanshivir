import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/public/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listPublicExhibitors, searchExhibitors } from '../../services/exhibitorService';

export default function Exhibitors() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Exhibitors — ${event.name} ${event.year}`);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const all = listPublicExhibitors(db, event.id);
  const categories = useMemo(() => ['all', ...new Set(all.map((e) => e.category))], [all]);
  const results = searchExhibitors(all, query, category);

  return (
    <>
      <PageHeader title="Exhibitors" intro="Organisations exhibiting at the conference." action={<Button to="/exhibition" variant="outline">Book a stall</Button>} />
      <section className="shell py-14">
        {all.length === 0 ? (
          <EmptyState title="No exhibitors confirmed" description="Confirmed exhibitors will be listed here." action={<Button to="/exhibition" size="sm">Enquire about a stall</Button>} />
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <div className="w-full max-w-xs">
                <SearchInput value={query} onChange={setQuery} label="Search exhibitors" placeholder="Company or category" />
              </div>
              <label className="w-full max-w-[14rem]">
                <span className="sr-only">Filter by category</span>
                <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((e) => {
                const stall = db.stalls.find((s) => s.id === e.stallId);
                return (
                  <article key={e.id} className="border border-slate-200 bg-white rounded-2xl p-6 shadow-xs">
                    <h2 className="font-serif text-xl font-bold text-slate-900">{e.company}</h2>
                    <p className="mt-1 text-xs font-bold text-amber-800 uppercase font-mono">{e.category}{stall && ` · Stall ${stall.number}`}</p>
                    <p className="mt-3 text-[13px] leading-relaxed text-slate-600 font-sans">{e.description}</p>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </>
  );
}
