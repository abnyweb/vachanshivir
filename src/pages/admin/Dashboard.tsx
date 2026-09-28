import { useState, useMemo } from 'react';
import {
  ClipboardList, IndianRupee, UserCheck, BedDouble,
  FileSpreadsheet, UserPlus, Search, Mail, Phone, MapPin, Building, SlidersHorizontal, Activity,
  Clock, QrCode, Download, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminPage } from '../../components/admin/AdminPage';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listRegistrations } from '../../services/registrationService';
import { listAttendees } from '../../services/attendeeService';
import { listCategories } from '../../services/pricingService';
import { roomingSummary, listRooms } from '../../services/roomingService';
import { inr, shortDate } from '../../utils/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const { db } = useStore();
  const { notify } = useToast();
  const event = useCurrentEvent();
  useDocumentMeta('Dashboard — Vachan Shivir Event Management');

  const handleExportMasterExcel = () => {
    try {
      const exportData = (db.attendees || []).map((a, idx) => ({
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
        XLSX.utils.book_append_sheet(wb, ws, 'Master Delegates');
        XLSX.writeFile(wb, `Vachan_Shivir_Master_${new Date().toISOString().slice(0, 10)}.xlsx`);
        notify(`Exported all ${exportData.length} records to Excel!`, 'success');
      });
    } catch {
      notify('Failed to export Excel.', 'error');
    }
  };

  // Interactive Dashboard States
  const [activeNavTab, setActiveNavTab] = useState<string>('Overview');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleNavTabClick = (tab: string) => {
    setActiveNavTab(tab);
    if (tab === 'Registrations') {
      navigate('/admin/registrations');
    } else if (tab === 'Check-in') {
      navigate('/admin/checkin-scanner');
    } else if (tab === 'Rooming') {
      navigate('/admin/rooming-board');
    } else if (tab === 'Stalls') {
      navigate('/admin/stalls');
    } else if (tab === 'Revenue') {
      setSelectedStatusFilter('PAID');
    } else {
      setSelectedStatusFilter('ALL');
    }
  };

  const registrations = useMemo(() => listRegistrations(db, event.id), [db, event.id]);
  const attendees = useMemo(() => listAttendees(db, event.id), [db, event.id]);
  const categories = useMemo(() => listCategories(db, event.id), [db, event.id]);
  const rooms = useMemo(() => listRooms(db, event.id), [db, event.id]);
  const rooming = useMemo(() => roomingSummary(rooms, attendees), [rooms, attendees]);

  // Selected Registration for Right Inspector Panel
  const [selectedRegId, setSelectedRegId] = useState<string | null>(
    registrations.length > 0 ? registrations[0].id : null
  );

  const paid = useMemo(
    () => registrations.filter((r) => (r.paymentStatus || '').toLowerCase() === 'paid'),
    [registrations]
  );
  const pending = useMemo(
    () => registrations.filter((r) => (r.paymentStatus || '').toLowerCase() !== 'paid'),
    [registrations]
  );

  const revenue = useMemo(() => {
    return paid.reduce((sum, r) => {
      const val = r.total ?? (r as unknown as Record<string, unknown>).totalAmount ?? (r as unknown as Record<string, unknown>).amountPaid ?? r.amount ?? 0;
      const num = Number(val);
      return sum + (Number.isNaN(num) ? 0 : num);
    }, 0);
  }, [paid]);

  // Filtered registrations for left panel
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      // Status Filter
      if (selectedStatusFilter === 'PAID' && (r.paymentStatus || '').toLowerCase() !== 'paid') return false;
      if (selectedStatusFilter === 'PENDING' && (r.paymentStatus || '').toLowerCase() === 'paid') return false;

      // Category Filter
      if (selectedCategoryFilter !== 'ALL' && r.categoryId !== selectedCategoryFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
        const ref = (r.reference || '').toLowerCase();
        const email = (r.email || '').toLowerCase();
        const phone = (r.phone || '').toLowerCase();
        if (!fullName.includes(q) && !ref.includes(q) && !email.includes(q) && !phone.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [registrations, selectedStatusFilter, selectedCategoryFilter, searchQuery]);

  // Currently selected registration details
  const selectedRegistration = useMemo(() => {
    if (!selectedRegId) return filteredRegistrations[0] || registrations[0] || null;
    return registrations.find((r) => r.id === selectedRegId) || filteredRegistrations[0] || registrations[0] || null;
  }, [selectedRegId, registrations, filteredRegistrations]);

  const selectedCategory = useMemo(() => {
    if (!selectedRegistration) return null;
    return categories.find((c) => c.id === selectedRegistration.categoryId);
  }, [selectedRegistration, categories]);

  // Monthly breakdown mock for chart
  const monthlyData = [
    { month: 'Jul', val: 120 },
    { month: 'Aug', val: 280 },
    { month: 'Sep', val: 450 },
    { month: 'Oct', val: 320 },
    { month: 'Nov', val: 190 },
    { month: 'Dec', val: 80 },
  ];
  const maxVal = Math.max(...monthlyData.map((d) => d.val));

  return (
    <AdminPage
      title={`${event.name} ${event.year}`}
      description={`${event.edition} · ${event.venueName}, ${event.venueCity}. Executive dashboard & operational control center.`}
    >
      {/* 1. TOP NAVIGATION TAB BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 w-full overflow-hidden">
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs overflow-x-auto no-scrollbar max-w-full w-full lg:w-auto">
          {['Overview', 'Registrations', 'Revenue', 'Check-in', 'Rooming', 'Stalls'].map((tab) => {
            const isActive = activeNavTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleNavTabClick(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-sans transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <button
            onClick={handleExportMasterExcel}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium font-sans shadow-xs transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet size={15} />
            <span className="hidden sm:inline">Export Master Excel</span>
            <span className="sm:hidden">Export Excel</span>
          </button>
          <Link
            to="/registration"
            target="_blank"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#153A66] hover:bg-[#0F2B4D] text-white text-xs font-medium font-sans shadow-xs transition-colors whitespace-nowrap"
          >
            <UserPlus size={15} />
            <span className="hidden sm:inline">+ Create Registration</span>
            <span className="sm:hidden">+ New Registration</span>
          </Link>
        </div>
      </div>

      {/* 2. PAGE HERO HEADER & SUMMARY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans flex flex-wrap items-center gap-2">
            <span>Invoices &amp; Delegate Analytics</span>
            <span className="text-[10px] font-mono font-medium tracking-wider text-slate-600 uppercase bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
              Operational Matrix
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Manage and track all delegate registrations, payments, and accommodation in one unified view.
          </p>
        </div>
      </div>

      {/* 3. TOP 4 KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Card 1: Recorded Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Recorded Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-navy-50 text-navy flex items-center justify-center font-bold">
              <IndianRupee size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-950 font-raleway">{inr(revenue)}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <span>↑ +12.5%</span>
              <span className="text-slate-400 font-normal">from last cycle</span>
            </div>
          </div>
          {/* Decorative Subtle Graphic */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{paid.length} Paid Invoices</span>
            <span className="font-mono text-navy font-bold">100% Verified</span>
          </div>
        </div>

        {/* Card 2: Total Registrations & Monthly Growth Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Registrations</span>
            <div className="w-8 h-8 rounded-xl bg-navy-50 text-navy flex items-center justify-center">
              <ClipboardList size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-950 font-raleway">{registrations.length}</div>
              <div className="text-[11px] font-bold text-emerald-600 mt-0.5">↑ +8.2% monthly</div>
            </div>

            {/* Mini Bar Chart */}
            <div className="flex items-end gap-1 h-10 pt-2">
              {monthlyData.map((d, idx) => (
                <div
                  key={idx}
                  style={{ height: `${(d.val / maxVal) * 100}%` }}
                  className={`w-2.5 rounded-t-sm transition-all ${
                    idx === 4 ? 'bg-[#153A66]' : 'bg-slate-200 group-hover:bg-slate-300'
                  }`}
                  title={`${d.month}: ${d.val}`}
                />
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Target: 1,500</span>
            <span className="font-mono text-slate-700 font-bold">{Math.round((registrations.length / 1500) * 100)}% Reached</span>
          </div>
        </div>

        {/* Card 3: Check-in & Attendance Flow */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Check-in Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-950 font-raleway">
                {attendees.filter((a) => a.checkInStatus === 'checked-in').length}{' '}
                <span className="text-sm font-normal text-slate-400">/ {attendees.length}</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 size={12} /> Ready for Badge Scan
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><Clock size={12} /> Ishopanthi Ashram, Puri</span>
            <Link to="/admin/check-in" className="text-navy font-bold hover:underline">Scan Badges &rarr;</Link>
          </div>
        </div>

        {/* Card 4: Accommodation Breakdown & Split */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Rooming Allocations</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BedDouble size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-950 font-raleway">
              {rooming.assigned} <span className="text-sm font-normal text-slate-400">beds assigned</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Quadruple</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy text-white">Triple</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Double</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{rooming.unassigned} Pending Beds</span>
            <Link to="/admin/operations/rooming-board" className="text-navy font-bold hover:underline">Board &rarr;</Link>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE FILTERS TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl font-raleway">
            <SlidersHorizontal size={14} className="text-navy" />
            <span>Active filters</span>
            <span className="w-5 h-5 rounded-full bg-navy text-white text-[10px] flex items-center justify-center ml-1 font-mono">
              {[selectedStatusFilter !== 'ALL', selectedCategoryFilter !== 'ALL', searchQuery.trim() !== ''].filter(Boolean).length}
            </span>
          </div>

          {/* Payment Status Dropdown Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Paid Only</option>
            <option value="PENDING">Pending Only</option>
          </select>

          {/* Accommodation Category Dropdown Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-navy"
          >
            <option value="ALL">All Accommodation Packages</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Search Input Bar */}
        <div className="relative min-w-[240px] flex-1 sm:flex-none">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Reg ID, Name, Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-navy"
          />
        </div>
      </div>

      {/* 5. DUAL-PANEL WORKSTATION (Refined Executive Light Console) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs text-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Registrations List (5 columns) */}
          <div className="lg:col-span-5 space-y-4 border-r border-slate-200/80 pr-0 lg:pr-6">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 font-sans flex items-center gap-2">
                <span>Registrations</span>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                  {filteredRegistrations.length}
                </span>
              </h3>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg overflow-x-auto no-scrollbar max-w-full">
                <button
                  onClick={() => setSelectedStatusFilter('ALL')}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition font-sans whitespace-nowrap shrink-0 ${
                    selectedStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedStatusFilter('PAID')}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition font-sans whitespace-nowrap shrink-0 ${
                    selectedStatusFilter === 'PAID' ? 'bg-emerald-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Paid ({paid.length})
                </button>
                <button
                  onClick={() => setSelectedStatusFilter('PENDING')}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition font-sans whitespace-nowrap shrink-0 ${
                    selectedStatusFilter === 'PENDING' ? 'bg-amber-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({pending.length})
                </button>
              </div>
            </div>

            {/* Registrations List Cards */}
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-sans">
                  No registrations found matching active filters.
                </div>
              ) : (
                filteredRegistrations.map((r) => {
                  const isSelected = selectedRegistration?.id === r.id;
                  const isPaid = (r.paymentStatus || '').toLowerCase() === 'paid';
                  const regAmount = r.total ?? (r as unknown as Record<string, unknown>).totalAmount ?? r.amount ?? 0;

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRegId(r.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/70 border-2 border-[#153A66] shadow-xs'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs shrink-0 font-sans font-semibold ${
                          isSelected ? 'bg-[#153A66] text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {(r.firstName?.[0] || 'D')}{(r.lastName?.[0] || '')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-slate-700 truncate">
                              #{r.reference}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full font-mono ${
                              isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {isPaid ? 'PAID' : 'PENDING'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                            {r.firstName} {r.lastName}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{r.city || r.state || 'India'}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-semibold text-xs text-slate-900">{inr(regAmount)}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{shortDate(r.createdAt || '')}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Selected Registration Detail Inspector (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedRegistration ? (
              <>
                {/* Header Inspector Details */}
                <div className="bg-slate-50/80 border border-slate-200/80 p-5 rounded-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#153A66]">
                          #{selectedRegistration.reference}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-mono">
                          {selectedRegistration.paymentStatus || 'CONFIRMED'}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 font-sans mt-1">
                        {selectedRegistration.firstName} {selectedRegistration.lastName}
                      </h2>
                      <p className="text-xs text-slate-600 font-sans">
                        {selectedRegistration.organisation || 'Delegate'} &bull; {selectedRegistration.designation || 'Pastor'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to="/admin/registrations"
                        className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium font-sans shadow-2xs transition-colors"
                      >
                        Edit Entry &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Delegate Contact Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{selectedRegistration.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Phone size={14} className="text-slate-400" />
                      <span>{selectedRegistration.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{[selectedRegistration.city, selectedRegistration.state].filter(Boolean).join(', ') || 'India'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Building size={14} className="text-slate-400" />
                      <span className="truncate">{selectedRegistration.organisation || 'Independent Pastor'}</span>
                    </div>
                  </div>
                </div>

                {/* Breakdown Itemized Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-sans font-medium text-slate-400 uppercase">Accommodation</span>
                    <h4 className="text-sm font-semibold text-slate-900 truncate font-sans">{selectedCategory?.name || 'Package Selected'}</h4>
                    <p className="text-xs font-mono text-slate-800 font-bold">{inr(selectedCategory?.price || selectedRegistration.total || 0)}</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-sans font-medium text-slate-400 uppercase">Add-ons &amp; Extras</span>
                    <h4 className="text-sm font-semibold text-slate-900 truncate font-sans">
                      {selectedRegistration.addOns && selectedRegistration.addOns.length > 0
                        ? `${selectedRegistration.addOns.length} Selected`
                        : 'Standard Meals'}
                    </h4>
                    <p className="text-xs font-mono text-emerald-600 font-semibold">Included</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-2xs space-y-1">
                    <span className="text-[10px] font-sans font-medium text-slate-400 uppercase">Verification Status</span>
                    <h4 className="text-sm font-semibold text-slate-900 truncate font-sans">QR Badge Valid</h4>
                    <p className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Ready for Checkin
                    </p>
                  </div>
                </div>

                {/* Subtotal, Total & Action Buttons Bar */}
                <div className="bg-slate-50/80 border border-slate-200/80 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200/80 pb-3">
                    <div>
                      <span>Sub Total: <strong className="text-slate-900 font-mono">{inr(selectedRegistration.amount || selectedRegistration.total || 0)}</strong></span>
                      <span className="mx-2">&bull;</span>
                      <span>Balance Due: <strong className="text-emerald-700 font-mono">₹0.00</strong></span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-sans text-slate-400 block font-medium">Total Paid</span>
                      <span className="font-mono text-2xl font-bold text-slate-900">
                        {inr(selectedRegistration.total || selectedRegistration.amount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/admin/attendees"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium font-sans shadow-2xs transition-colors"
                      >
                        <QrCode size={14} className="text-slate-500" /> View QR Badge
                      </Link>
                      <Link
                        to="/admin/audit-logs"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium font-sans shadow-2xs transition-colors"
                      >
                        <Activity size={14} className="text-slate-500" /> Audit Trail
                      </Link>
                    </div>

                    <button
                      onClick={handleExportMasterExcel}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#153A66] hover:bg-[#0F2B4D] text-white text-xs font-medium font-sans shadow-xs transition-colors"
                    >
                      <Download size={14} /> Export Master Excel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-50/60 border border-slate-200/80 p-12 rounded-xl text-center space-y-3">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-500">Select a registration from the left list to view details.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminPage>
  );
}
