import { CrudModule, type FieldDef } from '../../components/admin/CrudModule';
import { StatusPill } from '../../components/common/StatusPill';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listEvents, getCurrentEvent } from '../../services/eventService';
import { uid } from '../../utils/ids';
import { dateRange } from '../../utils/format';
import type { EventEdition } from '../../types';
import { Sparkles, MapPin, CheckCircle2, Star } from 'lucide-react';

const FIELDS: FieldDef<EventEdition>[] = [
  { name: 'name', label: 'Shivir Title & Location', type: 'text', required: true, hint: 'e.g. Vachan Adhyayan Shivir 2026 (Puri, Odisha)' },
  { name: 'edition', label: 'Edition Label', type: 'text', hint: 'e.g. Puri Odisha Edition' },
  { name: 'year', label: 'Year', type: 'number', required: true },
  { name: 'slug', label: 'URL Slug', type: 'text', required: true, hint: 'Used in /events/:slug' },
  { name: 'theme', label: 'Main Theme', type: 'text' },
  { name: 'tagline', label: 'Header Tagline', type: 'text' },
  { name: 'startDate', label: 'Start Date', type: 'date' },
  { name: 'endDate', label: 'End Date', type: 'date' },
  { name: 'checkInTime', label: 'Check-in Time', type: 'text' },
  { name: 'closeTime', label: 'Closing Time', type: 'text' },
  { name: 'venueName', label: 'Venue Center Name', type: 'text' },
  { name: 'venueCity', label: 'City & State', type: 'text', required: true },
  { name: 'venueAddress', label: 'Full Venue Address', type: 'text' },
  { name: 'venueMapUrl', label: 'Google Maps Link', type: 'text' },
  { name: 'organiser', label: 'Organiser Name', type: 'text', hint: 'Defaults to Satya Vachan Church' },
  { name: 'organiserUrl', label: 'Organiser Website', type: 'text' },
  { name: 'audience', label: 'Eligible Audience', type: 'text' },
  { name: 'heroImage', label: 'Banner Image URL', type: 'text' },
  {
    name: 'status', label: 'Event Status', type: 'select',
    options: [
      { value: 'current', label: 'Current (Homepage Active)' },
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'past', label: 'Past (Archived)' },
      { value: 'draft', label: 'Draft (Admin Only)' },
      { value: 'published', label: 'Published' },
    ],
  },
  { name: 'description', label: 'Full Description', type: 'textarea' },
  { name: 'themeBlurb', label: 'Theme Introduction', type: 'textarea' },
  { name: 'themeScripture', label: 'Theme Scripture Verse', type: 'textarea' },
  { name: 'eligibilityNotice', label: 'Eligibility / Fee Notice', type: 'textarea' },
  { name: 'languageNotice', label: 'Language Notice', type: 'textarea' },
  { name: 'objectives', label: 'Key Objectives', type: 'list', hint: 'One per line.' },
];

export default function AdminEvents() {
  const { db, update, updateSettings } = useStore();
  const { notify } = useToast();
  useDocumentMeta('Events & Shivir Locations — Vachan Shivir Admin');

  const activeEvent = getCurrentEvent(db);

  const handleSetActive = (event: EventEdition) => {
    updateSettings({ currentEventId: event.id });
    db.events.forEach((e) => {
      update('events', e.id, { status: e.id === event.id ? 'current' : e.status === 'current' ? 'upcoming' : e.status });
    });
    notify(`Active Shivir updated to: "${event.name}" (${event.venueCity})! Public homepage is now featured with this location.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Active Event Featured Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                ACTIVE HOMEPAGE SHIVIR LOCATION
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-serif">
              {activeEvent.name}
            </h2>
            <p className="text-xs text-slate-300 font-sans flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeEvent.venueName}, {activeEvent.venueCity}</span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">{dateRange(activeEvent.startDate, activeEvent.endDate)}</span>
            </p>
          </div>
        </div>

        <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-xl text-xs text-white/90 space-y-0.5 text-right font-mono shrink-0">
          <div className="text-amber-400 font-bold">ORGANIZED BY</div>
          <div>Satya Vachan Church</div>
        </div>
      </div>

      <CrudModule
        collection="events"
        title="Shivir Events & Locations"
        singular="Shivir Location"
        description="Manage all Vachan Shivir events across different cities & locations in India. Set any event as Active to feature it on the public homepage and registration system."
        rows={listEvents(db)}
        searchKeys={['name', 'theme', 'venueCity', 'edition']}
        fields={FIELDS}
        makeEmpty={() => ({
          id: uid('evt'), slug: `vachanshivir-${new Date().getFullYear() + 1}`, name: 'Vachan Adhyayan Shivir', edition: '', year: new Date().getFullYear() + 1,
          theme: 'वचन अध्ययन की सही विधि एवं बाइबल आधारित प्रचार', themeScripture: '', themeBlurb: '', tagline: '', startDate: '', endDate: '',
          checkInTime: '5:00 PM', closeTime: '2:00 PM', venueName: '', venueAddress: '', venueCity: '', venueMapUrl: '',
          organiser: 'Satya Vachan Church', organiserUrl: 'https://vachanshivir.org', organiserBlurb: '',
          description: '', audience: 'Leaders and Believers', languageNotice: 'Hindi', eligibilityNotice: 'Registration fee ₹3000',
          objectives: [], highlights: [{ label: 'शुल्क', value: '₹3,000' }], status: 'upcoming', heroImage: '/assets/hero-aipc-1600.webp',
        })}
        columns={[
          {
            key: 'name',
            header: 'Shivir Event & Location',
            render: (r) => (
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>{r.name}</span>
                  {r.id === activeEvent.id && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">{r.edition || r.venueCity}</div>
              </div>
            ),
          },
          { key: 'year', header: 'Year', className: 'w-20', render: (r) => <span className="tabular-nums text-slate-800 font-semibold">{r.year}</span> },
          { key: 'dates', header: 'Dates', render: (r) => dateRange(r.startDate, r.endDate) },
          { key: 'venue', header: 'Venue / City', render: (r) => `${r.venueName ? r.venueName + ', ' : ''}${r.venueCity}` },
          { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} className="!border-slate-200 !bg-slate-100 !text-slate-700" /> },
          {
            key: 'active',
            header: 'Homepage Action',
            render: (r) => (
              r.id === activeEvent.id ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Featured Active
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetActive(r)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 px-3 py-1.5 rounded-lg shadow-sm transition-all hover:scale-105"
                >
                  <Star size={13} className="fill-amber-950" />
                  <span>Set Active for Homepage</span>
                </button>
              )
            ),
          },
        ]}
      />
    </div>
  );
}
