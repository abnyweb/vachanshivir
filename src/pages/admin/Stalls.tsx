import { useState, useMemo } from 'react';
import { AdminPage } from '../../components/admin/AdminPage';
import { FloorPlan } from '../../components/exhibition/FloorPlan';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { Modal } from '../../components/common/Modal';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listStalls, stallSummary, STALL_STATUSES } from '../../services/stallService';
import { inr } from '../../utils/format';
import { uid } from '../../utils/ids';
import {
  LayoutGrid, IndianRupee, CheckCircle2, Ban, SlidersHorizontal, Search, Store
} from 'lucide-react';
import type { Stall, StallStatus } from '../../types';

export default function AdminStalls() {
  const { db, update, create, remove } = useStore();
  const { notify } = useToast();
  const event = useCurrentEvent();
  useDocumentMeta('Stalls — Vachan Shivir Management');

  const stalls = listStalls(db, event.id);
  const summary = stallSummary(stalls);
  const [selected, setSelected] = useState<Stall | null>(stalls[0] || null);
  const [creating, setCreating] = useState<Stall | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filteredStalls = useMemo(() => {
    return stalls.filter((s) => {
      if (activeTab === 'Available' && s.status !== 'available') return false;
      if (activeTab === 'Confirmed' && (s.status as string) !== 'sold' && s.status !== 'confirmed') return false;
      if (activeTab === 'Blocked' && s.status !== 'blocked') return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return s.number.toLowerCase().includes(q) || s.zone.toLowerCase().includes(q) || s.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [stalls, activeTab, search]);

  function patch(key: keyof Stall, value: unknown) {
    if (!selected) return;
    const next = { ...selected, [key]: value } as Stall;
    setSelected(next);
    update('stalls', selected.id, { [key]: value } as Partial<Stall>);
  }

  return (
    <AdminPage
      title="Exhibition Stalls & Floor Plan"
      description="The interactive exhibition floor plan. Select a stall to update status, price, or assign exhibitors."
    >
      {/* 1. TOP SUB-NAV PILL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto no-scrollbar max-w-full">
          {['All', 'Available', 'Confirmed', 'Blocked'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#153A66] font-semibold shadow-xs border border-slate-200/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {tab === 'All' && <Store className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-[#153A66]" />}
                {tab}
                {tab === 'Available' && ` (${summary.available})`}
                {tab === 'Confirmed' && ` (${summary.sold})`}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setCreating({
            id: uid('stl'), eventId: event.id, number: `A-${stalls.length + 1}`, size: '3m x 2m', type: 'Shell scheme',
            price: 25000, currency: 'INR', zone: 'Foyer', row: 1, column: 1, exhibitorId: null,
            status: 'available', facilities: ['Table', '2 chairs', 'Power point'], isDemo: false,
          })}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#153A66] hover:bg-[#1B4980] text-white font-medium text-xs shadow-xs transition-all whitespace-nowrap cursor-pointer"
        >
          <Store size={15} /> + New Stall
        </button>
      </div>

      {/* 2. TOP 4 KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Stalls</span>
            <div className="w-8 h-8 rounded-full bg-navy-50 text-navy flex items-center justify-center font-bold">
              <LayoutGrid size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{summary.total}</div>
            <div className="text-[11px] font-bold text-emerald-600 mt-1">↑ Floor Plan Active</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Grid Layout</span>
            <span className="font-mono text-navy font-bold">100% Configured</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Available Stalls</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{summary.available}</div>
            <div className="text-[11px] font-bold text-emerald-600 mt-0.5">Ready for Exhibitors</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Available Ratio</span>
            <span className="font-mono text-emerald-700 font-bold">{Math.round((summary.available / (summary.total || 1)) * 100)}%</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Confirmed / Sold</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{summary.sold}</div>
            <div className="text-[11px] font-bold text-indigo-600 mt-0.5">Occupied Stalls</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Exhibitor Allocated</span>
            <span className="font-mono text-indigo-600 font-bold">Active</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Stall Revenue</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <IndianRupee size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-950 font-sans">{inr(summary.revenue)}</div>
            <div className="text-[11px] font-bold text-amber-600 mt-0.5">{summary.blocked} blocked stalls</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Commercial Total</span>
            <span className="font-mono text-amber-700 font-bold">Verified</span>
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
              {[search.trim() !== ''].filter(Boolean).length}
            </span>
          </div>
        </div>

        <div className="relative min-w-[240px] flex-1 sm:flex-none">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search stall number, zone, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />
        </div>
      </div>

      {/* 4. DUAL-PANEL WORKSTATION (Modern Executive Console) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs text-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Floor Plan Map (7 columns) */}
          <div className="lg:col-span-7 space-y-4 border-r border-slate-200/80 pr-0 lg:pr-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-800 font-sans flex items-center gap-2">
                <span>Interactive Floor Plan</span>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200/80 font-semibold">
                  {filteredStalls.length} Stalls
                </span>
              </h3>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 overflow-hidden">
              <FloorPlan stalls={filteredStalls} selectedId={selected?.id} onSelect={setSelected} />
            </div>
          </div>

          {/* RIGHT PANEL: Selected Stall Detail Inspector (5 columns) */}
          <div className="lg:col-span-5 space-y-5">
            {selected ? (
              <>
                <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#153A66]">
                          Stall #{selected.number}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          {selected.status}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 font-sans mt-1">
                        {selected.zone} &bull; {selected.type}
                      </h2>
                      <p className="text-xs text-slate-500 font-sans">
                        Dimensions: {selected.size}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Status</label>
                      <select
                        value={selected.status}
                        onChange={(e) => { patch('status', e.target.value as StallStatus); notify('Stall status updated.'); }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                      >
                        {STALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Assigned Exhibitor</label>
                      <select
                        value={selected.exhibitorId ?? ''}
                        onChange={(e) => { patch('exhibitorId', e.target.value || null); notify('Exhibitor assignment updated.'); }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                      >
                        <option value="">Unassigned</option>
                        {db.exhibitors.map((x) => <option key={x.id} value={x.id}>{x.company}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Price (INR)</label>
                      <input
                        type="number"
                        value={selected.price}
                        onChange={(e) => patch('price', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-mono">
                    <span className="text-slate-500 block">Stall Price</span>
                    <span className="text-lg font-bold text-slate-900">{inr(selected.price)}</span>
                  </div>

                  <button
                    onClick={() => { remove('stalls', selected.id); setSelected(null); notify('Stall deleted.'); }}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <Ban size={14} /> Delete Stall
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-slate-50/50 border border-slate-200/80 p-12 rounded-xl text-center space-y-3">
                <LayoutGrid className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-500">Select a stall on the floor plan map to view details.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <Modal
        open={creating !== null}
        title="New Stall"
        onClose={() => setCreating(null)}
        footer={
          <>
            <Button variant="light" size="sm" onClick={() => setCreating(null)}>Cancel</Button>
            <Button
              size="sm"
              onClick={() => {
                if (!creating?.number.trim()) { notify('Stall number is required.', 'error'); return; }
                create('stalls', creating);
                setCreating(null);
                notify('Stall created.');
              }}
            >
              Create Stall
            </Button>
          </>
        }
      >
        {creating && (
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['number', 'Stall number', 'text'],
              ['zone', 'Zone', 'text'],
              ['type', 'Type', 'text'],
              ['size', 'Size', 'text'],
              ['price', 'Price', 'number'],
              ['row', 'Row', 'number'],
              ['column', 'Column', 'number'],
            ] as const).map(([key, label, type]) => (
              <FormField key={key} tone="light" label={label} name={`new-${key}`}>
                <input
                  id={`new-${key}`}
                  type={type}
                  className="field-light"
                  value={String(creating[key])}
                  onChange={(e) =>
                    setCreating({ ...creating, [key]: type === 'number' ? Number(e.target.value) : e.target.value })
                  }
                />
              </FormField>
            ))}
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

