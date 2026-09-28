import { X, Clock, User, QrCode } from 'lucide-react';
import type { Attendee } from '../../types';
import { ParticipantBadge } from '../badge/ParticipantBadge';

interface AttendeeProfileDrawerProps {
  attendee: Attendee | null;
  onClose: () => void;
}

export function AttendeeProfileDrawer({ attendee, onClose }: AttendeeProfileDrawerProps) {
  if (!attendee) return null;

  const timeline = attendee.timeline || [
    {
      id: 'tl_1',
      title: 'Registration Submitted',
      detail: `Reference ${attendee.reference} created`,
      timestamp: attendee.checkedInAt || new Date().toISOString(),
      actor: 'System',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-riseIn">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sticky top-0 z-10 flex justify-between items-start border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono font-bold uppercase tracking-wider">
              <span>REF: {attendee.reference}</span>
              <span>&middot;</span>
              <span>ENTRY #{attendee.id.substring(0, 10)}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">{attendee.name}</h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {attendee.designation || 'Pastor'} &middot; {attendee.organisation || attendee.churchName || 'Independent Church'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-8 flex-1">
          {/* Status Matrix Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase">OPERATIONAL STATUSES</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Payment Status */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PAYMENT</span>
                <span className={`font-bold mt-1 inline-block px-2 py-0.5 rounded text-[11px] uppercase ${
                  attendee.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {attendee.paymentStatus}
                </span>
              </div>

              {/* Attendance Intention */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">INTENTION</span>
                <span className={`font-bold mt-1 inline-block px-2 py-0.5 rounded text-[11px] uppercase ${
                  attendee.attendanceIntention === 'ATTENDING' ? 'bg-emerald-100 text-emerald-800' :
                  attendee.attendanceIntention === 'NOT_ATTENDING' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {attendee.attendanceIntention || 'NOT_VERIFIED'}
                </span>
              </div>

              {/* Physical Check-in */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CHECK-IN</span>
                <span className={`font-bold mt-1 inline-block px-2 py-0.5 rounded text-[11px] uppercase ${
                  attendee.checkInStatus === 'checked-in' || attendee.physicalCheckIn === 'CHECKED_IN'
                    ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {attendee.checkInStatus === 'checked-in' ? 'CHECKED IN' : 'NOT CHECKED IN'}
                </span>
              </div>

              {/* WhatsApp Status */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WHATSAPP</span>
                <span className={`font-bold mt-1 inline-block px-2 py-0.5 rounded text-[11px] uppercase ${
                  attendee.whatsappStatus === 'ADDED' ? 'bg-emerald-100 text-emerald-800' :
                  attendee.whatsappStatus === 'INVITED' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {attendee.whatsappStatus || 'NOT_ADDED'}
                </span>
              </div>

              {/* Rooming Status */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ROOMING</span>
                <span className="font-bold text-slate-800 mt-1 block">
                  {attendee.roomId || attendee.roomingGroup ? 'ALLOCATED' : 'UNASSIGNED'}
                </span>
              </div>

              {/* Badge Status */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">QR BADGE</span>
                <span className="font-bold text-slate-800 mt-1 block uppercase">
                  {attendee.checkinToken ? 'READY' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-[#7F0401] uppercase flex items-center gap-2">
              <User size={15} /> PERSONAL & CHURCH DETAILS
            </h3>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block">Email</span>
                  <span className="font-semibold text-slate-800">{attendee.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-semibold text-slate-800">{attendee.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Church Name</span>
                  <span className="font-semibold text-slate-800">{attendee.churchName || attendee.organisation || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Denomination</span>
                  <span className="font-semibold text-slate-800">{attendee.churchDenomination || 'Non-Denominational'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">City / State</span>
                  <span className="font-semibold text-slate-800">{attendee.city}, {attendee.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Country</span>
                  <span className="font-semibold text-slate-800">{attendee.country || 'India'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Badge Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-[#7F0401] uppercase flex items-center gap-2">
              <QrCode size={15} /> DIGITAL PARTICIPANT BADGE
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex justify-center">
              <ParticipantBadge
                attendee={attendee}
                onPrint={() => window.print()}
              />
            </div>
          </div>

          {/* Timeline History */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-[#7F0401] uppercase flex items-center gap-2">
              <Clock size={15} /> OPERATIONS TIMELINE
            </h3>
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              {timeline.map((item, idx) => (
                <div key={item.id || idx} className="flex gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#7F0401] mt-1.5 shrink-0"></div>
                  <div>
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-slate-600 mt-0.5">{item.detail}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(item.timestamp).toLocaleString()} &middot; By {item.actor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
