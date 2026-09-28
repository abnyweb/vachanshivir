import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Contact, ScanLine, LayoutGrid } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/StoreContext';

interface Props {
  onOpenMenu: () => void;
  isMenuOpen?: boolean;
}

export function AdminBottomNav({ onOpenMenu, isMenuOpen }: Props) {
  const { db } = useStore();

  const submittedRegistrations = db.registrations.filter((r) => r.status === 'submitted').length;

  return (
    <nav
      aria-label="Admin Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-md px-2 py-1 flex items-center justify-around select-none text-slate-600"
    >
      {/* 1. Dashboard */}
      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150',
            isActive ? 'text-[#153A66]' : 'text-slate-500 hover:text-slate-900'
          )
        }
      >
        {({ isActive }) => (
          <>
            <div
              className={cn(
                'flex items-center justify-center w-10 h-7 rounded-full transition-all',
                isActive ? 'bg-slate-100 text-[#153A66] font-semibold' : 'text-current'
              )}
            >
              <LayoutDashboard size={18} />
            </div>
            <span
              className={cn(
                'text-[11px] font-sans tracking-tight transition-all mt-0.5',
                isActive ? 'font-bold text-[#153A66]' : 'font-medium text-slate-500'
              )}
            >
              Home
            </span>
          </>
        )}
      </NavLink>

      {/* 2. Registrations */}
      <NavLink
        to="/admin/registrations"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 relative',
            isActive ? 'text-[#153A66]' : 'text-slate-500 hover:text-slate-900'
          )
        }
      >
        {({ isActive }) => (
          <>
            <div
              className={cn(
                'flex items-center justify-center w-10 h-7 rounded-full transition-all relative',
                isActive ? 'bg-slate-100 text-[#153A66] font-semibold' : 'text-current'
              )}
            >
              <ClipboardList size={18} />
              {submittedRegistrations > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono bg-rose-500 text-white">
                  {submittedRegistrations}
                </span>
              )}
            </div>
            <span
              className={cn(
                'text-[11px] font-sans tracking-tight transition-all mt-0.5',
                isActive ? 'font-bold text-[#153A66]' : 'font-medium text-slate-500'
              )}
            >
              Entries
            </span>
          </>
        )}
      </NavLink>

      {/* 3. CRM Pastoral Contacts */}
      <NavLink
        to="/admin/crm/contacts"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150',
            isActive ? 'text-[#153A66]' : 'text-slate-500 hover:text-slate-900'
          )
        }
      >
        {({ isActive }) => (
          <>
            <div
              className={cn(
                'flex items-center justify-center w-10 h-7 rounded-full transition-all',
                isActive ? 'bg-slate-100 text-[#153A66] font-semibold' : 'text-current'
              )}
            >
              <Contact size={18} />
            </div>
            <span
              className={cn(
                'text-[11px] font-sans tracking-tight transition-all mt-0.5',
                isActive ? 'font-bold text-[#153A66]' : 'font-medium text-slate-500'
              )}
            >
              CRM
            </span>
          </>
        )}
      </NavLink>

      {/* 4. Scanner Check-in */}
      <NavLink
        to="/admin/operations/scanner"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150',
            isActive ? 'text-[#153A66]' : 'text-slate-500 hover:text-slate-900'
          )
        }
      >
        {({ isActive }) => (
          <>
            <div
              className={cn(
                'flex items-center justify-center w-10 h-7 rounded-full transition-all',
                isActive ? 'bg-slate-100 text-[#153A66] font-semibold' : 'text-current'
              )}
            >
              <ScanLine size={18} />
            </div>
            <span
              className={cn(
                'text-[11px] font-sans tracking-tight transition-all mt-0.5',
                isActive ? 'font-bold text-[#153A66]' : 'font-medium text-slate-500'
              )}
            >
              Scan
            </span>
          </>
        )}
      </NavLink>

      {/* 5. All Apps (Drawer Trigger) */}
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open all apps launcher"
        className={cn(
          'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 active:scale-95',
          isMenuOpen ? 'text-[#153A66]' : 'text-slate-500 hover:text-slate-900'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center w-10 h-7 rounded-full transition-all',
            isMenuOpen ? 'bg-slate-100 text-[#153A66] font-semibold' : 'bg-slate-50 text-slate-600'
          )}
        >
          <LayoutGrid size={18} />
        </div>
        <span
          className={cn(
            'text-[11px] font-sans tracking-tight transition-all mt-0.5',
            isMenuOpen ? 'font-bold text-[#153A66]' : 'font-medium text-slate-500'
          )}
        >
          Apps
        </span>
      </button>
    </nav>
  );
}
