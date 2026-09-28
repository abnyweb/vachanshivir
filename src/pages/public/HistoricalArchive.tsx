import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { History, Calendar, Award, FileText, ExternalLink, ArrowLeft } from 'lucide-react';

export default function HistoricalArchive() {
  const { year: yearParam } = useParams<{ year?: string }>();
  const { db } = useStore();

  const selectedYear = yearParam ? Number(yearParam) : null;
  const events = db.events.sort((a, b) => b.year - a.year);
  const selectedEvent = selectedYear ? events.find((e) => e.year === selectedYear) : null;
  const resources = selectedYear
    ? (db.historicalResources || []).filter((r) => r.eventYear === selectedYear && r.visibility === 'PUBLIC')
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        {selectedYear && (
          <Link to="/events" className="inline-flex items-center gap-1 text-sm text-amber-800 font-semibold hover:underline mb-4">
            <ArrowLeft size={16} /> All Historical Editions
          </Link>
        )}
        <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold flex items-center gap-3">
          <History className="text-amber-600" size={36} />
          {selectedEvent ? `Vachan Shivir ${selectedEvent.year} Archive` : 'Vachan Shivir Historical Archive'}
        </h1>
        <p className="text-base text-slate-600 mt-2 max-w-3xl">
          Explore past editions of Vachan Shivir, theme expositions, keynote messages, and downloadable public resources.
        </p>
      </div>

      {!selectedEvent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => (
            <div key={e.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase">{e.edition}</span>
                  <span className="text-xs text-slate-400 font-semibold">{e.year}</span>
                </div>

                <div className="mt-3">
                  <h2 className="text-xl font-serif font-bold text-slate-900">{e.name}</h2>
                  <p className="text-sm font-serif italic text-amber-700 mt-1">“{e.theme}”</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs text-slate-600 space-y-1 pt-3 border-t border-slate-100">
                  <p><strong className="text-slate-900">Venue:</strong> {e.venueName}, {e.venueCity}</p>
                  <p><strong className="text-slate-900">Dates:</strong> {e.startDate} to {e.endDate}</p>
                </div>

                <Link
                  to={`/events/${e.year}`}
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-amber-600 transition-colors shadow-xs"
                >
                  View Archive &amp; Resources &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase">{selectedEvent.edition}</span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">{selectedEvent.name}</h2>
              </div>
            </div>

            <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200">
              <p className="text-xs text-amber-800 font-mono uppercase font-bold">Theme</p>
              <p className="text-lg font-serif text-slate-900 font-bold mt-1">“{selectedEvent.theme}”</p>
              <p className="text-sm text-slate-700 mt-1">{selectedEvent.themeBlurb}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <Calendar className="text-amber-600 shrink-0" size={20} />
                <div>
                  <p className="font-bold text-slate-900">Dates</p>
                  <p className="text-slate-600">{selectedEvent.startDate} to {selectedEvent.endDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <Award className="text-amber-600 shrink-0" size={20} />
                <div>
                  <p className="font-bold text-slate-900">Venue</p>
                  <p className="text-slate-600">{selectedEvent.venueName}, {selectedEvent.venueCity}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-amber-600" size={22} />
              Public Retreat Resources ({resources.length})
            </h3>

            {resources.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No public resources available for download for Vachan Shivir {selectedYear} at this time.</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {resources.map((r) => (
                  <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase">{r.category}</span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{r.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{r.description}</p>
                    </div>
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-600 transition-colors shrink-0 shadow-xs"
                    >
                      Download <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
