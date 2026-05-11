import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function HelpIndicator({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`Help: ${title}`}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-steel focus:outline-none focus:ring-2 focus:ring-mint/30"
        onClick={() => setOpen((value) => !value)}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {open && (
        <span className="absolute left-0 top-8 z-30 w-80 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-lg">
          <span className="flex items-start justify-between gap-3">
            <span className="text-sm font-semibold text-ink">{title}</span>
            <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={() => setOpen(false)} aria-label="Close help">
              <X className="h-4 w-4" />
            </button>
          </span>
          <span className="mt-2 block text-sm leading-6 text-slate-600">{children}</span>
        </span>
      )}
    </span>
  );
}
