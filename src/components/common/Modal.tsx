import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  tone?: 'dark' | 'light';
}

export function Modal({ open, title, onClose, children, footer, tone = 'light' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Escape handling and scroll lock depend only on `open`, so a parent re-render while
  // the dialog is open does not tear these down and set them up again.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // Focus the dialog once when it opens. Re-focusing on every render would pull focus out
  // of whichever field the person is typing in.
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  if (!open) return null;
  const light = tone === 'light';

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        className={`w-full max-w-2xl rounded-sm shadow-lift focus:outline-none ${light ? 'bg-white text-ink' : 'bg-ink-800 text-white'}`}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 ${light ? 'border-ink/10' : 'border-white/10'}`}>
          <h2 className="text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-sm p-1 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && (
          <div className={`flex justify-end gap-2 border-t px-5 py-4 ${light ? 'border-ink/10 bg-bone' : 'border-white/10'}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
