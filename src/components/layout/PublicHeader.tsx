import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Ticket, ChevronDown, UserCheck, Calendar, ArrowRight,
  Image, Users, Mail, History, Globe, Heart, MapPin, ShieldCheck,
  LogOut, User, HelpCircle, FileText
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../auth/AuthContext';

// 1. Primary Desktop Top Navbar Links (Horizontal, High-Priority)
const PRIMARY_NAV: { to: string; key: any; id: string }[] = [
  { to: '/#about', key: 'nav_about', id: 'about' },
  { to: '/#schedule', key: 'nav_schedule', id: 'schedule' },
  { to: '/#pricing', key: 'nav_pricing', id: 'pricing' },
  { to: '/donate', key: 'nav_donate', id: 'donate' },
];

// 2. Desktop "अन्य ∨" (More) Dropdown Menu (Clean, zero overlap with PRIMARY_NAV)
const MORE_NAV: { to: string; key: any; icon: any; id?: string }[] = [
  { to: '/#theme', key: 'nav_theme', icon: Calendar, id: 'theme' },
  { to: '/speakers', key: 'nav_speakers_more', icon: Users, id: 'speakers' },
  { to: '/venue', key: 'nav_venue', icon: MapPin, id: 'venue' },
  { to: '/#qa', key: 'nav_qa', icon: HelpCircle, id: 'qa' },
  { to: '/gallery', key: 'nav_gallery', icon: Image },
  { to: '/archive', key: 'nav_archive', icon: History },
  { to: '/contact', key: 'nav_contact_supp', icon: Mail },
  { to: '/forms', key: 'nav_forms', icon: FileText },
];

// 3. Mobile Side Drawer: Group 1 - मुख्य सम्मेलन अनुभाग (Shivir Event Sections)
// 6 distinct event sections, ZERO duplicates with Group 2
const DRAWER_MAIN_SECTIONS: { to: string; key: any; id: string }[] = [
  { to: '/#about', key: 'nav_about', id: 'about' },
  { to: '/#theme', key: 'nav_theme', id: 'theme' },
  { to: '/#schedule', key: 'nav_schedule', id: 'schedule' },
  { to: '/speakers', key: 'nav_speakers_more', id: 'speakers' },
  { to: '/venue', key: 'nav_venue', id: 'venue' },
  { to: '/#pricing', key: 'nav_pricing', id: 'pricing' },
];

// 4. Mobile Side Drawer: Group 2 - अन्य पृष्ठ एवं सेवाएँ (More Pages & Resources)
// 6 distinct auxiliary pages, ZERO duplicates from Group 1
const DRAWER_MORE_PAGES: { to: string; key: any; icon: any; id?: string }[] = [
  { to: '/donate', key: 'nav_donate', icon: Heart },
  { to: '/#qa', key: 'nav_qa', icon: HelpCircle, id: 'qa' },
  { to: '/gallery', key: 'nav_gallery', icon: Image },
  { to: '/archive', key: 'nav_archive', icon: History },
  { to: '/contact', key: 'nav_contact_supp', icon: Mail },
  { to: '/forms', key: 'nav_forms', icon: FileText },
];

