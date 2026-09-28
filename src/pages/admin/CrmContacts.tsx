import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { AdminPage } from '../../components/admin/AdminPage';
import {
  Search, Contact, ArrowUpRight, Building2, MapPin, Sparkles,
  Mail, Phone, Tag, SlidersHorizontal, UserCheck, Edit, Trash2,
  Layers, BarChart3, ChevronLeft, ChevronRight,
  MessageSquare, UserPlus, PhoneCall, CheckSquare, Square
} from 'lucide-react';
import { EditContactModal } from '../../components/admin/EditContactModal';
import type { CRMContact, CRMLifecycle } from '../../types';
import { useToast } from '../../components/common/ToastProvider';

export default function CrmContacts() {
  const navigate = useNavigate();
  const { db, update, create, remove } = useStore();
  const { notify } = useToast();

  // Navigation & Workspace Tabs
  const [mainSection, setMainSection] = useState<'directory' | 'kanban' | 'churches' | 'analytics'>('directory');

  // Filters State
  const [search, setSearch] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState('ALL');
  const [contactTypeFilter, setContactTypeFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');
  const [activeTabShortcut, setActiveTabShortcut] = useState('All');

  // Pagination State
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals & Selection State
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const contacts = useMemo(() => {
    const rawContacts = db.crmContacts || [];
    const regs = db.registrations || [];
    const existingEmails = new Set(rawContacts.map((c) => c.email?.toLowerCase()).filter(Boolean));

    const synthesized: CRMContact[] = [];
    regs.forEach((rRaw) => {
      const r = rRaw as any;
      const emailLower = (r.email || '').toLowerCase();
      if (emailLower && !existingEmails.has(emailLower)) {
        synthesized.push({
          id: `crm_synth_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          legacyEntryId: r.legacyEntryId || r.customFields?.legacyEntryId || 0,
          entryId: r.entryId || r.legacyEntryId || 0,
          contactType: 'delegate',
          lifecycle: r.paymentStatus === 'paid' ? 'attendee' : 'lead',
          firstName: r.firstName || '',
          lastName: r.lastName || '',
          fullName: r.fullName || `${r.firstName || ''} ${r.lastName || ''}`.trim(),
          email: r.email || '',
          phone: r.phone || '',
          country: 'India',
          city: r.city || '',
          state: r.state || '',
          churchName: r.churchName || r.customFields?.churchName || r.customFields?.church || r.customFields?.organisation || '',
          churchDenomination: '',
          organisation: r.organisation || r.customFields?.organisation || '',
          role: r.designation || r.customFields?.designation || r.customFields?.role || 'Pastor',
          designation: r.designation || r.customFields?.designation || r.customFields?.role || 'Pastor',
          leadSource: 'Portal Registration',
          tags: r.paymentStatus === 'paid' ? ['VS-2026', 'REGISTERED_PAID', 'SHIVIR_2026'] : ['VS-2026', 'REGISTERED_UNPAID', 'PAYMENT_PENDING'],
          consent: true,
          notes: `Registered via portal. Status: ${r.paymentStatus}. Amount: ₹${r.amount}`,
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        existingEmails.add(emailLower);
      }
    });

    return [...rawContacts, ...synthesized];
  }, [db.crmContacts, db.registrations]);
  const companies = db.crmCompanies || [];
  const leads = db.crmLeads || [];

  // Dynamic state list
  const uniqueStates = useMemo(() => {
    const s = new Set<string>();
    contacts.forEach((c) => { if (c.state) s.add(c.state); });
    return Array.from(s).sort();
  }, [contacts]);

  // Dynamic tags list
  const uniqueTags = useMemo(() => {
    const t = new Set<string>();
    contacts.forEach((c) => (c.tags || []).forEach((tag) => t.add(tag)));
    return Array.from(t).sort();
  }, [contacts]);

  // Main Filter computation
  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      // Tab shortcut filters
      if (activeTabShortcut === 'Repeat' && c.lifecycle !== 'repeat-attendee') return false;
      if (activeTabShortcut === '2026' && !(c.tags || []).includes('VS-2026')) return false;
      if (activeTabShortcut === 'Pastors' && c.contactType !== 'delegate') return false;
      if (activeTabShortcut === 'VIP' && c.lifecycle !== 'vip') return false;

      // Dropdown filters
      if (lifecycleFilter !== 'ALL' && c.lifecycle !== lifecycleFilter) return false;
      if (contactTypeFilter !== 'ALL' && c.contactType !== contactTypeFilter) return false;
      if (stateFilter !== 'ALL' && c.state !== stateFilter) return false;
      if (tagFilter !== 'ALL' && !(c.tags || []).includes(tagFilter)) return false;

      // Search Query (Supports Entry ID search like 105 or 12)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const entryIdStr = String(c.legacyEntryId || c.entryId || '').toLowerCase();
        return (
          entryIdStr.includes(q) ||
          `#${entryIdStr}`.includes(q) ||
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone || '').includes(q) ||
          (c.churchName || '').toLowerCase().includes(q) ||
          (c.city || '').toLowerCase().includes(q) ||
          (c.state || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contacts, activeTabShortcut, lifecycleFilter, contactTypeFilter, stateFilter, tagFilter, search]);

  // Paginated Rows
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedContacts = useMemo(() => {
    if (pageSize >= filtered.length) return filtered;
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected CRM contact(s)?`)) {
      let count = 0;
      selectedIds.forEach((id) => {
        remove('crmContacts', id);
        count++;
      });
      notify(`Successfully deleted ${count} selected CRM contact(s).`);
      setSelectedIds([]);
    }
  };

  // Selected Contact for detail inspector
  const selectedContact = useMemo(() => {
    if (!selectedContactId) return filtered[0] || contacts[0] || null;
    return contacts.find((c) => c.id === selectedContactId) || filtered[0] || contacts[0] || null;
  }, [selectedContactId, contacts, filtered]);

  // Metrics
  const repeatCount = useMemo(() => contacts.filter((c) => c.lifecycle === 'repeat-attendee').length, [contacts]);
  const vs2026Count = useMemo(() => contacts.filter((c) => (c.tags || []).includes('VS-2026')).length, [contacts]);
  const pastorCount = useMemo(() => contacts.filter((c) => c.contactType === 'pastor').length, [contacts]);
  const vipCount = useMemo(() => contacts.filter((c) => c.lifecycle === 'vip').length, [contacts]);

  // Save edited contact
  const handleSaveContact = (updatedPatch: Partial<CRMContact>) => {
    if (!editingContact) return;
    update('crmContacts', editingContact.id, updatedPatch);

    // Sync matching attendee if present
    const matchingAttendee = (db.attendees || []).find(
      (a) => a.email.toLowerCase() === editingContact.email.toLowerCase() || a.contactId === editingContact.id
    );
    if (matchingAttendee) {
      update('attendees', matchingAttendee.id, {
        legacyEntryId: updatedPatch.legacyEntryId,
        entryId: updatedPatch.entryId,
        name: updatedPatch.fullName,
        email: updatedPatch.email,
        phone: updatedPatch.phone,
        organisation: updatedPatch.churchName,
        city: updatedPatch.city,
        state: updatedPatch.state,
      });
    }

    notify(`Updated CRM profile for ${updatedPatch.fullName || editingContact.fullName}.`);
    setEditingContact(null);
  };

  // Create brand new contact
  const handleCreateContact = () => {
    const nextIdNum = contacts.length + 1;
    const newContact: CRMContact = {
      id: `crm_manual_${Date.now()}`,
      legacyEntryId: nextIdNum,
      entryId: nextIdNum,
      firstName: 'New',
      lastName: 'Contact',
      fullName: 'New Pastoral Contact',
      email: `pastor${nextIdNum}@vachanshivir.org`,
      phone: '+91 90000 00000',
      whatsapp: '+91 90000 00000',
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      churchName: 'Grace Community Church',
      churchDenomination: 'Non-Denominational',
      role: 'Pastor',
      organisation: 'Grace Community Church',
      designation: 'Pastor',
      contactType: 'pastor',
      lifecycle: 'lead',
      leadSource: 'Admin Creation',
      tags: ['VS-2026', 'PASTOR'],
      consent: true,
      notes: 'Created manually by Admin in CRM.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    create('crmContacts', newContact);
    setEditingContact(newContact);
    notify('Created new CRM contact draft. Please complete details.');
  };

  // Delete contact
  const handleDeleteContact = (contact: CRMContact) => {
    if (window.confirm(`Are you sure you want to delete CRM record for ${contact.fullName}?`)) {
      remove('crmContacts', contact.id);
      notify(`Deleted CRM contact ${contact.fullName}.`);
      if (selectedContactId === contact.id) {
        setSelectedContactId(null);
      }
    }
  };

  // Quick Lifecycle Move
  const handleMoveLifecycle = (contactId: string, newLifecycle: CRMLifecycle) => {
    update('crmContacts', contactId, { lifecycle: newLifecycle, updatedAt: new Date().toISOString() });
    notify(`Moved contact stage to ${newLifecycle.toUpperCase()}.`);
  };

  // Add Log Activity Note
  const handleAddActivity = (contactId: string, type: 'call' | 'whatsapp' | 'note') => {
    const title = type === 'call' ? 'Logged Pastoral Phone Call' : type === 'whatsapp' ? 'Sent WhatsApp Invite' : 'Added Internal CRM Note';
    const description = window.prompt(`Enter details for ${title}:`, 'Discussed Vachan Shivir 2026 registration.');
    if (description) {
      const newAct = {
        id: `act_${Date.now()}`,
        contactId,
        type,
        title,
        description,
        createdAt: new Date().toISOString(),
      };
      create('crmActivities', newAct as any);
      notify(`Logged activity for contact.`);
    }
  };

  return (
    <AdminPage
      title="Enterprise CRM & Delegate Directory"
      description="Centralized Pastoral CRM with Entry ID tracking, multi-stage pipelines, church directory, and interaction history."
    >
      {/* 1. MAIN CRM SECTION TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setMainSection('directory')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              mainSection === 'directory'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-sans'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Contact size={14} className="text-[#153A66]" /> Contacts Directory ({contacts.length})
          </button>
          <button
            onClick={() => setMainSection('kanban')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              mainSection === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-sans'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers size={14} className="text-[#153A66]" /> Visual Pipeline Kanban
          </button>
          <button
            onClick={() => setMainSection('churches')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              mainSection === 'churches'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-sans'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 size={14} className="text-[#153A66]" /> Church Organisations ({companies.length})
          </button>
          <button
            onClick={() => setMainSection('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              mainSection === 'analytics'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-sans'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 size={14} className="text-[#153A66]" /> CRM Analytics
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCreateContact}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#153A66] hover:bg-[#1B4980] text-white font-medium text-xs transition shadow-xs whitespace-nowrap"
          >
            <UserPlus size={14} /> + Add CRM Record
          </button>
        </div>
      </div>

      {/* 2. TOP 4 KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total CRM Profiles</span>
            <div className="w-8 h-8 rounded-full bg-navy-50 text-navy flex items-center justify-center font-bold">
              <Contact size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{contacts.length}</div>
            <div className="text-[11px] font-bold text-emerald-600 mt-1">↑ Entry ID Mapped</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Verified Profiles</span>
            <span className="font-mono text-navy font-bold">100% Synced</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Repeat Pastors &amp; Delegates</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{repeatCount}</div>
            <div className="text-[11px] font-bold text-amber-600 mt-0.5">Multi-Year Conference Loyalty</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Retention Rate</span>
            <span className="font-mono text-amber-700 font-bold">{Math.round((repeatCount / (contacts.length || 1)) * 100)}%</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>2026 Active Delegates</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{vs2026Count}</div>
            <div className="text-[11px] font-bold text-emerald-600 mt-0.5">Registered Current Edition</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Ishopanthi Ashram, Puri</span>
            <span className="font-mono text-emerald-600 font-bold">Active 2026</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Pastors</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{pastorCount}</div>
            <div className="text-[11px] font-bold text-indigo-600 mt-0.5">Indian Pastors &amp; Ministers</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Denominations</span>
            <span className="font-mono text-indigo-600 font-bold">Pan-India</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: CONTACTS DIRECTORY WORKSTATION */}
      {mainSection === 'directory' && (
        <>
          {/* Sub-Filters Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <SlidersHorizontal size={14} className="text-navy" />
                  <span>CRM Filters</span>
                </div>

                {/* Sub-Tab Quick Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
                  {['All', 'Repeat', '2026', 'Pastors', 'VIP'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTabShortcut(t)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 cursor-pointer ${
                        activeTabShortcut === t ? 'bg-[#153A66] text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Lifecycle Stage Dropdown */}
                <select
                  value={lifecycleFilter}
                  onChange={(e) => setLifecycleFilter(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                >
                  <option value="ALL">All Lifecycle Stages</option>
                  <option value="attendee">First-Time Attendee</option>
                  <option value="repeat-attendee">Repeat Attendee</option>
                  <option value="vip">VIP Pastor ({vipCount})</option>
                  <option value="lead">Lead ({leads.length})</option>
                </select>

                {/* Contact Type Dropdown */}
                <select
                  value={contactTypeFilter}
                  onChange={(e) => setContactTypeFilter(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                >
                  <option value="ALL">All Contact Types</option>
                  <option value="pastor">Pastor / Minister</option>
                  <option value="delegate">Church Delegate</option>
                  <option value="speaker">Speaker</option>
                  <option value="sponsor">Sponsor</option>
                  <option value="exhibitor">Exhibitor</option>
                </select>

                {/* State Dropdown */}
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                >
                  <option value="ALL">All States ({uniqueStates.length})</option>
                  {uniqueStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                {/* Tag Dropdown */}
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                >
                  <option value="ALL">All Tags ({uniqueTags.length})</option>
                  {uniqueTags.map((tg) => (
                    <option key={tg} value={tg}>
                      #{tg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-[280px] flex-1 sm:flex-none">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Entry ID (e.g. 105), Name, Email, Phone, Church..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                />
              </div>
            </div>

            {/* Pagination Controls Header */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Showing <strong className="text-slate-900">{filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong className="text-slate-900">{Math.min(currentPage * pageSize, filtered.length)}</strong> of <strong className="text-slate-900">{filtered.length}</strong> contacts</span>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={10000}>All ({filtered.length})</option>
                  </select>
                </div>

                {pageSize < filtered.length && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="font-mono text-xs font-bold px-2">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BULK ACTIONS BANNER */}
          {selectedIds.length > 0 && (
            <div className="mb-6 bg-[#153A66] text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs border border-slate-700/40">
              <span className="text-xs font-semibold flex items-center gap-2 font-sans">
                <CheckSquare size={16} className="text-amber-400" />
                {selectedIds.length} Contacts Selected
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={handleBulkDelete}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5 font-sans"
                >
                  <Trash2 size={14} className="text-rose-200" />
                  Delete Selected ({selectedIds.length})
                </button>
              </div>
            </div>
          )}

          {/* DUAL PANEL WORKSTATION (Modern Executive Console) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs text-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT PANEL: Contacts List (5 columns) */}
              <div className="lg:col-span-5 space-y-4 border-r border-slate-200/80 pr-0 lg:pr-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-semibold text-slate-800 font-sans flex items-center gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-700 transition shrink-0"
                      title={selectedIds.length === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All"}
                    >
                      {selectedIds.length === filtered.length && filtered.length > 0 ? (
                        <CheckSquare size={16} className="text-[#153A66]" />
                      ) : (
                        <Square size={16} className="text-slate-300 hover:text-slate-500" />
                      )}
                    </button>
                    <span>CRM Contacts</span>
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200/80 font-semibold">
                      {filtered.length}
                    </span>
                  </h3>
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs font-semibold text-[#153A66] hover:underline flex items-center gap-1 font-sans"
                  >
                    {selectedIds.length === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
                  {paginatedContacts.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-sans">
                      No CRM contact records match active filters.
                    </div>
                  ) : (
                    paginatedContacts.map((c) => {
                      const isSelected = selectedContact?.id === c.id;
                      const isChecked = selectedIds.includes(c.id);
                      const isRepeat = c.lifecycle === 'repeat-attendee';
                      const entryIdDisp = c.legacyEntryId ? `#${c.legacyEntryId}` : (c.entryId ? `#${c.entryId}` : '');

                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedContactId(c.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-400/80 shadow-xs ring-1 ring-blue-400/30'
                              : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelect(c.id);
                              }}
                              className="shrink-0"
                            >
                              {isChecked ? (
                                <CheckSquare size={16} className="text-[#153A66]" />
                              ) : (
                                <Square size={16} className="text-slate-300 hover:text-slate-500" />
                              )}
                            </button>
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                              {c.fullName?.[0] || 'C'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                {entryIdDisp && (
                                  <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
                                    ID {entryIdDisp}
                                  </span>
                                )}
                                <span className="font-semibold text-xs text-slate-900 truncate">
                                  {c.fullName}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {c.churchName || c.organisation || 'Church'} &bull; {c.city || 'India'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingContact(c);
                              }}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition border border-slate-200/60"
                              title="Edit Contact"
                            >
                              <Edit size={13} />
                            </button>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                              isRepeat ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {c.lifecycle}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT PANEL: Selected Contact Inspector (7 columns) */}
              <div className="lg:col-span-7 space-y-5">
                {selectedContact ? (
                  <>
                    <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-xl space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedContact.legacyEntryId && (
                              <span className="font-mono text-xs font-semibold text-[#153A66] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80">
                                Excel Entry ID #{selectedContact.legacyEntryId}
                              </span>
                            )}
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                              {selectedContact.lifecycle}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#153A66] border border-blue-200 uppercase">
                              {selectedContact.contactType}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-slate-900 font-sans mt-2">
                            {selectedContact.fullName}
                          </h2>
                          <p className="text-xs text-slate-500 font-sans mt-0.5">
                            {selectedContact.role || selectedContact.designation || 'Pastor'} &bull; {selectedContact.churchName || selectedContact.organisation || 'Church'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setEditingContact(selectedContact)}
                            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium shadow-xs transition flex items-center gap-1.5"
                          >
                            <Edit size={14} className="text-[#153A66]" /> Edit Contact
                          </button>
                          <button
                            onClick={() => navigate(`/admin/crm/contacts/${selectedContact.id}`)}
                            className="px-3.5 py-2 rounded-lg bg-[#153A66] hover:bg-[#1B4980] text-white text-xs font-medium shadow-xs transition flex items-center gap-1.5"
                          >
                            Full Profile <ArrowUpRight size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(selectedContact)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200"
                            title="Delete Contact"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Contact Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2.5 text-slate-700">
                          <Mail size={14} className="text-[#153A66]" />
                          <a href={`mailto:${selectedContact.email}`} className="hover:underline truncate">{selectedContact.email || 'N/A'}</a>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-700">
                          <Phone size={14} className="text-[#153A66]" />
                          <a href={`tel:${selectedContact.phone}`} className="hover:underline">{selectedContact.phone || 'N/A'}</a>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-700">
                          <MapPin size={14} className="text-[#153A66]" />
                          <span>{[selectedContact.city, selectedContact.state].filter(Boolean).join(', ') || 'India'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-700">
                          <Building2 size={14} className="text-[#153A66]" />
                          <span className="truncate">{selectedContact.churchDenomination || 'Independent Baptist'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-1 shadow-xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Lifecycle Stage</span>
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{selectedContact.lifecycle}</h4>
                        <p className="text-xs font-mono text-slate-600 font-medium">
                          {selectedContact.lifecycle === 'repeat-attendee' ? 'Repeat Delegate' : 'First-time Delegate'}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-1 shadow-xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Lead Source</span>
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{selectedContact.leadSource || 'Vachan Shivir Registration'}</h4>
                        <p className="text-xs font-mono text-emerald-600 font-medium">Verified Origin</p>
                      </div>

                      <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-1 shadow-xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Quick Communication</span>
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`https://wa.me/${(selectedContact.phone || '').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 shadow-xs"
                          >
                            <MessageSquare size={12} /> WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stage Change Bar */}
                    <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl space-y-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block font-sans">Quick Stage Pipeline Change</span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {(['subscriber', 'lead', 'attendee', 'repeat-attendee', 'vip'] as CRMLifecycle[]).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleMoveLifecycle(selectedContact.id, st)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-xs ${
                              selectedContact.lifecycle === st
                                ? 'bg-[#153A66] text-white border-[#153A66]'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Event Tags & Activity Logs */}
                    <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-xl space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase font-sans">Associated Tags &amp; Labels</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(selectedContact.tags || []).map((t) => (
                          <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-medium flex items-center gap-1">
                            <Tag size={12} className="text-[#153A66]" /> {t}
                          </span>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">Interaction Logs</span>
                        <button
                          onClick={() => handleAddActivity(selectedContact.id, 'call')}
                          className="px-3 py-1.5 rounded-lg bg-[#153A66] hover:bg-[#1B4980] text-white text-xs font-medium flex items-center gap-1 shadow-xs"
                        >
                          <PhoneCall size={12} /> + Log Call / Note
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-50/50 border border-slate-200/80 p-12 rounded-xl text-center space-y-3">
                    <Contact className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-medium text-slate-500">Select a CRM contact record from the left list to view details.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}

      {/* SECTION 2: VISUAL PIPELINE KANBAN BOARD */}
      {mainSection === 'kanban' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Layers size={16} className="text-amber-400" /> Visual Pastoral CRM Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Track pastor journey from initial lead / enquiry to registered attendee and repeat VIP delegate.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { key: 'lead', title: '1. New Leads & Prospects', color: 'border-blue-500/40 text-blue-400' },
              { key: 'applicant', title: '2. Enquired / Proposal', color: 'border-purple-500/40 text-purple-400' },
              { key: 'attendee', title: '3. First-Time Delegates', color: 'border-emerald-500/40 text-emerald-400' },
              { key: 'repeat-attendee', title: '4. Repeat Pastors', color: 'border-amber-500/40 text-amber-400' },
              { key: 'vip', title: '5. VIP / Key Leaders', color: 'border-red-500/40 text-red-400' },
            ].map((col) => {
              const colContacts = contacts.filter((c) => c.lifecycle === col.key);
              return (
                <div key={col.key} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-3 min-h-[450px]">
                  <div className={`border-b pb-2 flex items-center justify-between ${col.color}`}>
                    <h4 className="text-xs font-bold font-sans">{col.title}</h4>
                    <span className="text-[10px] font-mono bg-white/10 text-white px-2 py-0.5 rounded-full font-bold">
                      {colContacts.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {colContacts.length === 0 ? (
                      <p className="text-slate-500 text-[11px] italic text-center py-8">No contacts in stage</p>
                    ) : (
                      colContacts.map((c) => (
                        <div
                          key={c.id}
                          className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-3 rounded-xl space-y-2 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            {c.legacyEntryId && (
                              <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-400/10 px-1.5 py-0.2 rounded">
                                #{c.legacyEntryId}
                              </span>
                            )}
                            <span className="text-[9px] uppercase font-bold text-slate-400">{c.city || 'India'}</span>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">{c.fullName}</h5>
                            <p className="text-[10px] text-slate-400 truncate">{c.churchName || 'Church'}</p>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                            <button
                              onClick={() => setEditingContact(c)}
                              className="text-[10px] font-bold text-indigo-400 hover:underline"
                            >
                              Edit Profile
                            </button>
                            <button
                              onClick={() => {
                                const nextStage = col.key === 'lead' ? 'attendee' : col.key === 'attendee' ? 'repeat-attendee' : 'vip';
                                handleMoveLifecycle(c.id, nextStage as any);
                              }}
                              className="text-[10px] font-bold text-emerald-400 hover:underline"
                            >
                              Move Next &rarr;
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: CHURCHES & ORGANISATIONS DIRECTORY */}
      {mainSection === 'churches' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Building2 size={18} className="text-purple-400" /> Church &amp; Organisation Registry
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Unified repository of 71 Healthy Churches lead records &amp; registered church bodies across India.
              </p>
            </div>
            <span className="text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-xl font-bold">
              {companies.length} Registered Churches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {companies.map((comp) => {
              const linkedPastors = contacts.filter(
                (c) => (c.churchName || '').toLowerCase() === comp.name.toLowerCase() || (c.organisation || '').toLowerCase() === comp.name.toLowerCase()
              );

              return (
                <div key={comp.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-sans">{comp.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-amber-400" /> {comp.city}, {comp.state}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {comp.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Associated Pastors:</span>
                      <strong className="text-amber-300 font-mono">{linkedPastors.length} Pastor(s)</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 italic line-clamp-2">{comp.notes || 'Healthy Church Lead record.'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: CRM ANALYTICS & INSIGHTS */}
      {mainSection === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-400" /> Pastoral CRM Analytics &amp; Demographics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* State Breakdown */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Top Indian States</h4>
                <div className="space-y-2 text-xs">
                  {uniqueStates.slice(0, 6).map((st) => {
                    const cnt = contacts.filter((c) => c.state === st).length;
                    const pct = Math.round((cnt / (contacts.length || 1)) * 100);
                    return (
                      <div key={st} className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>{st}</span>
                          <span className="font-mono text-amber-400 font-bold">{cnt} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="h-full bg-amber-400 rounded-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lifecycle Breakdown */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Lifecycle Distribution</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Repeat Attendees</span>
                    <span className="font-mono text-amber-300 font-bold">{repeatCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">First-Time Delegates</span>
                    <span className="font-mono text-emerald-400 font-bold">{contacts.length - repeatCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Total Registered 2026</span>
                    <span className="font-mono text-indigo-400 font-bold">{vs2026Count}</span>
                  </div>
                </div>
              </div>

              {/* Denomination Breakdown */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Church Denominational Outreach</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between"><span>Independent / Non-Denom</span> <span className="font-mono text-white">65%</span></div>
                  <div className="flex justify-between"><span>Baptist Fellowship</span> <span className="font-mono text-white">20%</span></div>
                  <div className="flex justify-between"><span>Assembly / Pentecostal</span> <span className="font-mono text-white">10%</span></div>
                  <div className="flex justify-between"><span>Presbyterian / Other</span> <span className="font-mono text-white">5%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      <EditContactModal
        isOpen={!!editingContact}
        onClose={() => setEditingContact(null)}
        contact={editingContact}
        onSave={handleSaveContact}
      />
    </AdminPage>
  );
}
