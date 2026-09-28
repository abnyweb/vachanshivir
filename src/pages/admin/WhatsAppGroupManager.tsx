import { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Search, Copy, Check } from 'lucide-react';
import { useStore } from '../../store/StoreContext';

export default function WhatsAppGroupManager() {
  const { db, update } = useStore();
  const [copied, setCopied] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const waConfig = db.whatsappGroups?.[0] || {
    id: 'wa_group_2026',
    eventId: 'evt-vachanshivir-2026',
    groupName: 'Vachan Shivir 2026 Official Delegates',
    groupLink: 'https://chat.whatsapp.com/VachanShivir2026OfficialGroupLink',
    description: 'Official WhatsApp group for Vachan Shivir 2026 registered delegates and pastors.',
    purpose: 'Event updates, session alerts, announcements, and peer networking.',
    active: true,
  };

  const [groupLink, setGroupLink] = useState(waConfig.groupLink);
  const [groupName, setGroupName] = useState(waConfig.groupName);

  const handleSaveConfig = async () => {
    setSavingLink(true);
    try {
      await fetch('/api/operations/whatsapp-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: 'evt-vachanshivir-2026',
          groupName,
          groupLink,
        }),
      });
      alert('WhatsApp group configuration saved!');
    } catch {
      alert('Updated locally in app state.');
    } finally {
      setSavingLink(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(groupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const attendees = db.attendees || [];

  const filteredAttendees = attendees.filter((a) => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      (a.city || '').toLowerCase().includes(q);

    const status = a.whatsappStatus || 'NOT_ADDED';
    const matchStatus = statusFilter === 'ALL' || status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getInviteUrl = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hello ${name},\n\nThank you for registering for Vachan Shivir 2026.\n\nPlease join the official Vachan Shivir 2026 participant WhatsApp group using the link below:\n\n${groupLink}\n\nWe look forward to welcoming you.\n\n— Vachan Shivir Team`
    );
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  const markStatus = (attendeeId: string, newStatus: string) => {
    update('attendees', attendeeId, { whatsappStatus: newStatus as any });
  };

  return (
    <div className="space-y-8 animate-riseIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="text-[#25D366]" size={28} /> WhatsApp Group Management
          </h1>
          <p className="text-sm text-slate-500">Configure participant WhatsApp group links and track delegate onboarding.</p>
        </div>
      </div>

      {/* Group Link Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900">Event WhatsApp Group Configuration</h2>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            ACTIVE LINK
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">WhatsApp Group Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={groupLink}
                onChange={(e) => setGroupLink(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveConfig}
            disabled={savingLink}
            className="bg-[#153A66] hover:bg-[#1B4980] text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {savingLink ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Participant Invitation & Status Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900 font-raleway">Delegate WhatsApp Onboarding Status</h2>
          <div className="flex gap-2">
            {['ALL', 'NOT_ADDED', 'INVITED', 'ADDED', 'DECLINED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors font-mono ${
                  statusFilter === st ? 'bg-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
          />
        </div>

        {/* Attendees List */}
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {filteredAttendees.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No matching delegates found.</div>
          ) : (
            filteredAttendees.map((att) => {
              const currentStatus = att.whatsappStatus || 'NOT_ADDED';
              const waUrl = getInviteUrl(att.phone, att.name);

              return (
                <div key={att.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{att.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        att.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {att.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{att.phone} &middot; {att.email} &middot; {att.city}</p>
                    <p className="text-xs text-slate-600">{att.churchName || att.organisation || 'Independent'}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Send WhatsApp Invite Button */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markStatus(att.id, 'INVITED')}
                      className="bg-[#25D366] text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Send size={14} /> Invite on WhatsApp
                    </a>

                    {/* Status Toggle Buttons */}
                    {currentStatus !== 'ADDED' ? (
                      <button
                        onClick={() => markStatus(att.id, 'ADDED')}
                        className="border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 font-semibold text-xs px-3 py-2 rounded-lg transition-colors"
                      >
                        Mark Added
                      </button>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1">
                        <CheckCircle2 size={14} /> Added
                      </span>
                    )}

                    {currentStatus !== 'DECLINED' && (
                      <button
                        onClick={() => markStatus(att.id, 'DECLINED')}
                        className="text-slate-400 hover:text-rose-600 text-xs px-2 py-2"
                      >
                        Declined
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
