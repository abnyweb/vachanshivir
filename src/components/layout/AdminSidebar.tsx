import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../auth/AuthContext';
import { useStore } from '../../store/StoreContext';
import { ADMIN_NAV } from './adminNav';

interface Props {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({ onNavigate, collapsed = false, onToggleCollapse }: Props) {
  const { can, user } = useAuth();
  const { db } = useStore();

  // Helper to compute badge counts for urgent menu items
  const getBadge = (to: string) => {
    if (to === '/admin/registrations') {
      const submitted = db.registrations.filter((r) => r.status === 'submitted').length;
      return submitted > 0 ? { text: String(submitted), variant: 'warning' as const } : null;
    }
    if (to === '/admin/enquiries') {
      const open = db.enquiries.filter((e) => e.status === 'new' || e.status === 'in-progress').length;
      return open > 0 ? { text: String(open), variant: 'danger' as const } : null;
    }
    if (to === '/admin/operations/sheets') {
      const pendingSync = (db.syncJobs || []).filter((j) => j.status === 'pending').length;
      return pendingSync > 0 ? { text: String(pendingSync), variant: 'info' as const } : null;
    }
    return null;
  };

  return (
    <div className="flex h-full flex-col bg-[#0F172A] text-slate-300 select-none border-r border-slate-800 font-sans">
      {/* Sidebar Header / Collapse Toggle */}
      <div className="flex items-center justify-between px-3.5 py-3.5 border-b border-slate-800/80 bg-[#0F172A]">
        {!collapsed && (
          <div className="flex items-center gap-2 px-1">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 shadow-xs" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-200 font-sans">
              Admin Portal
            </span>
          </div>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors',
              collapsed && 'mx-auto'
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-2.5 py-4 custom-scrollbar">
        {ADMIN_NAV.map((group) => {
          const items = group.items.filter((i) => can(i.area));
          if (items.length === 0) return null;
          return (
            <div key={group.heading}>
              {!collapsed && (
                <h2 className="px-2.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  {group.heading}
                </h2>
              )}
              <ul className="space-y-1">
                {items.map(({ to, label, icon: Icon }) => {
                  const badge = getBadge(to);
                  return (
                    <li key={to}>
                      <NavLink
                        to={to}
                        onClick={onNavigate}
                        title={collapsed ? label : undefined}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
                            collapsed && 'justify-center px-2',
                            isActive
                              ? 'bg-slate-800 text-white font-semibold shadow-xs border border-slate-700/80'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          )
                        }
                      >
                        <Icon
                          size={17}
                          className="shrink-0 transition-transform duration-150 group-hover:scale-105"
                        />
                        {!collapsed && <span className="truncate">{label}</span>}
                        {!collapsed && badge && (
                          <span
                            className={cn(
                              'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none font-mono',
                              badge.variant === 'warning' && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                              badge.variant === 'danger' && 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
                              badge.variant === 'info' && 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            )}
                          >
                            {badge.text}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer Info Widget & My Profile Quick Link */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-[#0F172A] space-y-2">
          {user && (
            <NavLink
              to="/admin/profile"
              onClick={onNavigate}
              className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors text-left"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#153A66] text-white font-semibold text-xs shrink-0 shadow-xs">
                {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'VS'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate font-sans">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
              </div>
            </NavLink>
          )}
          <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-2.5 py-1.5 border border-slate-800 text-[10px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="truncate">VS 2026 · {db.registrations.length} Registrations</span>
          </div>
        </div>
      )}
    </div>
  );
}
