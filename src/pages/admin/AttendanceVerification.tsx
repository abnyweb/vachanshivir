import { useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, HelpCircle, Search, MapPin, Building } from 'lucide-react';
import { useStore } from '../../store/StoreContext';

export default function AttendanceVerification() {
  const { db, update } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNVERIFIED' | 'ATTENDING' | 'NOT_ATTENDING'>('UNVERIFIED');
  const [selectedNote, setSelectedNote] = useState<Record<string, string>>({});

  const attendees = db.attendees || [];

  const filtered = attendees.filter((att) => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      att.name.toLowerCase().includes(q) ||
      att.email.toLowerCase().includes(q) ||
      att.phone.includes(q) ||
      (att.city || '').toLowerCase().includes(q) ||
      (att.churchName || att.organisation || '').toLowerCase().includes(q);

    const intention = att.attendanceIntention || 'NOT_VERIFIED';
    let matchTab = true;
    if (activeTab === 'UNVERIFIED') matchTab = intention === 'NOT_VERIFIED' || intention === 'UNKNOWN';
    if (activeTab === 'ATTENDING') matchTab = intention === 'ATTENDING';
    if (activeTab === 'NOT_ATTENDING') matchTab = intention === 'NOT_ATTENDING';

    return matchSearch && matchTab;
  });

  const handleSetIntention = (attendeeId: string, intention: string) => {
    const note = selectedNote[attendeeId] || '';
    const now = new Date().toISOString();
    const existing = attendees.find((a) => a.id === attendeeId);
    const existingTimeline = existing?.timeline || [];

    update('attendees', attendeeId, {
      attendanceIntention: intention as any,
      attendanceVerifiedBy: 'Event Manager',
      attendanceVerifiedAt: now,
      attendanceNote: note,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          title: `Attendance set to ${intention}`,
          detail: note ? `Note: ${note}` : `Verified by Event Manager`,
          timestamp: now,
          actor: 'Event Manager',
        },
        ...existingTimeline,
      ],
    });
  };

  return (
    <div className="space-y-6 animate-riseIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 font-raleway">
          <UserCheck className="text-navy" size={28} /> Manager Attendance Verification Queue
        </h1>
        <p className="text-sm text-slate-500">Verify delegate attendance intention prior to event check-in.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'UNVERIFIED', label: 'Pending Verification', count: attendees.filter((a) => !a.attendanceIntention || a.attendanceIntention === 'NOT_VERIFIED').length },
          { id: 'ATTENDING', label: 'Confirmed Attending', count: attendees.filter((a) => a.attendanceIntention === 'ATTENDING').length },
          { id: 'NOT_ATTENDING', label: 'Not Attending', count: attendees.filter((a) => a.attendanceIntention === 'NOT_ATTENDING').length },
          { id: 'ALL', label: 'All Delegates', count: attendees.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 font-raleway ${
              activeTab === tab.id ? 'bg-navy text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search delegate by name, phone, church, city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
        />
      </div>

      {/* Verification Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-sm">
            No delegates pending in this verification queue.
          </div>
        ) : (
          filtered.map((att) => {
            const currentIntention = att.attendanceIntention || 'NOT_VERIFIED';

            return (
              <div
                key={att.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{att.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        att.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {att.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">REF: {att.reference} &middot; {att.phone}</p>
                  </div>

                  {/* Status Indicator */}
                  <span className={`self-start text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    currentIntention === 'ATTENDING' ? 'bg-emerald-100 text-emerald-800' :
                    currentIntention === 'NOT_ATTENDING' ? 'bg-rose-100 text-rose-800' :
                    currentIntention === 'MAYBE' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {currentIntention.replace('_', ' ')}
                  </span>
                </div>

                {/* Info Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{att.churchName || att.organisation || 'Independent Church'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span>{att.city}, {att.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 uppercase font-mono text-[10px]">Rooming:</span>
                    <span className="font-semibold text-slate-800">{att.roomId || att.roomingGroup ? 'Assigned' : 'Pending'}</span>
                  </div>
                </div>

                {/* Manager Note Input */}
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Add operational verification note (e.g. Confirmed arrival via flight Sep 28)..."
                    value={selectedNote[att.id] || att.attendanceNote || ''}
                    onChange={(e) => setSelectedNote({ ...selectedNote, [att.id]: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>

                {/* Quick Action Toggles */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => handleSetIntention(att.id, 'ATTENDING')}
                    className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      currentIntention === 'ATTENDING'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 size={16} /> Attending
                  </button>

                  <button
                    onClick={() => handleSetIntention(att.id, 'MAYBE')}
                    className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      currentIntention === 'MAYBE'
                        ? 'bg-amber-500 text-white shadow'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <HelpCircle size={16} /> Maybe
                  </button>

                  <button
                    onClick={() => handleSetIntention(att.id, 'NOT_ATTENDING')}
                    className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      currentIntention === 'NOT_ATTENDING'
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <XCircle size={16} /> Not Attending
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
