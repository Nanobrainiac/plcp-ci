import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import Badge from '../components/Badge.jsx';
import { formatDate } from '../utils/forms.js';
import HelpIndicator from '../components/HelpIndicator.jsx';

export default function Intelligence() {
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState('');
  const [tag, setTag] = useState('');
  const [type, setType] = useState('');
  useEffect(() => { api.intelligence().then(setItems); }, []);
  const tags = useMemo(() => [...new Set(items.flatMap((item) => item.tags || []))], [items]);
  const filtered = items.filter((item) => (!tag || item.tags?.includes(tag)) && (!type || item.source_type === type));

  async function summarize(id) {
    setBusyId(id);
    try {
      await api.summarize(id);
      setItems(await api.intelligence());
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">Intelligence Repository</h1><HelpIndicator title="Intelligence Repository">Store source-backed items here: public webpages, articles, manual notes, and observations that may affect PLCP strategy.</HelpIndicator></div>
          <p className="text-sm text-slate-500">Articles, webpages, manual notes, AI summaries, and tags.</p>
        </div>
        <Link to="/intelligence/new" className="btn-primary"><Plus className="h-4 w-4" /> Add</Link>
      </div>
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <HelpIndicator title="Repository Filters">Use source type and tags to focus the repository before reviewing or generating summaries.</HelpIndicator>
        <select className="field max-w-xs" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All source types</option><option>article</option><option>webpage</option><option>manual</option>
        </select>
        <select className="field max-w-xs" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All tags</option>
          {tags.map((value) => <option key={value}>{value}</option>)}
        </select>
      </div>
      <div className="space-y-4">
        {filtered.map((item) => (
          <article key={item.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{item.source_type} · {formatDate(item.publication_date)} · {item.author || 'Unknown author'}</p>
              </div>
              <div className="flex items-center gap-2"><HelpIndicator title="AI Summary">Creates an article-level executive summary, key takeaways, risks, opportunities, and relevance to PLCP from this item.</HelpIndicator><button className="btn-secondary" disabled={busyId === item.id} onClick={() => summarize(item.id)}><Sparkles className="h-4 w-4" /> {busyId === item.id ? 'Summarizing...' : 'AI Summary'}</button></div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.raw_content}</p>
            <div className="mt-3 flex flex-wrap gap-2">{item.tags?.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
