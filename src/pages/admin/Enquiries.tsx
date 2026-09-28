import { useState, useMemo } from 'react';
import { AdminPage } from '../../components/admin/AdminPage';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { ENQUIRY_LABELS, listEnquiries } from '../../services/enquiryService';
import { shortDate } from '../../utils/format';
import type { EnquiryStatus } from '../../types';
import {
  Inbox, Search, Mail, Phone, Building, Clock, SlidersHorizontal, Trash2, CheckCircle2
} from 'lucide-react';

export default function AdminEnquiries() {
  const { db, update, remove } = useStore();
  const { notify } = useToast();
  const event = useCurrentEvent();
  useDocumentMeta('Enquiries — Vachan Shivir Management');

  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [activeTab, setActiveTab] = useState('All');

  const enquiries = listEnquiries(db, event.id);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (activeTab === 'New' && e.status !== 'new') return false;
      if (activeTab === 'In Progress' && e.status !== 'in-progress') return false;
      if (activeTab === 'Resolved' && e.status !== 'resolved' && e.status !== 'closed') return false;

      if (kind !== 'all' && e.kind !== kind) return false;

      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return [e.reference, e.name, e.email, e.organisation, e.message].some((v) => (v || '').toLowerCase().includes(q));
      }
      return true;
    });
  }, [enquiries, activeTab, kind, query]);

  const [selectedId, setSelectedId] = useState<string | null>(
    enquiries.length > 0 ? enquiries[0].id : null
  );

  const selectedEnquiry = useMemo(() => {
    if (!selectedId) return filteredEnquiries[0] || enquiries[0] || null;
    return enquiries.find((e) => e.id === selectedId) || filteredEnquiries[0] || enquiries[0] || null;
  }, [selectedId, enquiries, filteredEnquiries]);

  const newCount = useMemo(() => enquiries.filter((e) => e.status === 'new').length, [enquiries]);
  const progressCount = useMemo(() => enquiries.filter((e) => e.status === 'in-progress').length, [enquiries]);
  const resolvedCount = useMemo(() => enquiries.filter((e) => e.status === 'resolved' || e.status === 'closed').length, [enquiries]);

  return (
    <AdminPage
      title="Communication & Enquiry Queue"
      description="Contact messages, speaker applications, sponsorship and stall enquiries in one unified workstation."
    >
      {/* 1. TOP SUB-NAV PILL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto no-scrollbar max-w-full">
          {['All', 'New', 'In Progress', 'Resolved'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-sans'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab}
                {tab === 'New' && ` (${newCount})`}
                {tab === 'In Progress' && ` (${progressCount})`}
                {tab === 'Resolved' && ` (${resolvedCount})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TOP 4 KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Enquiries</span>
            <div className="w-8 h-8 rounded-full bg-navy-50 text-navy flex items-center justify-center font-bold">
              <Inbox size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{enquiries.length}</div>
            <div className="text-[11px] font-bold text-emerald-600 mt-1">↑ Public Form Submissions</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Queue Status</span>
            <span className="font-mono text-navy font-bold">100% Synced</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>New Unread</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Mail size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{newCount}</div>
            <div className="text-[11px] font-bold text-rose-600 mt-0.5">Requires Response</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Action Needed</span>
            <span className="font-mono text-rose-600 font-bold">High Priority</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>In Progress</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{progressCount}</div>
            <div className="text-[11px] font-bold text-amber-600 mt-0.5">Under Review</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Active Threads</span>
            <span className="font-mono text-amber-700 font-bold">Pending Followup</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Resolved</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{resolvedCount}</div>
            <div className="text-[11px] font-bold text-emerald-600 mt-0.5">Closed Enquiries</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Resolution Rate</span>
            <span className="font-mono text-emerald-700 font-bold">{Math.round((resolvedCount / (enquiries.length || 1)) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE FILTERS TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">
            <SlidersHorizontal size={14} className="text-navy" />
            <span>Active filters</span>
            <span className="w-5 h-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center ml-1">
              {[kind !== 'all', query.trim() !== ''].filter(Boolean).length}
            </span>
          </div>

          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          >
            <option value="all">All Enquiry Types</option>
            {Object.entries(ENQUIRY_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[240px] flex-1 sm:flex-none">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, name, email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />
        </div>
      </div>

      {/* 4. DUAL-PANEL WORKSTATION (Modern Executive Console) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs text-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Enquiry List (5 columns) */}
          <div className="lg:col-span-5 space-y-4 border-r border-slate-200/80 pr-0 lg:pr-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-800 font-sans flex items-center gap-2">
                <span>Enquiry Messages</span>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200/80 font-semibold">
                  {filteredEnquiries.length}
                </span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredEnquiries.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-sans">
                  No enquiries match active filters.
                </div>
              ) : (
                filteredEnquiries.map((e) => {
                  const isSelected = selectedEnquiry?.id === e.id;
                  const isNew = e.status === 'new';

                  return (
                    <div
                      key={e.id}
                      onClick={() => setSelectedId(e.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-400/80 shadow-xs ring-1 ring-blue-400/30'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                          {e.name?.[0] || 'E'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-slate-700 truncate">
                              #{e.reference}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                              isNew ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {e.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                            {e.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{ENQUIRY_LABELS[e.kind] || e.kind}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 text-[10px] text-slate-400">
                        {shortDate(e.createdAt)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Selected Enquiry Detail Inspector (7 columns) */}
          <div className="lg:col-span-7 space-y-5">
            {selectedEnquiry ? (
              <>
                <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#153A66] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                          #{selectedEnquiry.reference}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {ENQUIRY_LABELS[selectedEnquiry.kind] || selectedEnquiry.kind}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 font-sans mt-1">
                        {selectedEnquiry.name}
                      </h2>
                      <p className="text-xs text-slate-500 font-sans">
                        {selectedEnquiry.organisation || 'Independent Enquirer'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedEnquiry.status}
                        onChange={(e) => {
                          update('enquiries', selectedEnquiry.id, { status: e.target.value as EnquiryStatus });
                          notify('Enquiry status updated.');
                        }}
                        className="bg-white border border-slate-300 text-slate-800 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] shadow-xs"
                      >
                        {['new', 'in-progress', 'resolved', 'closed'].map((s) => (
                          <option key={s} value={s}>{s.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Mail size={14} className="text-[#153A66]" />
                      <span className="truncate">{selectedEnquiry.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Phone size={14} className="text-[#153A66]" />
                      <span>{selectedEnquiry.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Building size={14} className="text-[#153A66]" />
                      <span className="truncate">{selectedEnquiry.organisation || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Clock size={14} className="text-[#153A66]" />
                      <span>{shortDate(selectedEnquiry.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-xl space-y-2 shadow-xs">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">Enquiry Message Body</span>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                    {selectedEnquiry.message}
                  </p>
                </div>

                {/* Internal Notes */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-xl space-y-2 shadow-xs">
                  <label htmlFor="internal-notes" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">Internal Admin Notes</label>
                  <textarea
                    id="internal-notes"
                    rows={3}
                    value={selectedEnquiry.notes || ''}
                    onChange={(e) => {
                      update('enquiries', selectedEnquiry.id, { notes: e.target.value });
                    }}
                    placeholder="Add internal notes or follow-up details here..."
                    className="w-full bg-slate-50/70 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                  />
                </div>

                {/* Footer Action */}
                <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 font-mono">Reference #{selectedEnquiry.reference}</span>
                  <button
                    onClick={() => {
                      remove('enquiries', selectedEnquiry.id);
                      setSelectedId(null);
                      notify('Enquiry deleted.');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Delete Enquiry
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-slate-50/50 border border-slate-200/80 p-12 rounded-xl text-center space-y-3">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-500">Select an enquiry from the left list to view details.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminPage>
  );
}

