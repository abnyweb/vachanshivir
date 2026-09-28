import { Info } from 'lucide-react';

/**
 * Shown wherever Vachan Shivir has not published information. The platform never invents content;
 * it says plainly what is missing and who supplies it.
 */
export function PendingNotice({ what }: { what: string }) {
  return (
    <div className="flex items-start gap-3 border border-amber-200 bg-amber-50/90 rounded-xl px-4 py-3.5 text-amber-900">
      <Info size={16} className="mt-0.5 shrink-0 text-amber-700" />
      <p className="text-[13.5px] leading-relaxed text-amber-900/90 font-medium">
        {what} Vachan Shivir has not published this yet. An administrator can add it from the admin area at any time.
      </p>
    </div>
  );
}
