import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, QrCode, Home, UserCheck, ShieldCheck,
  Calendar, ArrowRight, RefreshCw
} from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';

export default function AttendeeOperations() {
  const { db } = useStore();
  const currentEvent = useCurrentEvent();
  const [selectedEventId, setSelectedEventId] = useState<string>(currentEvent.id || 'evt-vs-2026');
  const [refreshing, setRefreshing] = useState(false);

  const events = db.events || [];
  const regs = db.registrations.filter((r) => r.eventId === selectedEventId || r.eventId === 'vs-2026');
  const atts = db.attendees.filter((a) => a.eventId === selectedEventId || a.eventId === 'vs-2026');

  // Metrics computation
  const totalRegistered = regs.length;
  const paid = regs.filter((r) => r.paymentStatus === 'paid').length;
  const pendingPayment = regs.filter((r) => r.paymentStatus === 'unpaid' || r.paymentStatus === 'pending').length;
  const confirmedAttending = atts.filter((a) => a.attendanceIntention === 'ATTENDING').length;
  const notAttending = atts.filter((a) => a.attendanceIntention === 'NOT_ATTENDING').length;
  const attendanceNotVerified = atts.filter((a) => !a.attendanceIntention || a.attendanceIntention === 'NOT_VERIFIED').length;
  const checkedIn = atts.filter((a) => a.checkInStatus === 'checked-in' || a.physicalCheckIn === 'CHECKED_IN').length;
  const notCheckedIn = atts.filter((a) => a.checkInStatus !== 'checked-in' && a.physicalCheckIn !== 'CHECKED_IN').length;
  const whatsappAdded = atts.filter((a) => a.whatsappStatus === 'ADDED').length;
  const whatsappNotAdded = atts.filter((a) => !a.whatsappStatus || a.whatsappStatus === 'NOT_ADDED').length;
  const roomAllocated = atts.filter((a) => a.roomId || a.roomingGroup).length;
  const roomPending = atts.filter((a) => !a.roomId && !a.roomingGroup).length;
  const qrGenerated = atts.filter((a) => a.checkinToken || a.badgeStatus === 'generated').length;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="space-y-8 animate-riseIn">
      {/* Top Bar with Event Edition Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-navy" size={28} /> Attendee Operations Center
          </h1>
          <p className="text-sm text-slate-500">Real-time attendee journey management, check-in, rooming, and WhatsApp tracking.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Event Edition Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-2 shadow-sm text-xs font-raleway">
            <Calendar size={16} className="text-navy" />
            <span className="font-bold text-slate-600">Event Edition:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({evt.year})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Refresh Operations Stats"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">TOTAL REGISTERED</span>
          <span className="text-3xl font-black text-slate-950 block font-raleway">{totalRegistered}</span>
          <span className="text-xs text-slate-500 font-medium">Delegates in system</span>
        </div>

        {/* Paid */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block font-mono">PAYMENT CONFIRMED</span>
          <span className="text-3xl font-black text-emerald-700 block font-raleway">{paid}</span>
          <span className="text-xs text-slate-500 font-medium">Pending: {pendingPayment}</span>
        </div>

        {/* Confirmed Attending */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-navy uppercase tracking-widest block font-mono">CONFIRMED ATTENDING</span>
          <span className="text-3xl font-black text-navy block font-raleway">{confirmedAttending}</span>
          <span className="text-xs text-slate-500 font-medium">Not Attending: {notAttending} &middot; Unverified: {attendanceNotVerified}</span>
        </div>

        {/* Checked In */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block font-mono">PHYSICALLY CHECKED IN</span>
          <span className="text-3xl font-black text-blue-700 block font-raleway">{checkedIn}</span>
          <span className="text-xs text-slate-500 font-medium">Not Checked In: {notCheckedIn}</span>
        </div>

        {/* WhatsApp Added */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block font-mono">WHATSAPP ADDED</span>
          <span className="text-3xl font-black text-emerald-700 block font-raleway">{whatsappAdded}</span>
          <span className="text-xs text-slate-500 font-medium">Not Added: {whatsappNotAdded}</span>
        </div>

        {/* Room Allocated */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block font-mono">ROOM ALLOCATED</span>
          <span className="text-3xl font-black text-amber-700 block font-raleway">{roomAllocated}</span>
          <span className="text-xs text-slate-500 font-medium">Pending Rooming: {roomPending}</span>
        </div>

        {/* QR Badge Generated */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest block font-mono">QR BADGE READY</span>
          <span className="text-3xl font-black text-purple-700 block font-raleway">{qrGenerated}</span>
          <span className="text-xs text-slate-500 font-medium">Tokens generated</span>
        </div>

        {/* Check-in % */}
        <div className="bg-[#153A66] text-white p-5 rounded-2xl shadow-xs space-y-2 border border-blue-900/40">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block font-mono">CHECK-IN RATE</span>
          <span className="text-3xl font-extrabold text-white block font-sans">
            {totalRegistered > 0 ? Math.round((checkedIn / totalRegistered) * 100) : 0}%
          </span>
          <span className="text-xs text-white/80 font-medium">Live attendance rate</span>
        </div>
      </div>

      {/* Operational Launcher Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Verification Queue */}
        <Link
          to="/admin/operations/verification"
          className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm hover:border-navy hover:shadow-md transition-all group space-y-4"
        >
          <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy/15 flex items-center justify-center text-navy">
            <UserCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-navy flex items-center justify-between font-raleway">
              Attendance Verification <ArrowRight size={16} />
            </h3>
            <p className="text-xs text-slate-500 mt-1">Manager queue to confirm delegate attendance intention prior to event.</p>
          </div>
        </Link>

        {/* QR Scanner */}
        <Link
          to="/admin/operations/scanner"
          className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm hover:border-navy hover:shadow-md transition-all group space-y-4"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
            <QrCode size={24} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-purple-700 flex items-center justify-between font-raleway">
              QR Check-in Scanner <ArrowRight size={16} />
            </h3>
            <p className="text-xs text-slate-500 mt-1">Mobile-first QR camera scanner and fast venue check-in (&lt;5s).</p>
          </div>
        </Link>

        {/* WhatsApp Manager */}
        <Link
          to="/admin/operations/whatsapp"
          className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm hover:border-navy hover:shadow-md transition-all group space-y-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 flex items-center justify-between font-raleway">
              WhatsApp Group Manager <ArrowRight size={16} />
            </h3>
            <p className="text-xs text-slate-500 mt-1">Configurable group links, pre-populated invites, and onboarding status.</p>
          </div>
        </Link>

        {/* Rooming Board */}
        <Link
          to="/admin/operations/rooming-board"
          className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm hover:border-navy hover:shadow-md transition-all group space-y-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Home size={24} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-700 flex items-center justify-between font-raleway">
              Rooming Board &amp; Suggestions <ArrowRight size={16} />
            </h3>
            <p className="text-xs text-slate-500 mt-1">Weighted scoring algorithm for Quadruple Sharing room assignments.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
