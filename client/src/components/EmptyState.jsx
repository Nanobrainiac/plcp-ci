import { Inbox } from 'lucide-react';

export default function EmptyState({ title, body }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-12 text-center">
      <Inbox className="h-8 w-8 text-slate-400" />
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{body}</p>
    </div>
  );
}

