import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  History,
  Ticket,
  UserCheck,
  Menu,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();

  // Check if attendee is registered in persistent state
  const hasRegistration = Boolean(
    localStorage.getItem('vachanshivir_registration_id') || localStorage.getItem('vachanshivir_verified_email')
  );

  const navItems = [
    { to: '/', label: 'Home', icon: Home, active: pathname === '/' },
    { to: '/programme', label: 'Programme', icon: Calendar, active: pathname.startsWith('/programme') },
    { to: '/archive', label: 'Events', icon: History, active: pathname.startsWith('/archive') || pathname.startsWith('/events') },
    hasRegistration
      ? { to: '/my-vachanshivir', label: 'My Pass', icon: UserCheck, active: pathname.startsWith('/my-vachanshivir'), highlight: true }
      : { to: '/registration', label: 'Register', icon: Ticket, active: pathname.startsWith('/registration'), highlight: true },
  ];

  const handleOpenMore = () => {
    // Dispatch unified drawer event to open the comprehensive CrossLife side drawer
    window.dispatchEvent(new CustomEvent('open-vachanshivir-drawer'));
  };

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden flex items-center gap-2 max-w-[96vw] animate-fadeIn"
    >
      <div className="bg-[#0B1D33] border-2 border-crossgold/40 shadow-2xl p-1 rounded-full flex items-center gap-1 text-white">
        {navItems.filter((i) => !i.highlight).map((item) => {
          const Icon = item.icon;
          if (item.active) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="bg-crossgold text-navy-950 px-3.5 py-1.5 rounded-full font-black text-xs font-raleway flex items-center gap-1.5 shadow-sm border border-navy-950 transition-all duration-300 scale-105 whitespace-nowrap"
              >
                <Icon className="w-4 h-4 text-navy-950 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-crossgold hover:bg-navy-900 active:scale-95 transition-all duration-200 shrink-0"
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="w-4 h-4 shrink-0" />
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleOpenMore}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-crossgold hover:bg-navy-900 active:scale-95 transition-all duration-200 shrink-0"
          aria-label="More Navigation Pages"
          title="More Navigation Pages"
        >
          <Menu className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {(() => {
        const regItem = navItems.find((i) => i.highlight);
        if (!regItem) return null;
        const Icon = regItem.icon;
        return (
          <Link
            to={regItem.to}
            className={cn(
              'h-11 px-3.5 rounded-full bg-crossgold hover:bg-crossgold-dark text-navy-950 flex items-center justify-center gap-1.5 font-raleway font-black text-xs uppercase tracking-wider shadow-md border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] hover:scale-105 active:scale-95 transition-all duration-300 whitespace-nowrap shrink-0',
              regItem.active ? 'ring-2 ring-crossgold scale-105' : ''
            )}
            aria-label={regItem.label}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{regItem.label}</span>
          </Link>
        );
      })()}
    </nav>
  );
};

export default MobileBottomNav;
