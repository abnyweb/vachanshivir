import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import { listActiveAnnouncements } from '../../services/documentService';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';

export function AnnouncementBar() {
  const { db } = useStore();
  const event = useCurrentEvent();
  const [dismissed, setDismissed] = useState(false);
  const announcements = listActiveAnnouncements(db, event.id);

  if (dismissed || announcements.length === 0) return null;

  return (
    <div className="bg-navy-950 border-b border-crossgold/40 text-white">
      <div className="shell flex items-center gap-4 py-2 text-xs">
        <p className="flex-1 leading-snug">
          <span className="font-bold text-crossgold font-raleway">{announcements[0].title}. </span>
          <span className="text-slate-200">{announcements[0].body}</span>
        </p>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss announcement" className="shrink-0 p-1 text-slate-300 hover:text-white">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
