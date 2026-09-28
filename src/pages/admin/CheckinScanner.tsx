import { useState } from 'react';
import { QrCode, Search, CheckCircle2, AlertTriangle, XCircle, RotateCcw, Zap, ShieldAlert } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import type { Attendee } from '../../types';

export default function CheckinScanner() {
  const { db, update } = useStore();
  const [searchInput, setSearchInput] = useState('');
  const [fastMode, setFastMode] = useState(true);
  const [scannedAttendee, setScannedAttendee] = useState<Attendee | null>(null);
  const [checkinMessage, setCheckinMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [undoModalAttendee, setUndoModalAttendee] = useState<Attendee | null>(null);
  const [undoReason, setUndoReason] = useState('');

  const attendees = db.attendees || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const q = searchInput.trim().toLowerCase();
    const found = attendees.find(
      (a) =>
        String(a.legacyEntryId || '').toLowerCase() === q ||
        String(a.entryId || '').toLowerCase() === q ||
        `#${a.legacyEntryId}`.toLowerCase() === q ||
        a.id.toLowerCase() === q ||
        a.reference.toLowerCase() === q ||
        a.checkinToken === q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    );

    if (found) {
      setScannedAttendee(found);
      setCheckinMessage(null);
    } else {
      setScannedAttendee(null);
      setCheckinMessage({ type: 'error', text: 'No matching delegate found with provided search term.' });
    }
  };

  const handlePerformCheckIn = (att: Attendee) => {
    if (att.checkInStatus === 'checked-in' || att.physicalCheckIn === 'CHECKED_IN') {
      setCheckinMessage({
        type: 'warning',
        text: `Already Checked In by ${att.checkedInBy || 'Manager'} at ${att.checkedInAt ? new Date(att.checkedInAt).toLocaleTimeString() : 'venue'}.`,
      });
      return;
    }

    const now = new Date().toISOString();
    const existingTimeline = att.timeline || [];

    update('attendees', att.id, {
      checkInStatus: 'checked-in',
      physicalCheckIn: 'CHECKED_IN',
      checkedInAt: now,
      checkedInBy: 'Onsite Manager',
      checkedInMethod: 'QR',
      timeline: [
        {
          id: `tl_${Date.now()}`,
          title: 'Physical Check-in Completed',
          detail: 'Checked in at event desk via QR/Fast Scanner',
          timestamp: now,
          actor: 'Onsite Manager',
        },
        ...existingTimeline,
      ],
    });

    setCheckinMessage({
      type: 'success',
      text: `SUCCESS: ${att.name} checked in successfully!`,
    });

    if (fastMode) {
      setTimeout(() => {
        setScannedAttendee(null);
        setSearchInput('');
        setCheckinMessage(null);
      }, 1800);
    }
  };

  const handleUndoCheckInSubmit = () => {
    if (!undoModalAttendee || !undoReason.trim()) return;

    const now = new Date().toISOString();
    const existingTimeline = undoModalAttendee.timeline || [];

    update('attendees', undoModalAttendee.id, {
      checkInStatus: 'not-arrived',
      physicalCheckIn: 'NOT_CHECKED_IN',
      checkinCorrection: {
        reason: undoReason,
        undoneBy: 'Administrator',
        undoneAt: now,
      },
      timeline: [
        {
          id: `tl_${Date.now()}`,
          title: 'Check-in Corrected / Undone',
          detail: `Reason: ${undoReason}`,
          timestamp: now,
          actor: 'Administrator',
        },
        ...existingTimeline,
      ],
    });

    setUndoModalAttendee(null);
    setUndoReason('');
    setScannedAttendee(null);
    setCheckinMessage({ type: 'success', text: 'Check-in status corrected successfully.' });
  };

  return (
    <div className="space-y-6 animate-riseIn max-w-xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 font-raleway">
            <QrCode className="text-navy" size={24} /> QR Check-in Scanner
          </h1>
          <p className="text-xs text-slate-500">Fast physical check-in for event desk managers.</p>
        </div>

        {/* Fast Mode Toggle */}
        <button
          onClick={() => setFastMode(!fastMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            fastMode ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Zap size={14} className={fastMode ? 'fill-amber-500 text-amber-500' : ''} />
          <span>Fast Mode: {fastMode ? 'ON (<5s)' : 'OFF'}</span>
        </button>
      </div>

      {/* Camera Simulator Box */}
      <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-xs border border-slate-200/90 text-center space-y-4 relative overflow-hidden">
        <div className="border-2 border-dashed border-[#153A66]/30 rounded-xl p-8 flex flex-col items-center justify-center space-y-3 bg-slate-50/70">
          <QrCode size={56} className="text-[#153A66] animate-pulse" />
          <p className="text-xs font-bold tracking-wide text-slate-800 uppercase font-sans">Camera Active &middot; Ready to Scan Token</p>
          <p className="text-[11px] text-slate-500">Position QR Code within scanner frame</p>
        </div>

        {/* Demo Quick Scan Triggers */}
        <div className="pt-2 text-left space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Quick Demo Scan Selection:</span>
          <div className="flex flex-wrap gap-2">
            {attendees.slice(0, 3).map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setScannedAttendee(a);
                  setCheckinMessage(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-xs px-3 py-1.5 rounded-lg text-slate-800 border border-slate-200/80 transition-colors font-mono"
              >
                Scan {a.name.split(' ')[0]} ({a.reference})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Reference, Phone, Email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
          />
        </div>
        <button
          type="submit"
          className="bg-navy hover:bg-navy-light text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors font-raleway border border-navy-950"
        >
          Search
        </button>
      </form>

      {/* Feedback Message */}
      {checkinMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${
            checkinMessage.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
            checkinMessage.type === 'warning' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
            'bg-rose-100 text-rose-900 border border-rose-300'
          }`}
        >
          {checkinMessage.type === 'success' && <CheckCircle2 size={20} className="shrink-0 text-emerald-700" />}
          {checkinMessage.type === 'warning' && <AlertTriangle size={20} className="shrink-0 text-amber-700" />}
          {checkinMessage.type === 'error' && <XCircle size={20} className="shrink-0 text-rose-700" />}
          <span>{checkinMessage.text}</span>
        </div>
      )}

      {/* Scanned Attendee Card Result */}
      {scannedAttendee && (
        <div className="bg-white border-2 border-navy rounded-2xl p-6 shadow-xl space-y-6 animate-riseIn">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-navy uppercase">ATTENDEE IDENTIFIED</span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5 font-raleway">{scannedAttendee.name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">REF: {scannedAttendee.reference}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase font-mono ${
              scannedAttendee.checkInStatus === 'checked-in' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {scannedAttendee.checkInStatus === 'checked-in' ? 'CHECKED IN' : 'NOT CHECKED IN'}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block font-medium">Church</span>
              <span className="font-bold text-slate-800">{scannedAttendee.churchName || scannedAttendee.organisation || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">City / State</span>
              <span className="font-bold text-slate-800">{scannedAttendee.city}, {scannedAttendee.state}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment Status</span>
              <span className={`font-bold uppercase ${scannedAttendee.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {scannedAttendee.paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Attendance Intention</span>
              <span className="font-bold text-slate-800 uppercase">{scannedAttendee.attendanceIntention || 'NOT_VERIFIED'}</span>
            </div>
          </div>

          {/* Warnings */}
          {scannedAttendee.paymentStatus !== 'paid' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>WARNING: Delegate payment is pending ({scannedAttendee.paymentStatus}). Manager discretion required.</span>
            </div>
          )}

          {/* Big Action Button */}
          <div className="space-y-3 pt-2">
            {scannedAttendee.checkInStatus !== 'checked-in' ? (
              <button
                onClick={() => handlePerformCheckIn(scannedAttendee)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base py-3.5 rounded-xl uppercase tracking-wider font-sans shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={22} /> CONFIRM CHECK IN
              </button>
            ) : (
              <div className="space-y-2">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center text-xs font-bold">
                  CHECKED IN AT {scannedAttendee.checkedInAt ? new Date(scannedAttendee.checkedInAt).toLocaleTimeString() : 'VENUE'}
                </div>
                <button
                  onClick={() => setUndoModalAttendee(scannedAttendee)}
                  className="w-full border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={16} /> Undo Check-in (Correction)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Undo Check-in Modal */}
      {undoModalAttendee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-riseIn">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-rose-600" size={22} /> Undo Check-in Confirmation
            </h3>
            <p className="text-xs text-slate-600">
              Provide an official operational reason for reversing the check-in for <strong>{undoModalAttendee.name}</strong>.
            </p>

            <textarea
              placeholder="Reason for correction (e.g. Accidental click, duplicate entry)..."
              value={undoReason}
              onChange={(e) => setUndoReason(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setUndoModalAttendee(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUndoCheckInSubmit}
                disabled={!undoReason.trim()}
                className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-700 disabled:opacity-50"
              >
                Confirm Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
