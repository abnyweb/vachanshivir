import { useState } from 'react';
import { PageHeader } from '../../components/public/PageHeader';
import { PendingNotice } from '../../components/public/PendingNotice';
import { EmptyState } from '../../components/common/EmptyState';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { groupByDay, listSessions } from '../../services/agendaService';
import { dayLabel, titleCase } from '../../utils/format';
import { cn } from '../../utils/cn';

export default function Programme() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Programme — ${event.name} ${event.year}`, 'Day-by-day programme for Vachan Shivir.');

  const days = groupByDay(listSessions(db, event.id).filter((s) => s.status === 'published' || s.status === 'draft'));
  const [active, setActive] = useState(days[0]?.day ?? 1);
  const current = days.find((d) => d.day === active);
  const pending = current?.sessions.filter((s) => s.title.startsWith('Content pending')).length ?? 0;

  return (
    <>
      <PageHeader
        title="Programme"
        intro={`Three days of sessions at ${event.venueName}. Check-in opens at ${event.checkInTime} and the conference closes ${event.closeTime}.`}
      />

      <section className="shell py-14">
        {days.length === 0 ? (
          <EmptyState title="No programme published" description="The session schedule has not been published yet." />
        ) : (
          <>
            <div role="tablist" aria-label="Conference days" className="flex flex-wrap gap-2">
              {days.map((d) => (
                <button
                  key={d.day}
                  role="tab"
                  aria-selected={active === d.day}
                  onClick={() => setActive(d.day)}
                  className={cn(
                    'border rounded-xl px-4 py-2.5 text-left text-[13px] transition-all',
                    active === d.day
                      ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                  )}
                >
                  <span className="block font-bold">Day {d.day}</span>
                  <span className="block text-[11px] opacity-80">{dayLabel(d.date)}</span>
                </button>
              ))}
            </div>

            {pending > 0 && (
              <div className="mt-6 max-w-2xl">
                <PendingNotice what="Session titles, times and speakers for this day are not final." />
              </div>
            )}

            <ol className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {current?.sessions.map((s) => {
                const speaker = db.speakers.find((sp) => sp.id === s.speakerId);
                return (
                  <li key={s.id} className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr]">
                    <p className="text-[13px] tabular-nums font-mono font-bold text-amber-800">
                      {s.startTime === 'Content pending' ? 'Time pending' : `${s.startTime}${s.endTime && s.endTime !== s.startTime ? ` – ${s.endTime}` : ''}`}
                    </p>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-slate-900">{s.title}</h2>
                      <p className="mt-1 text-[13px] font-medium text-slate-500">
                        {titleCase(s.type)}{s.room && ` · ${s.room}`}{speaker && ` · ${speaker.name}`}
                      </p>
                      {s.description && <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{s.description}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </section>
    </>
  );
}
