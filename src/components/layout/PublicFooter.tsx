import { Link } from 'react-router-dom';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { dateRange } from '../../utils/format';
import { useLanguage } from '../../i18n/LanguageContext';

const COLUMNS = [
  {
    heading: 'Retreat & Event',
    links: [
      { to: '/event', label: 'About Vachan Shivir' },
      { to: '/programme', label: 'Programme & Sessions' },
      { to: '/speakers', label: 'Keynote Speakers' },
      { to: '/gallery', label: 'Photo Gallery' },
    ],
  },
  {
    heading: 'Registration & Passes',
    links: [
      { to: '/registration', label: 'Online Registration' },
      { to: '/my-vachanshivir', label: 'Find My Ticket & Badge' },
      { to: '/pricing', label: 'Contribution & Passes' },
      { to: '/faq', label: 'Registration FAQs' },
    ],
  },
  {
    heading: 'Venue & Guidance',
    links: [
      { to: '/venue', label: 'Puri Ashram Venue' },
      { to: '/travel', label: 'How to Reach Puri' },
      { to: '/contact', label: 'Helpdesk & Support' },
      { to: '/donate', label: 'Offerings & Support' },
    ],
  },
  {
    heading: 'Resources & Archive',
    links: [
      { to: '/archive', label: 'Past Shivir (2020-25)' },
      { to: '/documents', label: 'Downloads' },
      { to: '/news', label: 'Announcements' },
      { to: '/faq', label: 'Help & FAQ' },
    ],
  },
];

export function PublicFooter() {
  const { t } = useLanguage();
  const event = useCurrentEvent();

  return (
    <footer className="border-t-2 border-crossgold/40 bg-navy text-white font-sans" style={{ backgroundColor: '#1B4980' }}>
      <div className="shell py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-950 border-2 border-crossgold text-crossgold flex items-center justify-center font-black text-sm font-raleway shadow-brutal-gold-sm">
                VS
              </div>
              <span className="text-lg font-black tracking-tight text-white font-raleway">
                VACHAN SHIVIR
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-300 font-sans">
              {event.name}. {dateRange(event.startDate, event.endDate)} at {event.venueName},{' '}
              {event.venueCity}.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="font-raleway text-xs uppercase tracking-widest text-crossgold font-black">{col.heading}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-xs text-slate-300 hover:text-crossgold transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="h-px w-full my-8 bg-navy-700/80" />

        <div className="flex flex-col gap-4 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-slate-400">Satya Vachan Church &bull; Ishopanthi Ashram, Puri, Odisha &bull; Helpline: +91 9696110134</p>
            <p className="text-[11px] text-slate-400">{t('footer_rights')}</p>
          </div>
          <ul className="flex flex-wrap gap-4 font-semibold text-slate-300">
            <li><Link to="/privacy-policy" className="hover:text-crossgold">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-crossgold">Terms &amp; Conditions</Link></li>
            <li><Link to="/refund-policy" className="hover:text-crossgold">Refund &amp; Cancellation</Link></li>
            <li><Link to="/forms" className="hover:text-crossgold text-slate-400">Forms &amp; Portal</Link></li>
            <li><Link to="/admin" className="hover:text-crossgold text-slate-400">Admin Portal</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