export function PublicHeader() {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Track scroll position for dynamic styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for unified mobile drawer open trigger from bottom nav
  useEffect(() => {
    const handleOpenDrawer = () => setOpen(true);
    window.addEventListener('open-vachanshivir-drawer', handleOpenDrawer);
    return () => window.removeEventListener('open-vachanshivir-drawer', handleOpenDrawer);
  }, []);

  // Smart active section tracking on scroll
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sectionIds = ['about', 'theme', 'schedule', 'pricing', 'qa', 'venue'];
    const handleScrollSection = () => {
      const scrollPosition = window.scrollY + 200;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSection, { passive: true });
    handleScrollSection();
    return () => window.removeEventListener('scroll', handleScrollSection);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle smooth scroll navigation
  const handleNavClick = (to: string) => {
    setOpen(false);
    setMoreOpen(false);

    if (to.startsWith('/#')) {
      const targetId = to.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(targetId);
        if (el) {
          const yOffset = -90;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
          setActiveSection(targetId);
          return;
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            const yOffset = -90;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveSection(targetId);
          }
        }, 100);
        return;
      }
    }
    navigate(to);
  };

  return (
    <>
      {/* Full-Width Deep Navy Header */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300 border-b-2 text-white',
          scrolled
            ? 'bg-[#0B1D33] border-crossgold/50 shadow-xl'
            : 'bg-[#0B1D33] border-crossgold/40 shadow-md',
        )}
        style={{ backgroundColor: '#0B1D33' }}
      >
        <div className="shell flex items-center justify-between gap-2 sm:gap-4 py-2 sm:py-2.5">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group" aria-label="Vachan Shivir Home">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-navy text-crossgold border-2 border-navy-950 flex items-center justify-center font-raleway font-black text-xs sm:text-sm tracking-wider shadow-brutal-sm transition-transform group-hover:scale-105 shrink-0">
              VS
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white group-hover:text-crossgold transition-colors font-raleway whitespace-nowrap">
                VACHAN SHIVIR
              </span>
              <span className="hidden sm:inline text-[9px] sm:text-[10px] font-raleway font-black tracking-widest text-crossgold uppercase -mt-0.5 whitespace-nowrap">
                2026 EDITION
              </span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 border-l-2 border-crossgold/30 pl-3.5">
              <span className="w-2 h-2 rounded-full bg-crossgold animate-pulse" />
              <span className="text-[10px] font-raleway font-black tracking-widest text-crossgold uppercase bg-navy-900/90 px-2.5 py-0.5 rounded-full border border-crossgold/50 whitespace-nowrap">
                OCT 26 &ndash; 29
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Clean, No Redundancy) */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 sm:gap-1.5 shrink-0">
            {PRIMARY_NAV.map((item) => {
              const isHash = item.to.startsWith('/#');
              const isSectionActive = isHash && activeSection === item.id;
              const isPathActive = !isHash && location.pathname === item.to;
              const isActive = isSectionActive || isPathActive;

              return (
                <button
                  key={item.to}
                  onClick={() => handleNavClick(item.to)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-raleway font-bold tracking-wider uppercase transition-all rounded-full relative whitespace-nowrap shrink-0 cursor-pointer',
                    isActive
                      ? 'bg-crossgold text-navy-950 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] font-black'
                      : 'text-white/90 hover:text-crossgold hover:bg-navy-900 font-bold',
                  )}
                >
                  {t(item.key)}
                </button>
              );
            })}

            {/* "More" Dropdown Menu (Secondary Pages) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  'px-2.5 py-1.5 text-xs font-raleway font-bold tracking-wider uppercase transition-all rounded-full flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer',
                  moreOpen ? 'text-crossgold bg-navy-900' : 'text-white/90 hover:text-crossgold hover:bg-navy-900 font-bold',
                )}
              >
                <span>{t('nav_more')}</span>
                <ChevronDown size={13} className={cn('transition-transform duration-200', moreOpen && 'rotate-180')} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0B1D33] border-2 border-crossgold/40 text-white rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-fadeIn">
                  {MORE_NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.to}
                        onClick={() => handleNavClick(item.to)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-raleway font-bold text-white/90 hover:text-crossgold hover:bg-navy-900 transition-all text-left cursor-pointer"
                      >
                        <Icon size={15} className="text-crossgold shrink-0" />
                        <span>{t(item.key)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Action Buttons & Mobile Hamburger Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-navy-900 hover:bg-navy-850 border-2 border-crossgold/40 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-raleway font-bold text-white transition-all hover:border-crossgold shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
              title="Switch Language / भाषा बदलें"
            >
              <Globe size={13} className="text-crossgold shrink-0" />
              <span className={cn(language === 'hi' ? 'text-crossgold font-black' : 'text-slate-300')}>हिन्दी</span>
              <span className="text-slate-500">|</span>
              <span className={cn(language === 'en' ? 'text-crossgold font-black' : 'text-slate-300')}>EN</span>
            </button>

            {/* Authenticated User Status or Sign In Button */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  title={`${user.name} (${user.role})`}
                  className={cn(
                    'flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full border text-xs font-semibold transition-all shadow-sm cursor-pointer',
                    user.role === 'SUPER_ADMIN'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                      : user.role === 'CONTENT_ADMIN'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 hover:bg-indigo-100'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline-block max-w-[80px] truncate text-[11px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={12} className={cn('text-slate-500 transition-transform', profileOpen && 'rotate-180')} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 backdrop-blur-xl animate-fadeIn text-left text-slate-800">
                    <div className="pb-2.5 mb-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate font-mono">{user.email}</p>
                      <div className="mt-1.5">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : user.role === 'CONTENT_ADMIN'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        )}>
                          {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'CONTENT_ADMIN' ? 'Content Admin' : 'Participant'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {user.role !== 'PARTICIPANT' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-amber-900 hover:bg-amber-50 transition-colors"
                        >
                          <ShieldCheck size={15} className="text-amber-600" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      <Link
                        to="/my-vachanshivir"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <UserCheck size={15} className="text-emerald-600" />
                        <span>My Vachan Shivir Pass</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Participant Sign In (Desktop) */
              <Link
                to="/login"
                title="Participant Sign In"
                aria-label="Participant Sign In"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-raleway font-bold text-white/90 hover:text-crossgold hover:bg-navy-900 border border-white/20 transition-all shrink-0"
              >
                <User size={14} className="text-crossgold" />
                <span>{t('nav_signin')}</span>
              </Link>
            )}

            {/* Prominent Register CTA Button (Hidden on xs mobile to prevent header overflow) */}
            <Link
              to="/registration"
              title={t('nav_register')}
              aria-label={t('nav_register')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-crossgold hover:bg-crossgold-dark text-navy-950 font-raleway font-black text-xs uppercase tracking-wider border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] transition-all shrink-0 whitespace-nowrap"
            >
              <Ticket size={13} className="shrink-0" />
              <span>{t('nav_register')}</span>
            </Link>

            {/* Hamburger Navigation Button (For Mobile & Tablet screens only: lg:hidden) */}
            <button
              className="p-2 text-white hover:text-crossgold bg-navy-900 hover:bg-navy-850 border border-crossgold/30 rounded-xl transition-colors cursor-pointer lg:hidden shrink-0"
              aria-label={open ? 'Close Menu' : 'Open Menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              title="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET SIDE DRAWER (NO DUPLICATE LINKS, BALANCED LAYOUT)         */}
      {/* ========================================================================= */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:w-[380px] max-w-[400px] h-full bg-[#0B1D33] border-l-2 border-crossgold/40 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between shadow-2xl text-white selection:bg-crossgold selection:text-navy-950"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-navy-800 pb-3.5">
              <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-crossgold text-navy-950 flex items-center justify-center font-black text-xs font-raleway border border-navy-950 shadow-sm">
                  VS
                </div>
                <div>
                  <span className="text-sm font-black text-white font-raleway tracking-tight block leading-none">
                    VACHAN SHIVIR
                  </span>
                  <span className="text-[9px] font-mono text-crossgold uppercase font-bold tracking-widest">
                    2026 EDITION
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white bg-navy-900 hover:bg-navy-800 rounded-xl border border-white/10 transition-colors cursor-pointer"
                aria-label="Close Menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav Links Container (Zero Duplicates) */}
            <div className="my-4 space-y-5 flex-1 overflow-y-auto pr-1">
              
              {/* Group 1: मुख्य सम्मेलन अनुभाग (Shivir Event Sections) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-crossgold block mb-1.5 font-black font-raleway">
                  {language === 'hi' ? 'मुख्य सम्मेलन अनुभाग' : 'EVENT SECTIONS'}
                </span>
                {DRAWER_MAIN_SECTIONS.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => handleNavClick(item.to)}
                    className={cn(
                      'w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all text-left border cursor-pointer',
                      activeSection === item.id
                        ? 'bg-crossgold text-navy-950 border-navy-950 font-black shadow-sm'
                        : 'bg-navy-900/70 border-navy-800 text-white/90 hover:bg-navy-850 hover:text-crossgold',
                    )}
                  >
                    <span>{t(item.key)}</span>
                    <ArrowRight size={13} className="opacity-60" />
                  </button>
                ))}
              </div>

              {/* Group 2: अन्य पृष्ठ एवं सेवाएँ (More Pages & Resources - ZERO OVERLAP) */}
              <div className="pt-3 border-t border-navy-800/80 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-crossgold block mb-1.5 font-black font-raleway">
                  {language === 'hi' ? 'अन्य पृष्ठ एवं सेवाएँ' : 'MORE PAGES & RESOURCES'}
                </span>
                {DRAWER_MORE_PAGES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => handleNavClick(item.to)}
                      className="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs font-semibold text-white/90 bg-navy-900/60 border border-navy-800/80 hover:text-crossgold hover:bg-navy-850 hover:border-crossgold/40 text-left transition-all cursor-pointer"
                    >
                      <Icon size={14} className="text-crossgold shrink-0" />
                      <span>{t(item.key)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Area (Compact 2-Row Layout, No Scroll Overflow) */}
            <div className="pt-3.5 border-t border-navy-800 space-y-2">
              {/* Primary Full-Width CTA */}
              <Link
                to="/registration"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-crossgold hover:bg-crossgold-dark text-navy-950 font-black font-raleway text-xs uppercase tracking-wider py-2.5 rounded-xl border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] transition-all"
              >
                <Ticket size={14} />
                <span>{t('nav_register')}</span>
              </Link>

              {/* Secondary Actions Row */}
              {user ? (
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-navy-900 border border-navy-800 text-xs flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-white truncate text-[11px]">{user.name}</p>
                      <p className="text-[10px] text-slate-300 font-mono truncate">{user.email}</p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-crossgold text-navy-950 border border-navy-950">
                      {user.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/my-vachanshivir"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-1.5 bg-navy-900 text-crossgold hover:bg-navy-850 font-bold text-xs py-2 px-2 rounded-xl border border-crossgold/40 transition-colors text-center"
                    >
                      <UserCheck size={13} className="shrink-0" />
                      <span className="truncate">{t('nav_my_shivir')}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        signOut();
                      }}
                      className="flex items-center justify-center gap-1.5 text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/40 font-semibold text-xs py-2 px-2 rounded-xl transition-colors cursor-pointer text-center"
                    >
                      <LogOut size={13} className="shrink-0" />
                      <span className="truncate">{language === 'hi' ? 'साइन आउट' : 'Sign Out'}</span>
                    </button>
                  </div>

                  {user.role !== 'PARTICIPANT' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setOpen(false)}
                      className="w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-navy-950 font-black font-raleway text-[11px] py-2 rounded-xl border border-navy-950 transition-colors"
                    >
                      <ShieldCheck size={13} />
                      <span>Admin Management Portal</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/donate"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-1.5 bg-navy-900 text-rose-300 hover:bg-rose-950/60 font-bold text-xs py-2.5 px-2 rounded-xl border border-rose-400/30 transition-colors text-center"
                  >
                    <Heart size={13} className="text-rose-500 fill-rose-500/20 shrink-0" />
                    <span className="truncate">{t('nav_donate')}</span>
                  </Link>

                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-1.5 bg-navy-900 text-crossgold hover:bg-navy-850 font-bold text-xs py-2.5 px-2 rounded-xl border border-crossgold/40 transition-colors text-center"
                  >
                    <User size={13} className="text-crossgold shrink-0" />
                    <span className="truncate">{language === 'hi' ? 'साइन इन / पास' : 'Sign In / Pass'}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PublicHeader;
