import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, CalendarDays, History, CalendarClock, Users, ClipboardList, UserCheck, IndianRupee,
  Handshake, Building2, Store, LayoutGrid, Images, Inbox, FileText, HelpCircle, Megaphone,
  Settings, BedDouble, ScanLine, IdCard, FolderArchive, FileImage, ShieldCheck, Share2, Contact,
  FileSpreadsheet, MessageSquare, UserCog, UserCircle, Layers, Heart, Activity,
} from 'lucide-react';

interface Item {
  to: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  area: string;
  color?: string;
}
interface Group { heading: string; items: Item[] }

export const ADMIN_NAV: Group[] = [
  {
    heading: 'Overview & Users',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard, area: 'dashboard', color: 'from-blue-600 to-indigo-600' },
      { to: '/admin/users', label: 'User Directory', shortLabel: 'Users', icon: UserCog, area: 'dashboard', color: 'from-purple-600 to-indigo-700' },
      { to: '/admin/profile', label: 'My Profile', shortLabel: 'Profile', icon: UserCircle, area: 'dashboard', color: 'from-amber-500 to-amber-700' },
    ],
  },
  {
    heading: 'CRM & Operations',
    items: [
      { to: '/admin/crm/contacts', label: 'Pastoral CRM', shortLabel: 'CRM', icon: Contact, area: 'registrations', color: 'from-orange-500 to-amber-600' },
      { to: '/admin/registrations', label: 'Registrations', shortLabel: 'Entries', icon: ClipboardList, area: 'registrations', color: 'from-emerald-500 to-teal-700' },
      { to: '/admin/operations', label: 'Operations Command', shortLabel: 'Operations', icon: ShieldCheck, area: 'registrations', color: 'from-sky-500 to-blue-700' },
      { to: '/admin/migration', label: 'Excel Migration', shortLabel: 'Migration', icon: FileSpreadsheet, area: 'registrations', color: 'from-teal-500 to-emerald-700' },
      { to: '/admin/attendees', label: 'Attendees & Passes', shortLabel: 'Attendees', icon: Users, area: 'attendees', color: 'from-indigo-500 to-purple-600' },
      { to: '/admin/operations/verification', label: 'Pass Verification', shortLabel: 'Verify', icon: UserCheck, area: 'registrations', color: 'from-emerald-600 to-green-700' },
      { to: '/admin/operations/scanner', label: 'QR Scanner', shortLabel: 'Scanner', icon: ScanLine, area: 'check-in', color: 'from-rose-500 to-red-600' },
      { to: '/admin/operations/whatsapp', label: 'WhatsApp Alerts', shortLabel: 'WhatsApp', icon: MessageSquare, area: 'registrations', color: 'from-green-500 to-emerald-600' },
      { to: '/admin/operations/rooming-board', label: 'Room Allocation', shortLabel: 'Rooming', icon: BedDouble, area: 'rooming', color: 'from-purple-500 to-violet-700' },
      { to: '/admin/badges', label: 'Delegate Badges', shortLabel: 'Badges', icon: IdCard, area: 'badges', color: 'from-fuchsia-500 to-pink-600' },
    ],
  },
  {
    heading: 'Events & Content',
    items: [
      { to: '/admin/events', label: 'Events & Venues', shortLabel: 'Events', icon: CalendarDays, area: 'events', color: 'from-blue-600 to-cyan-600' },
      { to: '/admin/events/previous-years', label: 'Previous Editions', shortLabel: 'History', icon: History, area: 'events', color: 'from-slate-600 to-slate-800' },
      { to: '/admin/programme', label: 'Programme Schedule', shortLabel: 'Programme', icon: CalendarClock, area: 'programme', color: 'from-violet-600 to-indigo-700' },
      { to: '/admin/speakers', label: 'Faculty & Speakers', shortLabel: 'Speakers', icon: Users, area: 'speakers', color: 'from-amber-600 to-orange-700' },
      { to: '/admin/announcements', label: 'Announcements', shortLabel: 'Notices', icon: Megaphone, area: 'announcements', color: 'from-pink-500 to-rose-600' },
    ],
  },
  {
    heading: 'Pricing & Exhibition',
    items: [
      { to: '/admin/pricing', label: 'Pass Pricing', shortLabel: 'Pricing', icon: IndianRupee, area: 'pricing', color: 'from-emerald-600 to-teal-700' },
      { to: '/admin/donations', label: 'Ministry Support & Donations', shortLabel: 'Donations', icon: Heart, area: 'sponsors', color: 'from-rose-500 to-amber-600' },
      { to: '/admin/sponsors', label: 'Sponsors & Donors', shortLabel: 'Sponsors', icon: Handshake, area: 'sponsors', color: 'from-yellow-500 to-amber-600' },
      { to: '/admin/partners', label: 'Church Partners', shortLabel: 'Partners', icon: Building2, area: 'partners', color: 'from-blue-500 to-indigo-600' },
      { to: '/admin/exhibitors', label: 'Exhibitors', shortLabel: 'Exhibits', icon: Store, area: 'exhibitors', color: 'from-orange-500 to-red-600' },
      { to: '/admin/stalls', label: 'Resource Stalls', shortLabel: 'Stalls', icon: LayoutGrid, area: 'stalls', color: 'from-purple-600 to-indigo-800' },
    ],
  },
  {
    heading: 'Media & Enquiries',
    items: [
      { to: '/admin/media-library', label: 'Media Library', shortLabel: 'Media', icon: FileImage, area: 'documents', color: 'from-cyan-500 to-blue-600' },
      { to: '/admin/resources', label: 'Resources Archive', shortLabel: 'Resources', icon: FolderArchive, area: 'documents', color: 'from-slate-500 to-slate-700' },
      { to: '/admin/documents', label: 'Documents', shortLabel: 'Docs', icon: FileText, area: 'documents', color: 'from-blue-600 to-indigo-700' },
      { to: '/admin/gallery', label: 'Photo Gallery', shortLabel: 'Gallery', icon: Images, area: 'gallery', color: 'from-rose-500 to-pink-600' },
      { to: '/admin/faqs', label: 'Delegate FAQs', shortLabel: 'FAQs', icon: HelpCircle, area: 'faqs', color: 'from-indigo-500 to-blue-600' },
      { to: '/admin/enquiries', label: 'Enquiries Inbox', shortLabel: 'Enquiries', icon: Inbox, area: 'enquiries', color: 'from-amber-500 to-orange-600' },
    ],
  },
  {
    heading: 'Integrations & Settings',
    items: [
      { to: '/admin/integrations', label: 'Integrations Hub', shortLabel: 'Integrations', icon: Layers, area: 'settings', color: 'from-blue-600 to-cyan-700' },
      { to: '/admin/integrations/google-sheets', label: 'Google Sheets Sync', shortLabel: 'Sheets', icon: Share2, area: 'settings', color: 'from-emerald-500 to-green-700' },
      { to: '/admin/traffic-logs', label: 'Web Traffic & Security Logs', shortLabel: 'Traffic', icon: Activity, area: 'settings', color: 'from-sky-500 to-blue-700' },
      { to: '/admin/audit-logs', label: 'Audit Logs', shortLabel: 'Audit', icon: ShieldCheck, area: 'settings', color: 'from-rose-600 to-red-800' },
      { to: '/admin/settings', label: 'Platform Settings', shortLabel: 'Settings', icon: Settings, area: 'settings', color: 'from-slate-600 to-slate-900' },
    ],
  },
];
