import { useState, useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  X, Search, ExternalLink, LogOut, LayoutGrid, List,
  ShieldCheck, ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../auth/AuthContext';
import { useStore } from '../../store/StoreContext';
import { ADMIN_NAV } from './adminNav';
import { titleCase } from '../../utils/format';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminMobileDrawer({ open, onClose }: Props) {
  const { user, can, signOut } = useAuth();
  const { db } = useStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'VS';

  // Badge counts for urgent items
  const getBadge = (to: string) => {
    if (to === '/admin/registrations') {
      const submitted = db.registrations.filter((r) => r.status === 'submitted').length;
      return submitted > 0 ? { count: submitted, variant: 'warning' as const } : null;
    }
    if (to === '/admin/enquiries') {
      const openEnq = db.enquiries.filter((e) => e.status === 'new' || e.status === 'in-progress').length;
      return openEnq > 0 ? { count: openEnq, variant: 'danger' as const } : null;
    }
    if (to === '/admin/integrations/google-sheets') {
      const pendingSync = (db.syncJobs || []).filter((j) => j.status === 'pending').length;
      return pendingSync > 0 ? { count: pendingSync, variant: 'info' as const } : null;
    }
    return null;
  };

  // Flattened items for search and grid
  const allAuthorizedItems = useMemo(() => {
    const list: Array<{
      to: string;
      label: string;
      shortLabel: string;
      icon: any;
      area: string;
      color: string;
      heading: string;
    }> = [];

    ADMIN_NAV.forEach((group) => {
      group.items.forEach((item) => {
        if (can(item.area)) {
          list.push({
            to: item.to,
            label: item.label,
            shortLabel: item.shortLabel || item.label,
            icon: item.icon,
            area: item.area,
            color: item.color || 'from-indigo-600 to-blue-700',
            heading: group.heading,
          });
        }
      });
    });

    return list;
  }, [can]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!search.trim()) return allAuthorizedItems;
    const q = search.toLowerCase().trim();
    return allAuthorizedItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.shortLabel.toLowerCase().includes(q) ||
        item.heading.toLowerCase().includes(q)
    );
  }, [allAuthorizedItems, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Scrim Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Admin Mobile Navigation Drawer */}
      <div className="relative z-10 w-[88vw] max-w-[350px] bg-[#0F172A] text-slate-200 flex flex-col h-full shadow-2xl border-r border-slate-800 animate-slideRight">
        {/* 1. PROFILE HEADER */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-slate-300">
                Admin Console
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <Link
            to="/admin/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all group"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-[#153A66] text-white font-bold text-sm font-sans flex items-center justify-center border border-slate-600 shadow-xs">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold font-sans text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <ShieldCheck size={14} className="text-amber-500 shrink-0" />
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate">{user?.email}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase bg-slate-700/60 text-slate-300 border border-slate-600">
                {user ? titleCase(user.role.toLowerCase()) : 'Super Admin'}
              </span>
            </div>

            <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
          </Link>
        </div>

        {/* 2. SEARCH & VIEW SWITCHER */}
        <div className="p-3 border-b border-slate-800 bg-[#0F172A] space-y-2">
          {/* Instant Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps & menus..."
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-slate-500 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* View Mode Toggle: App Grid vs List */}
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <span className="text-[11px] font-sans font-medium text-slate-400 uppercase tracking-wider">
              {filteredItems.length} {filteredItems.length === 1 ? 'App' : 'Apps'}
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all',
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <LayoutGrid size={11} /> Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all',
                  viewMode === 'list'
                    ? 'bg-slate-800 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <List size={11} /> List
              </button>
            </div>
          </div>
        </div>

        {/* 3. MENU ITEMS CONTAINER (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {viewMode === 'grid' ? (
            /* APP LAUNCHER GRID (3 Columns) */
            <div className="grid grid-cols-3 gap-2.5">
              {filteredItems.map(({ to, shortLabel, icon: Icon, color }) => {
                const badge = getBadge(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group flex flex-col items-center justify-center p-2.5 rounded-xl transition-all relative text-center',
                        isActive
                          ? 'bg-slate-800/90 border border-slate-600 shadow-xs'
                          : 'bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 active:scale-95'
                      )
                    }
                  >
                    {/* App Icon Container */}
                    <div className="relative mb-1.5">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105',
                          color
                        )}
                      >
                        <Icon size={18} />
                      </div>

                      {/* Notification Count Badge */}
                      {badge && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono bg-rose-500 text-white border border-slate-900 shadow-xs">
                          {badge.count}
                        </span>
                      )}
                    </div>

                    {/* App Label */}
                    <span className="text-[11px] font-medium font-sans text-slate-200 group-hover:text-white truncate max-w-[80px] leading-tight">
                      {shortLabel}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          ) : (
            /* GROUPED LIST VIEW */
            <div className="space-y-4">
              {ADMIN_NAV.map((group) => {
                const items = group.items.filter((i) => {
                  if (!can(i.area)) return false;
                  if (!search.trim()) return true;
                  const q = search.toLowerCase().trim();
                  return (
                    i.label.toLowerCase().includes(q) ||
                    (i.shortLabel && i.shortLabel.toLowerCase().includes(q))
                  );
                });
                if (items.length === 0) return null;

                return (
                  <div key={group.heading} className="space-y-1">
                    <h3 className="px-2 text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                      {group.heading}
                    </h3>
                    <div className="space-y-0.5">
                      {items.map(({ to, label, icon: Icon, color }) => {
                        const badge = getBadge(to);
                        return (
                          <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                                isActive
                                  ? 'bg-slate-800 text-white font-semibold shadow-xs border border-slate-700/80'
                                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                              )
                            }
                          >
                            <div
                              className={cn(
                                'w-6 h-6 rounded-md bg-gradient-to-br flex items-center justify-center text-white shrink-0 shadow-2xs',
                                color || 'from-indigo-600 to-blue-700'
                              )}
                            >
                              <Icon size={13} />
                            </div>
                            <span className="truncate">{label}</span>
                            {badge && (
                              <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-semibold font-mono bg-rose-500 text-white">
                                {badge.count}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. FOOTER QUICK ACTIONS */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-colors"
            >
              <ExternalLink size={12} className="text-slate-400" /> Public Site
            </Link>

            <button
              onClick={() => {
                onClose();
                signOut();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-xs font-medium text-rose-300 hover:text-white transition-colors"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 px-1 pt-1">
            <span>VS 2026 Admin</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
