import { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Calendar, History, FileText, Users, Award, ExternalLink, Plus } from 'lucide-react';
import type { EventEdition } from '../../types';

export default function PreviousYears() {
  const { db, create } = useStore();
  const editions = useMemo(() => [...db.events].sort((a, b) => b.year - a.year), [db.events]);
  const [selectedEventId, setSelectedEventId] = useState<string>(editions[0]?.id || 'evt-vachanshivir-2026');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newYear, setNewYear] = useState('2024');
  const [newName, setNewName] = useState("Vachan Shivir 2024");
  const [newTheme, setNewTheme] = useState('Faithful Ministry in Times of Challenge');
  const [newVenue, setNewVenue] = useState('St. Andrew Auditorium, Mumbai');

  const selectedEvent = editions.find((e) => e.id === selectedEventId) || editions[0];
  const selectedYear = selectedEvent ? selectedEvent.year : 2026;

  const resources = (db.historicalResources || []).filter((r) => r.eventYear === selectedYear);
  const participations = (db.eventParticipations || []).filter((p) => p.eventYear === selectedYear);

  const yearAttendees = useMemo(() => {
    return (db.attendees || []).filter((a) => {
      const yr = a.year || (a.reference || '').substring(5, 9) || (a.eventId || '').replace('vachanshivir-', '');
      return String(yr) === String(selectedYear);
    });
  }, [db.attendees, selectedYear]);

  const yearPaid = useMemo(() => {
    return yearAttendees.filter((a) => (a.paymentStatus || '').toLowerCase() === 'paid');
  }, [yearAttendees]);

  const handleCreateEdition = (e: React.FormEvent) => {
    e.preventDefault();
    const yr = Number(newYear);
    const id = `evt-vachanshivir-${yr}`;
    const newEdition: EventEdition = {
      id,
      slug: `vachanshivir-${yr}`,
      name: newName,
      edition: `${yr - 2018}th Edition`,
      year: yr,
      theme: newTheme,
      themeScripture: '1 Peter 1:24-25',
      themeBlurb: 'Expositions for men who love the Church.',
      tagline: 'Equipping Pastors & Church Leaders across India',
      startDate: `${yr}-09-25`,
      endDate: `${yr}-09-27`,
      checkInTime: '08:00 AM',
      closeTime: '05:00 PM',
      venueName: newVenue,
      venueAddress: 'Mumbai, Maharashtra',
      venueCity: 'Mumbai',
      venueMapUrl: 'https://maps.google.com',
      organiser: 'Vachan Shivir Foundation',
      organiserUrl: 'https://vachanshivir.org',
      organiserBlurb: 'Serving the Church in India',
      description: 'Historical archive for Vachan Shivir ' + yr,
      audience: 'Pastors, Elders & Church Leaders',
      languageNotice: 'Sessions conducted in English with translation aids.',
      eligibilityNotice: 'For active pastors and elders.',
      objectives: ['Expository Preaching', 'Church Leadership', 'Fellowship'],
      highlights: [{ label: 'Pastors Attended', value: '500+' }],
      status: yr >= 2026 ? 'current' : 'past',
      heroImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
    };

    create('events', newEdition);
    setSelectedEventId(id);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-raleway text-navy-950 flex items-center gap-2">
            <History className="text-crossgold" size={28} />
            Previous Years Historical Event Archive
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">
            Structured archive of historical Vachan Shivir editions, resources, attendees, and session proceedings.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 bg-[#153A66] hover:bg-[#1B4980] text-white font-medium shadow-xs text-xs w-full sm:w-auto">
          <Plus size={15} /> Add Past Edition
        </Button>
      </div>

      {/* Year & Edition Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar max-w-full">
        {editions.map((e) => {
          const isSelected = selectedEvent?.id === e.id;
          return (
            <button
              key={e.id}
              onClick={() => setSelectedEventId(e.id)}
              className={`px-3.5 py-1.5 rounded-xl font-sans text-xs transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-300'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              {e.year} • {e.venueCity || e.name} {e.status === 'current' ? <span className="ml-1 text-emerald-700 font-semibold">(Current)</span> : e.status === 'upcoming' ? <span className="ml-1 text-sky-700 font-semibold">(Upcoming)</span> : null}
            </button>
          );
        })}
      </div>

      {selectedEvent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edition Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-sans font-bold text-slate-900 flex items-center justify-between">
                  <span>{selectedEvent.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#153A66] font-medium border border-blue-200">
                    {selectedEvent.edition}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Conference Theme</p>
                  <p className="text-lg font-raleway text-navy font-bold mt-1">“{selectedEvent.theme}”</p>
                  <p className="text-sm text-slate-600 mt-1 font-sans">{selectedEvent.themeBlurb}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200">
                    <Calendar className="text-navy shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-bold text-slate-900">Dates</p>
                      <p className="text-slate-500">{selectedEvent.startDate} to {selectedEvent.endDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200">
                    <Award className="text-crossgold shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-bold text-slate-900">Venue</p>
                      <p className="text-slate-500">{selectedEvent.venueName}, {selectedEvent.venueCity}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historical Resources Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-raleway font-bold flex items-center justify-between text-slate-900">
                  <span className="flex items-center gap-2">
                    <FileText className="text-navy" size={20} />
                    Conference Resources & Documents ({resources.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resources.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center font-sans">No historical resources uploaded for Vachan Shivir {selectedYear} yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 font-sans">
                    {resources.map((r) => (
                      <div key={r.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{r.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                        </div>
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-navy font-bold hover:underline"
                        >
                          View <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Stats & Attendance */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-raleway font-bold flex items-center gap-2 text-slate-900">
                  <Users className="text-navy" size={18} />
                  Vachan Shivir {selectedYear} Historical Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 font-sans">
                <div className="p-3 bg-navy-50 rounded-xl border border-navy/15 flex justify-between items-center">
                  <span className="text-sm text-slate-600">Recorded Registrations</span>
                  <span className="text-lg font-black text-navy font-mono">{yearAttendees.length || participations.length}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
                  <span className="text-sm text-slate-600">Verified Paid Delegates</span>
                  <span className="text-lg font-black text-amber-700 font-mono">
                    {yearPaid.length || participations.filter((p) => p.attended || p.paymentStatus === 'paid').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add Past Edition Modal */}
      <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Historical Vachan Shivir Edition">
        <form onSubmit={handleCreateEdition} className="space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-ink">Year</label>
            <input
              type="number"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="mt-1 w-full rounded border border-ink/20 p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-ink">Edition Title</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 w-full rounded border border-ink/20 p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-ink">Theme</label>
            <input
              type="text"
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              className="mt-1 w-full rounded border border-ink/20 p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-ink">Venue</label>
            <input
              type="text"
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
              className="mt-1 w-full rounded border border-ink/20 p-2"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Edition</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
