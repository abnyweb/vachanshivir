import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Command, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ADMIN_NAV } from '../layout/adminNav';
import { useAuth } from '../../auth/AuthContext';
import { useStore } from '../../store/StoreContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminCommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { db } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) {
          onClose();
        } else {
          // Open signal handles via props or parent
          window.dispatchEvent(new CustomEvent('toggle-command-palette'));
        }
      }
      if (e.key === 'Escape' && open) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Aggregate all navigable routes and search results
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const navItems: { id: string; title: string; category: string; to: string; icon: any }[] = [];

    ADMIN_NAV.forEach((group) => {
      group.items.forEach((item) => {
        if (can(item.area)) {
          if (!q || item.label.toLowerCase().includes(q) || group.heading.toLowerCase().includes(q)) {
            navItems.push({
              id: `nav-${item.to}`,
              title: item.label,
              category: group.heading,
              to: item.to,
              icon: item.icon,
            });
          }
        }
      });
    });

    if (q && q.length >= 2) {
      // Search registrations
      const matchingRegs = db.registrations
        .filter((r) => {
          const name = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
          return name.includes(q) || (r.reference || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q);
        })
        .slice(0, 4);

      matchingRegs.forEach((r) => {
        navItems.push({
          id: `reg-${r.id}`,
          title: `Registration: ${r.firstName} ${r.lastName} (${r.reference || r.id})`,
          category: 'Registrations',
          to: '/admin/registrations',
          icon: Command,
        });
      });

      // Search CRM contacts
      const matchingContacts = (db.crmContacts || [])
        .filter((c) => (c.fullName || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q))
        .slice(0, 3);

      matchingContacts.forEach((c) => {
        navItems.push({
          id: `crm-${c.id}`,
          title: `CRM Contact: ${c.fullName} (${c.email})`,
          category: 'CRM Directory',
          to: `/admin/crm/contacts/${c.id}`,
          icon: Command,
        });
      });

      // Search Media Assets & Logos
      const matchingMedia = (db.mediaAssets || [])
        .filter((m) => m.title.toLowerCase().includes(q) || m.fileName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
        .slice(0, 3);

      matchingMedia.forEach((m) => {
        navItems.push({
          id: `media-${m.id}`,
          title: `Media Asset: ${m.title} (${m.category})`,
          category: 'Media & Library',
          to: '/admin/media-library',
          icon: Command,
        });
      });
    }

    return navItems;
  }, [query, can, db]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  function handleSelect(to: string) {
    onClose();
    setQuery('');
    navigate(to);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter' && items[selectedIndex]) {
      e.preventDefault();
      handleSelect(items[selectedIndex].to);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-slideDown"
        onKeyDown={handleKeyDown}
      >
        {/* Command Search Header */}
        <div className="relative flex items-center border-b border-slate-100 px-4 py-3.5 bg-slate-50/50">
          <Search size={18} className="text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, registrations, contacts, or operations... (Cmd + K)"
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded">
              <X size={15} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-xs ml-2">
            ESC
          </kbd>
        </div>

        {/* Command Palette List */}
        <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No matching pages or records found for &quot;{query}&quot;
            </div>
          ) : (
            <ul className="space-y-1">
              {items.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleSelect(item.to)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                        isSelected ? 'bg-slate-900 text-white font-medium' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-md ${isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm">{item.title}</p>
                          <p className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {item.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                            Jump <CornerDownLeft size={11} />
                          </span>
                        )}
                        <ArrowRight size={14} className={isSelected ? 'text-white' : 'text-slate-300'} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-white border border-slate-200 px-1 rounded">↑</kbd> <kbd className="bg-white border border-slate-200 px-1 rounded">↓</kbd> Navigate</span>
            <span><kbd className="bg-white border border-slate-200 px-1 rounded">↵</kbd> Select</span>
          </div>
          <span>Vachan Shivir Event Platform</span>
        </div>
      </div>
    </div>
  );
}
