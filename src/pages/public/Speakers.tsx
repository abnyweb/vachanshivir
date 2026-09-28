import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/public/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listPublishedSpeakers, searchSpeakers } from '../../services/speakerService';
import { SPEAKER_POLICY_NOTE } from '../../data/people';

export default function Speakers() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Speakers — ${event.name} ${event.year}`, 'Preaching at Vachan Shivir.');

  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');
  const all = listPublishedSpeakers(db, event.id);
  const countries = useMemo(() => ['all', ...new Set(all.map((s) => s.country))], [all]);
  const results = searchSpeakers(all, query, country);

  return (
    <>
      <PageHeader title="Preaching" intro="Who preaches at Vachan Shivir, and why the conference handles this the way it does." />

      <section className="shell py-14">
        {all.length === 0 ? (
          <div className="max-w-2xl space-y-6">
            <blockquote className="border-l-4 border-amber-500 pl-5 py-3 pr-4 bg-amber-50/70 rounded-r-2xl text-[15px] leading-relaxed text-slate-700 italic">
              {SPEAKER_POLICY_NOTE}
            </blockquote>
            <p className="text-[15px] leading-relaxed text-slate-600">
              No speaker list is published for {event.year}. If Vachan Shivir publishes one, it will appear here.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button to="/programme" variant="outline">See the programme</Button>
              <Button to="/contact" variant="ghost">Apply to speak</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <div className="w-full max-w-xs">
                <SearchInput value={query} onChange={setQuery} label="Search speakers" placeholder="Name, church, topic" />
              </div>
              <label className="w-full max-w-[12rem]">
                <span className="sr-only">Filter by country</span>
                <select className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
                  {countries.map((c) => <option key={c} value={c}>{c === 'all' ? 'All countries' : c}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-8">
              {results.length === 0 ? (
                <EmptyState title="No speakers match" description="Try a different name, church or topic." />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((s) => (
                    <Link
                      key={s.id}
                      to={`/speakers/${s.id}`}
                      className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {s.photo && <img src={s.photo} alt={s.name} loading="lazy" width={320} height={320} className="mb-4 h-48 w-full object-cover rounded-xl" />}
                        <h2 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{s.name}</h2>
                        <p className="mt-1 text-[13px] font-medium text-slate-600">{s.designation}</p>
                      </div>
                      <p className="mt-3 pt-3 border-t border-slate-100 text-[12px] text-slate-500 font-mono">{s.organisation}, {s.country}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
