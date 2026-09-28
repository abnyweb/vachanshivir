import { useState, useMemo, useEffect } from 'react';
import {
  Search, CheckSquare, Square, UserCheck, MessageSquare, SlidersHorizontal,
  Mail, Phone, MapPin, Building, FileSpreadsheet, ClipboardList, IndianRupee, Download,
  Edit, Trash2, UserPlus, X, ChevronLeft, ChevronRight, Sparkles, FileText, CheckCircle2, RefreshCw
} from 'lucide-react';
import { AdminPage } from '../../components/admin/AdminPage';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { EditEntryModal } from '../../components/admin/EditEntryModal';
import { AddEntryModal } from '../../components/admin/AddEntryModal';
import type { Attendee, Registration } from '../../types';

export default function AdminRegistrations() {
  const { db, update, create, remove, replace } = useStore();
  const { notify } = useToast();
  useDocumentMeta('Registrations & Entry Matrix — Vachan Shivir Management');

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync with live server API on mount
  useEffect(() => {
    let active = true;
    fetch('/api/snapshot')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.attendees) && data.attendees.length > 0) {
          replace('attendees', data.attendees);
        }
        if (Array.isArray(data.registrations) && data.registrations.length > 0) {
          replace('registrations', data.registrations);
        }
      })
      .catch(() => {
        // Fall back gracefully to active local state
      });
    return () => {
      active = false;
    };
  }, [replace]);

  // Real-time live event notifications for admins
  useEffect(() => {
    const handleCreated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.registration?.fullName) {
        notify(`⚡ Real-Time: ${detail.registration.fullName} (${detail.registration.reference}) just registered!`, 'success');
      }
    };
    const handleUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      notify(`⚡ Real-Time: Entry ${detail?.reference || detail?.id || ''} updated (${detail?.paymentStatus || 'synced'})`, 'info');
    };
    const handleDeleted = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      notify(`⚡ Real-Time: Entry ${detail?.reference || detail?.id || ''} removed`, 'info');
    };

    window.addEventListener('vs:registration_created', handleCreated);
    window.addEventListener('vs:registration_updated', handleUpdated);
    window.addEventListener('vs:registration_deleted', handleDeleted);

    return () => {
      window.removeEventListener('vs:registration_created', handleCreated);
      window.removeEventListener('vs:registration_updated', handleUpdated);
      window.removeEventListener('vs:registration_deleted', handleDeleted);
    };
  }, [notify]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/snapshot');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.attendees) && data.attendees.length > 0) {
          replace('attendees', data.attendees);
        }
        if (Array.isArray(data.registrations) && data.registrations.length > 0) {
          replace('registrations', data.registrations);
        }
        notify(`Synced with server! (${data.attendees?.length || data.registrations?.length || 0} entries)`, 'success');
      } else {
        notify('Loaded from active database state', 'info');
      }
    } catch {
      notify('Loaded from active database state', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filters State
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all');
  const [whatsappFilter, setWhatsappFilter] = useState<string>('all');
  const [checkInFilter, setCheckInFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Pagination State
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals & Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingEntry, setEditingEntry] = useState<Attendee | Registration | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const registrations = useMemo(() => db.registrations || [], [db.registrations]);

  const attendees = useMemo(() => {
    const rawAttendees = db.attendees || [];
    const regs = db.registrations || [];

    // Synthesize any missing attendee records from registrations
    // so every registration (paid, unpaid, failed) is 100% visible
    const existingKeys = new Set<string>();
    rawAttendees.forEach((a) => {
      if (a.id) existingKeys.add(a.id);
      if (a.reference) existingKeys.add(a.reference);
      if (a.registrationId) existingKeys.add(a.registrationId);
      if (a.email) existingKeys.add(a.email.toLowerCase());
    });

    const synthesized: Attendee[] = [];
    regs.forEach((rRaw) => {
      const r = rRaw as any;
      const emailLower = (r.email || '').toLowerCase();
      const isKnown =
        (r.id && existingKeys.has(r.id)) ||
        (r.reference && existingKeys.has(r.reference)) ||
        (emailLower && existingKeys.has(emailLower));

      if (!isKnown) {
        synthesized.push({
          id: r.id || `att_synth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          registrationId: r.id,
          reference: r.reference || `VS-${r.year || 2026}-REG`,
          legacyEntryId: r.legacyEntryId || r.customFields?.legacyEntryId || 0,
          entryId: r.entryId || r.legacyEntryId || 0,
          eventId: r.eventId || 'vs-2026',
          year: r.year || '2026',
          edition: r.edition || '2026',
          name: r.fullName || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Delegate',
          email: r.email || '',
          phone: r.phone || '',
          city: r.city || '',
          state: r.state || '',
          country: r.country || 'India',
          churchName: r.churchName || r.customFields?.churchName || r.customFields?.church || r.customFields?.organisation || '',
          organisation: r.organisation || r.customFields?.organisation || '',
          designation: r.designation || r.customFields?.designation || r.customFields?.role || 'Pastor',
          gender: r.gender || r.customFields?.gender || '',
          age: r.age || r.customFields?.age || null,
          categoryId: r.categoryId || 'full-delegate',
          paymentStatus: r.paymentStatus || 'unpaid',
          checkInStatus: r.checkInStatus || 'not-arrived',
          checkedInAt: null,
          badgeStatus: 'not-generated',
          roomingStatus: 'unassigned',
          roomId: null,
          attendanceIntention: r.attendanceIntention || 'NOT_VERIFIED',
          whatsappStatus: r.whatsappStatus || 'NOT_ADDED',
          isDemo: false,
        });
      }
    });

    return [...rawAttendees, ...synthesized];
  }, [db.attendees, db.registrations]);

  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(
    attendees.length > 0 ? attendees[0].id : null
  );

  // Dynamic States for state filter dropdown
  const uniqueStates = useMemo(() => {
    const statesSet = new Set<string>();
    attendees.forEach((a) => { if (a.state) statesSet.add(a.state); });
    return Array.from(statesSet).sort();
  }, [attendees]);

  // Year Counts Calculation
  const yearCounts = useMemo(() => {
    const getYear = (a: any) => a.year || (a.reference || '').substring(5, 9) || (a.eventId || '').replace('aipc-', '').replace('vs-', '') || '2026';
    const c2026 = attendees.filter((a) => getYear(a) === '2026').length;
    const c2024 = attendees.filter((a) => getYear(a) === '2024').length;
    const c2023 = attendees.filter((a) => getYear(a) === '2023').length;
    return { all: attendees.length, '2026': c2026, '2024': c2024, '2023': c2023 };
  }, [attendees]);

  // Filter computation (Searching by Entry ID, Name, Email, Phone, City, State, Church)
  const filteredRows = useMemo(() => {
    return attendees.filter((a) => {
      // Year Filter
      const attYear = a.year || (a.reference || '').substring(5, 9) || (a.eventId || '').replace('aipc-', '').replace('vs-', '') || '2026';
      if (selectedYear !== 'all' && attYear !== selectedYear) return false;

      // Sub tab shortcut filter
      const payStatusNorm = (a.paymentStatus || '').toLowerCase();
      if (activeSubTab === 'Paid' && payStatusNorm !== 'paid') return false;
      if (activeSubTab === 'Pending' && payStatusNorm === 'paid') return false;
      if (activeSubTab === 'Attending' && a.attendanceIntention !== 'ATTENDING') return false;
      if (activeSubTab === 'WhatsApp' && a.whatsappStatus !== 'ADDED') return false;

      // Dropdown filters
      if (paymentFilter !== 'all' && payStatusNorm !== paymentFilter.toLowerCase()) return false;
      if (categoryFilter !== 'all' && (a.categoryId || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (attendanceFilter !== 'all' && (a.attendanceIntention || 'NOT_VERIFIED') !== attendanceFilter) return false;
      if (whatsappFilter !== 'all' && (a.whatsappStatus || 'NOT_ADDED') !== whatsappFilter) return false;
      if (checkInFilter !== 'all' && (a.checkInStatus || 'not-arrived') !== checkInFilter) return false;
      if (stateFilter !== 'all' && a.state !== stateFilter) return false;

      // Search Query (Supports Entry ID search like 101 or 5)
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const entryIdStr = String(a.legacyEntryId || a.entryId || '').toLowerCase();
        const match = [
          entryIdStr,
          `#${entryIdStr}`,
          `entry #${entryIdStr}`,
          a.reference,
          a.name,
          a.email,
          a.phone,
          a.city,
          a.state,
          a.churchName,
          a.organisation,
          a.year
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [attendees, selectedYear, activeSubTab, paymentFilter, categoryFilter, attendanceFilter, whatsappFilter, checkInFilter, stateFilter, query]);

  // Paginated Rows
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    if (pageSize >= filteredRows.length) return filteredRows;
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Selected Attendee for detail inspector
  const selectedAttendee = useMemo(() => {
    if (!selectedAttendeeId) return filteredRows[0] || attendees[0] || null;
    return attendees.find((a) => a.id === selectedAttendeeId) || filteredRows[0] || attendees[0] || null;
  }, [selectedAttendeeId, attendees, filteredRows]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRows.map((r) => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    if (action === 'VERIFY_ATTENDING') {
      selectedIds.forEach((id) => {
        update('attendees', id, { attendanceIntention: 'ATTENDING', attendanceVerifiedBy: 'Bulk Action' });
      });
      notify(`Updated ${selectedIds.length} delegates as Confirmed Attending.`);
    } else if (action === 'MARK_WHATSAPP_ADDED') {
      selectedIds.forEach((id) => {
        update('attendees', id, { whatsappStatus: 'ADDED' });
      });
      notify(`Marked ${selectedIds.length} delegates as WhatsApp Added.`);
    } else if (action === 'GENERATE_QR') {
      selectedIds.forEach((id) => {
        const token = `chk_tok_${id}_${Date.now()}`;
        update('attendees', id, { checkinToken: token, badgeStatus: 'generated' });
      });
      notify(`Generated QR badges for ${selectedIds.length} delegates.`);
    } else if (action === 'DELETE_SELECTED') {
      if (
        window.confirm(
          `Are you sure you want to delete ${selectedIds.length} selected entry/entries? This action cannot be undone.`
        )
      ) {
        let deletedCount = 0;
        selectedIds.forEach((id) => {
          const attendee = attendees.find((a) => a.id === id);
          if (attendee) {
            remove('attendees', id);
            const matchingReg = registrations.find(
              (r) => r.id === attendee.registrationId || r.reference === attendee.reference || r.id === attendee.id
            );
            if (matchingReg) {
              remove('registrations', matchingReg.id);
            }
            fetch(`/api/registrations?id=${encodeURIComponent(attendee.registrationId || attendee.reference || attendee.id)}`, {
              method: 'DELETE',
            }).catch(() => {});
            deletedCount++;
          }
        });
        notify(`Successfully deleted ${deletedCount} selected entry/entries.`);
      }
    }

    setSelectedIds([]);
  };

  // Save handler for editing entry modal
  const handleSaveEntry = (updatedPatch: any) => {
    if (!editingEntry) return;

    // Update attendee
    update('attendees', editingEntry.id, updatedPatch);

    // Update registration if matching registration exists
    const matchingReg = registrations.find(
      (r) => r.id === (editingEntry as Attendee).registrationId || r.reference === editingEntry.reference || r.id === editingEntry.id
    );
    if (matchingReg) {
      update('registrations', matchingReg.id, updatedPatch);
    }

    // Update matching CRM Contact
    const matchingContact = (db.crmContacts || []).find(
      (c) => c.email?.toLowerCase() === editingEntry.email?.toLowerCase() || c.id === (editingEntry as Attendee).contactId
    );
    if (matchingContact) {
      update('crmContacts', matchingContact.id, {
        legacyEntryId: updatedPatch.legacyEntryId,
        entryId: updatedPatch.entryId,
        firstName: updatedPatch.firstName,
        lastName: updatedPatch.lastName,
        fullName: updatedPatch.name,
        email: updatedPatch.email,
        phone: updatedPatch.phone,
        churchName: updatedPatch.organisation,
        organisation: updatedPatch.organisation,
        role: updatedPatch.designation,
        city: updatedPatch.city,
        state: updatedPatch.state,
      });
    }

    notify(`Successfully updated Entry ID #${updatedPatch.legacyEntryId || editingEntry.reference} (${updatedPatch.name}).`);
    setEditingEntry(null);
  };

  // Add new entry handler
  const handleAddNewEntry = ({ registration, attendee }: any) => {
    create('registrations', registration);
    create('attendees', attendee);
    notify(`Created new Entry ID #${registration.legacyEntryId} for ${registration.firstName} ${registration.lastName}.`);
  };

  // Delete entry handler
  const handleDeleteEntry = (attendee: Attendee) => {
    const entryIdDisp = attendee.legacyEntryId ? `#${attendee.legacyEntryId}` : attendee.reference;
    if (window.confirm(`Are you sure you want to delete Entry ID ${entryIdDisp} (${attendee.name})? This action cannot be undone.`)) {
      remove('attendees', attendee.id);
      const matchingReg = registrations.find((r) => r.id === attendee.registrationId || r.reference === attendee.reference || r.id === attendee.id);
      if (matchingReg) {
        remove('registrations', matchingReg.id);
      }
      fetch(`/api/registrations?id=${encodeURIComponent(attendee.registrationId || attendee.reference || attendee.id)}`, {
        method: 'DELETE',
      }).catch(() => {});
      notify(`Deleted Entry ID ${entryIdDisp}.`);
      if (selectedAttendeeId === attendee.id) {
        setSelectedAttendeeId(null);
      }
    }
  };

  const clearAllFilters = () => {
    setQuery('');
    setPaymentFilter('all');
    setCategoryFilter('all');
    setAttendanceFilter('all');
    setWhatsappFilter('all');
    setCheckInFilter('all');
    setStateFilter('all');
    setActiveSubTab('All');
    setSelectedYear('all');
  };

  const paidCount = useMemo(() => attendees.filter((a) => (a.paymentStatus || '').toLowerCase() === 'paid').length, [attendees]);
  const pendingCount = useMemo(() => attendees.filter((a) => (a.paymentStatus || '').toLowerCase() !== 'paid').length, [attendees]);
  const attendingCount = useMemo(() => attendees.filter((a) => a.attendanceIntention === 'ATTENDING').length, [attendees]);
  const whatsappCount = useMemo(() => attendees.filter((a) => a.whatsappStatus === 'ADDED').length, [attendees]);

  // Mini Chart data
  const monthlyBreakdown = [
    { month: 'Jul', val: 90 },
    { month: 'Aug', val: 210 },
    { month: 'Sep', val: 380 },
    { month: 'Oct', val: 290 },
    { month: 'Nov', val: 140 },
  ];
  const maxVal = Math.max(...monthlyBreakdown.map((d) => d.val));

  const activeFilterCount = [
    paymentFilter !== 'all',
    categoryFilter !== 'all',
    attendanceFilter !== 'all',
    whatsappFilter !== 'all',
    checkInFilter !== 'all',
    stateFilter !== 'all',
    query.trim() !== '',
    selectedYear !== 'all',
  ].filter(Boolean).length;

  const handleExportExcel = () => {
    try {
      const exportData = filteredRows.map((a, idx) => ({
        'S.No': idx + 1,
        'Entry ID': a.legacyEntryId || a.entryId || idx + 1,
        'Reference': a.reference || '',
        'Full Name': a.fullName || a.name || '',
        'Phone': a.phone || '',
        'Email': a.email || '',
        'Age': a.age || '',
        'City': a.city || '',
        'State': a.state || '',
        'Church Name': a.churchName || a.organisation || '',
        'Role / Designation': a.role || a.designation || '',
        'Payment Status': (a.paymentStatus || 'unpaid').toUpperCase(),
        'Attendance Intention': a.attendanceIntention || 'NOT_VERIFIED',
        'WhatsApp Status': a.whatsappStatus || 'NOT_ADDED',
        'Check-In Status': a.checkInStatus || 'not-arrived',
      }));
      import('xlsx').then((XLSX) => {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Delegates');
        XLSX.writeFile(wb, `Vachan_Shivir_Delegates_${new Date().toISOString().slice(0, 10)}.xlsx`);
        notify(`Exported ${filteredRows.length} delegates to Excel!`, 'success');
      });
    } catch {
      notify('Failed to export Excel.', 'error');
    }
  };

  return (
    <AdminPage
      title="All Entries & Operational Matrix"
      description="Full entry management with Excel Entry ID support, instant multi-field filters, and Admin CRUD controls."
    >
      {/* 1. TOP SUB-NAV PILL BAR & YEAR EDITION FILTER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto overflow-hidden">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs overflow-x-auto no-scrollbar max-w-full">
            {['All', 'Paid', 'Pending', 'Attending', 'WhatsApp'].map((tab) => {
              const isActive = activeSubTab === tab;
              const countText =
                tab === 'Paid'
                  ? ` (${paidCount})`
                  : tab === 'Pending'
                  ? ` (${pendingCount})`
                  : tab === 'Attending'
                  ? ` (${attendingCount})`
                  : tab === 'WhatsApp'
                  ? ` (${whatsappCount})`
                  : ` (${attendees.length})`;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-sans transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {tab}{countText}
                </button>
              );
            })}
          </div>

          {/* Edition / Year Pill Dock */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar max-w-full">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 whitespace-nowrap shrink-0">Edition:</span>
            {[
              { label: `All (${yearCounts.all})`, value: 'all' },
              { label: `2026 (${yearCounts['2026']})`, value: '2026' },
              { label: `2024 (${yearCounts['2024']})`, value: '2024' },
              { label: `2023 (${yearCounts['2023']})`, value: '2023' },
            ].map((y) => (
              <button
                key={y.value}
                onClick={() => setSelectedYear(y.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  selectedYear === y.value
                    ? 'bg-[#153A66] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {y.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs" title="Real-time Server-Sent Events stream connected">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            Live Real-Time
          </div>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs transition-colors whitespace-nowrap disabled:opacity-50"
            title="Fetch latest entries from server database"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-amber-600' : 'text-slate-600'} />
            {isSyncing ? 'Syncing...' : 'Sync Server'}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <UserPlus size={15} /> + Add New Entry
          </button>
          <button
            onClick={handleExportExcel}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <FileSpreadsheet size={15} /> Export Filtered Excel ({filteredRows.length})
          </button>
        </div>
      </div>

      {/* 2. TOP 4 KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Card 1: Total Entries */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Excel Submissions</span>
            <div className="w-8 h-8 rounded-xl bg-navy-50 text-navy flex items-center justify-center font-bold">
              <ClipboardList size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-950 font-raleway">{attendees.length}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <span>↑ Entry ID Preserved</span>
              <span className="text-slate-400 font-normal">database entries</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{paidCount} Verified Paid</span>
            <span className="font-mono text-navy font-bold">{Math.round((paidCount / (attendees.length || 1)) * 100)}% Verified</span>
          </div>
        </div>

        {/* Card 2: Payment Pipeline */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Verified Paid Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-950 font-raleway">{paidCount}</div>
              <div className="text-[11px] font-bold text-emerald-600 mt-0.5">₹ Fee Cleared</div>
            </div>
            <div className="flex items-end gap-1 h-10 pt-2">
              {monthlyBreakdown.map((d, idx) => (
                <div
                  key={idx}
                  style={{ height: `${(d.val / maxVal) * 100}%` }}
                  className={`w-2.5 rounded-t-sm transition-all ${
                    idx === 3 ? 'bg-[#153A66]' : 'bg-slate-200'
                  }`}
                  title={`${d.month}: ${d.val}`}
                />
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{pendingCount} Pending Payments</span>
            <span className="font-mono text-amber-600 font-bold">Action Needed</span>
          </div>
        </div>

        {/* Card 3: Attendance Intention */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Attendance Intention</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">
              {attendingCount} <span className="text-sm font-normal text-slate-400">Attending</span>
            </div>
            <div className="text-[11px] font-bold text-indigo-600 mt-0.5 flex items-center gap-1">
              <CheckCircle2 size={12} /> RSVP Confirmed
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Venue: Ishopanthi Ashram, Puri</span>
            <span className="font-mono text-indigo-600 font-bold">Badge Ready</span>
          </div>
        </div>

        {/* Card 4: WhatsApp Onboarding */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>WhatsApp Community</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{whatsappCount}</div>
            <div className="text-[11px] font-bold text-emerald-600 mt-0.5">Added to Official Group</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{attendees.length - whatsappCount} Not Added</span>
            <span className="font-mono text-navy font-bold">Group Sync</span>
          </div>
        </div>
      </div>

      {/* 3. MULTI-FIELD ACTIVE FILTERS TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl font-raleway">
              <SlidersHorizontal size={14} className="text-navy" />
              <span>Multi-Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-navy text-white text-[10px] flex items-center justify-center ml-1 font-mono">
                  {activeFilterCount}
                </span>
              )}
            </div>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">PAID (Verified)</option>
              <option value="pending">UNPAID / PENDING</option>
              <option value="refunded">REFUNDED</option>
            </select>

            {/* Category / Accommodation Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy"
            >
              <option value="all">All Categories</option>
              <option value="cat-eb-quad">Quadruple Sharing</option>
              <option value="cat-eb-triple">Triple Sharing</option>
              <option value="cat-eb-double">Double Sharing</option>
              <option value="cat-eb-day">Day Scholar</option>
            </select>

            {/* RSVP Attendance Filter */}
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy"
            >
              <option value="all">All Attendance Intentions</option>
              <option value="ATTENDING">Attending (Confirmed)</option>
              <option value="NOT_ATTENDING">Not Attending</option>
              <option value="NOT_VERIFIED">Not Verified</option>
            </select>

            {/* State Filter */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy"
            >
              <option value="all">All States ({uniqueStates.length})</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* WhatsApp Filter */}
            <select
              value={whatsappFilter}
              onChange={(e) => setWhatsappFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy"
            >
              <option value="all">All WhatsApp Status</option>
              <option value="ADDED">Group Added</option>
              <option value="INVITED">Invited</option>
              <option value="NOT_ADDED">Not Added</option>
            </select>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-navy hover:underline px-2 py-1 flex items-center gap-1 font-raleway"
              >
                <X size={13} /> Clear Filters
              </button>
            )}
          </div>

          <div className="relative min-w-[280px] flex-1 sm:flex-none">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Entry ID (e.g. 105), Name, Email, Phone, City..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-navy"
            />
          </div>
        </div>

        {/* Pagination Bar Header */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-slate-900">{filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredRows.length)}</strong> of <strong className="text-slate-900">{filteredRows.length}</strong> entries</span>
          </div>

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
                <option value={250}>250</option>
                <option value={10000}>All ({filteredRows.length})</option>
              </select>
            </div>

            {pageSize < filteredRows.length && (
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
        <div className="mb-6 bg-[#153A66] text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm border border-slate-700/40">
          <span className="text-xs font-semibold flex items-center gap-2 font-sans">
            <CheckSquare size={16} className="text-amber-400" />
            {selectedIds.length} Delegates Selected
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleBulkAction('VERIFY_ATTENDING')}
              className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5 font-sans"
            >
              <CheckSquare size={14} /> Verify Attending
            </button>
            <button
              onClick={() => handleBulkAction('MARK_WHATSAPP_ADDED')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5 font-sans"
            >
              <MessageSquare size={14} /> Mark WhatsApp Added
            </button>
            <button
              onClick={() => handleBulkAction('GENERATE_QR')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5 font-sans"
            >
              <Sparkles size={14} /> Generate Badges
            </button>
            <button
              onClick={() => handleBulkAction('DELETE_SELECTED')}
              className="bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5 font-sans"
            >
              <Trash2 size={14} className="text-rose-200" />
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* 4. DUAL-PANEL WORKSTATION (Modern Executive Console) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs text-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Entries List (5 columns) */}
          <div className="lg:col-span-5 space-y-4 border-r border-slate-200/80 pr-0 lg:pr-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-800 font-sans flex items-center gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-slate-700 transition shrink-0"
                  title={selectedIds.length === filteredRows.length && filteredRows.length > 0 ? "Deselect All" : "Select All"}
                >
                  {selectedIds.length === filteredRows.length && filteredRows.length > 0 ? (
                    <CheckSquare size={16} className="text-[#153A66]" />
                  ) : (
                    <Square size={16} className="text-slate-300 hover:text-slate-500" />
                  )}
                </button>
                <span>Excel Delegate Entries</span>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200/80 font-semibold">
                  {filteredRows.length} Entries
                </span>
              </h3>
              <button
                onClick={toggleSelectAll}
                className="text-xs font-semibold text-[#153A66] hover:underline flex items-center gap-1 font-sans"
              >
                {selectedIds.length === filteredRows.length && filteredRows.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {paginatedRows.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-sans">
                  No matching entries found with active filters.
                </div>
              ) : (
                paginatedRows.map((a) => {
                  const isSelected = selectedAttendee?.id === a.id;
                  const isChecked = selectedIds.includes(a.id);
                  const isPaid = (a.paymentStatus || '').toLowerCase() === 'paid';
                  const entryIdDisplay = a.legacyEntryId ? `#${a.legacyEntryId}` : (a.entryId ? `#${a.entryId}` : `#${a.reference}`);

                  return (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAttendeeId(a.id)}
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
                            toggleSelect(a.id);
                          }}
                          className="shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare size={16} className="text-[#153A66]" />
                          ) : (
                            <Square size={16} className="text-slate-300 hover:text-slate-500" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-slate-700 truncate bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80">
                              Entry ID {entryIdDisplay}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {isPaid ? 'PAID' : 'UNPAID'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 truncate mt-1">
                            {a.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{a.churchName || a.organisation || 'Delegate'} &bull; {a.city || 'India'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEntry(a);
                          }}
                          title="Edit Entry Information"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition border border-slate-200/60"
                        >
                          <Edit size={14} />
                        </button>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          a.attendanceIntention === 'ATTENDING' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {a.attendanceIntention || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Selected Delegate Detail Inspector (7 columns) */}
          <div className="lg:col-span-7 space-y-5">
            {selectedAttendee ? (
              <>
                <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-[#153A66] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80">
                          Excel Entry ID #{selectedAttendee.legacyEntryId || selectedAttendee.entryId || (selectedAttendee.reference || '').replace(/\D/g, '')}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          Ref: {selectedAttendee.reference}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase border ${
                          (selectedAttendee.paymentStatus || '').toLowerCase() === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {selectedAttendee.paymentStatus}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 font-sans mt-2">
                        {selectedAttendee.name}
                      </h2>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        {selectedAttendee.churchName || selectedAttendee.organisation || 'Delegate'} &bull; {selectedAttendee.designation || selectedAttendee.role || 'Pastor'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setEditingEntry(selectedAttendee)}
                        className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 border border-slate-200 shadow-xs"
                      >
                        <Edit size={14} className="text-[#153A66]" /> Edit Entry
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(selectedAttendee)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200"
                        title="Delete Entry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Mail size={14} className="text-[#153A66]" />
                      <span className="truncate">{selectedAttendee.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Phone size={14} className="text-[#153A66]" />
                      <span>{selectedAttendee.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <MapPin size={14} className="text-[#153A66]" />
                      <span>{[selectedAttendee.city, selectedAttendee.state].filter(Boolean).join(', ') || 'India'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Building size={14} className="text-[#153A66]" />
                      <span className="truncate">{selectedAttendee.churchName || selectedAttendee.organisation || 'Independent Pastor'}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-1 shadow-xs">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Check-in Status</span>
                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      {selectedAttendee.checkInStatus === 'checked-in' ? 'Checked In' : 'Not Checked In'}
                    </h4>
                    <p className="text-xs font-mono text-emerald-600 font-medium">QR Token Active</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-1 shadow-xs">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">WhatsApp Group</span>
                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      {selectedAttendee.whatsappStatus === 'ADDED' ? 'Added to Group' : 'Not Added'}
                    </h4>
                    <p className="text-xs font-mono text-slate-500 font-medium">Vachan Shivir 2026</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-1 shadow-xs">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Rooming Allocation</span>
                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      {selectedAttendee.roomId || selectedAttendee.roomingGroup ? 'Allocated' : 'Unassigned'}
                    </h4>
                    <p className="text-xs font-mono text-emerald-600 font-medium">Ashram Board</p>
                  </div>
                </div>

                {/* 18-Question Registration Form Responses */}
                <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-xl space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <FileText size={15} className="text-[#153A66]" /> पंजीकरण फ़ॉर्म विवरण (18 Form Responses)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">वचन अध्ययन शिविर 2026</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60">
                      <span className="text-slate-500 block text-[10px] font-medium">Q13. क्या आप अविवाहित हैं?</span>
                      <strong className="text-slate-900 font-semibold">{selectedAttendee.isUnmarried || 'विवरण अनुपलब्ध'}</strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60">
                      <span className="text-slate-500 block text-[10px] font-medium">Q15-16. भोजन में परहेज़</span>
                      <strong className="text-slate-900 font-semibold">
                        {selectedAttendee.hasDietaryRestrictions || 'नहीं'}
                        {selectedAttendee.dietaryDetails ? ` (${selectedAttendee.dietaryDetails})` : ''}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60">
                      <span className="text-slate-500 block text-[10px] font-medium">Q17-18. शैक्षणिक योग्यता</span>
                      <strong className="text-slate-900 font-semibold">
                        {selectedAttendee.educationQualification || 'N/A'}
                        {selectedAttendee.otherEducation ? ` (${selectedAttendee.otherEducation})` : ''}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60">
                      <span className="text-slate-500 block text-[10px] font-medium">Q20-21. कलीसिया में भूमिका</span>
                      <strong className="text-slate-900 font-semibold">
                        {selectedAttendee.role || selectedAttendee.designation || 'N/A'}
                        {selectedAttendee.otherChurchRole ? ` (${selectedAttendee.otherChurchRole})` : ''}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60 sm:col-span-2">
                      <span className="text-slate-500 block text-[10px] font-medium">Q22. प्रचार करने की आवृत्ति</span>
                      <strong className="text-slate-900 font-semibold">{selectedAttendee.preachFrequency || 'N/A'}</strong>
                    </div>

                    {selectedAttendee.testimony && (
                      <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60 sm:col-span-2">
                        <span className="text-slate-500 block text-[10px] font-medium mb-1">Q14. गवाही संक्षेप में</span>
                        <p className="text-slate-800 leading-relaxed italic bg-white p-2.5 rounded border border-slate-200/80">
                          "{selectedAttendee.testimony}"
                        </p>
                      </div>
                    )}

                    {selectedAttendee.trainingExpectations && (
                      <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60 sm:col-span-2">
                        <span className="text-slate-500 block text-[10px] font-medium mb-1">Q23. प्रशिक्षण से अपेक्षाएँ</span>
                        <p className="text-slate-800 leading-relaxed bg-white p-2.5 rounded border border-slate-200/80">
                          {selectedAttendee.trainingExpectations}
                        </p>
                      </div>
                    )}

                    {selectedAttendee.specialNeeds && (
                      <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 sm:col-span-2">
                        <span className="text-amber-800 block text-[10px] font-medium">Q24. विशेष आवश्यकता:</span>
                        <p className="text-amber-900 font-semibold mt-0.5">{selectedAttendee.specialNeeds}</p>
                      </div>
                    )}

                    {selectedAttendee.otherInfo && (
                      <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60 sm:col-span-2">
                        <span className="text-slate-500 block text-[10px] font-medium">Q25. अन्य जानकारी:</span>
                        <p className="text-slate-800 font-medium mt-0.5">{selectedAttendee.otherInfo}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        update('attendees', selectedAttendee.id, {
                          attendanceIntention: selectedAttendee.attendanceIntention === 'ATTENDING' ? 'NOT_VERIFIED' : 'ATTENDING'
                        });
                        notify(`Toggled RSVP status for ${selectedAttendee.name}`);
                      }}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
                    >
                      <UserCheck size={14} className="text-[#153A66]" />
                      Toggle RSVP Attendance &rarr;
                    </button>

                    <button
                      onClick={() => {
                        update('attendees', selectedAttendee.id, { whatsappStatus: 'ADDED' });
                        notify(`Marked ${selectedAttendee.name} as WhatsApp Added.`);
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare size={14} /> Add WhatsApp
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#153A66] hover:bg-[#1B4980] text-white text-xs font-medium transition shadow-xs"
                  >
                    <Download size={14} /> Print / Export Badge
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-slate-50/50 border border-slate-200/80 p-12 rounded-xl text-center space-y-3">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-500">Select a delegate entry from the left list to view details.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit Entry Modal */}
      <EditEntryModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        entry={editingEntry}
        onSave={handleSaveEntry}
      />

      {/* Add Entry Modal */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        nextEntryId={attendees.length + 1}
        onAdd={handleAddNewEntry}
      />
    </AdminPage>
  );
}
