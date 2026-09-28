import { Link } from 'react-router-dom';
import { LogOut, Menu, ExternalLink, Search, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { titleCase } from '../../utils/format';
import { useLanguage } from '../../i18n/LanguageContext';

interface Props {
  onMenu: () => void;
  onOpenCommandPalette: () => void;
  collapsed?: boolean;
}

export function AdminTopbar({ onMenu, onOpenCommandPalette }: Props) {
  const { user, signOut } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'VS';

  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-3 sm:px-6 shadow-xs transition-all text-slate-800">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          onClick={onMenu}
          aria-label="Open admin menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all lg:hidden shrink-0"
        >
          <Menu size={20} />
        </button>

        <Link to="/admin/dashboard" className="flex items-center gap-2 sm:gap-2.5 min-w-0 group">
          <div className="h-8 w-8 rounded-lg bg-[#153A66] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs shrink-0 group-hover:bg-[#0F2B4D] transition-colors">
            VS
          </div>
          <div className="min-w-0">
            <span className="font-sans font-bold text-sm sm:text-base tracking-tight text-slate-900 truncate block">
              <span className="sm:hidden">VS <span className="text-[#153A66] font-semibold">Admin</span></span>
              <span className="hidden sm:inline">Vachan Shivir <span className="text-[#153A66] font-semibold">Admin</span></span>
            </span>
            <span className="hidden lg:inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/70 font-mono">
              2026 Edition
            </span>
          </div>
        </Link>
      </div>

      {/* Center Search Trigger (Cmd + K) */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center justify-between w-64 lg:w-80 px-3.5 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-500 hover:bg-slate-100/90 hover:border-slate-300 text-xs transition-all shadow-2xs"
      >
        <div className="flex items-center gap-2">
          <Search size={14} className="text-slate-400" />
          <span className="text-slate-600 font-medium font-sans">Search records or jump...</span>
        </div>
        <kbd className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded font-mono shadow-2xs">
          ⌘K
        </kbd>
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 transition-colors shrink-0"
          title="Switch Language / भाषा बदलें"
        >
          <Globe size={13} className="text-slate-500 shrink-0" />
          <span className={language === 'hi' ? 'text-navy font-bold' : 'text-slate-600'}>
            <span className="hidden sm:inline">हिन्दी</span>
            <span className="sm:hidden">HI</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className={language === 'en' ? 'text-navy font-bold' : 'text-slate-600'}>EN</span>
        </button>

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>System Online</span>
        </div>

        <Link
          to="/"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <span>Public site</span> <ExternalLink size={12} className="text-slate-400" />
        </Link>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {user && (
          <Link
            to="/admin/profile"
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="View Admin Profile"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#153A66] text-white font-semibold text-xs shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                <ShieldCheck size={13} className="text-amber-600" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">{titleCase(user.role.toLowerCase())}</p>
            </div>
          </Link>
        )}

        <button
          onClick={signOut}
          title="Sign Out"
          className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors shrink-0"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
