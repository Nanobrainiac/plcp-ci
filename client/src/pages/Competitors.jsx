import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api } from '../services/api.js';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import HelpIndicator from '../components/HelpIndicator.jsx';

export default function Competitors() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  useEffect(() => { api.competitors().then(setItems); }, []);
  const filtered = items.filter((item) => (!category || item.category === category) && (!tag || item.tags?.includes(tag)));
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
  const tags = useMemo(() => [...new Set(items.flatMap((item) => item.tags || []))], [items]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">Competitors</h1><HelpIndicator title="Competitors">Use competitor profiles for durable facts: positioning, services, target customers, strengths, weaknesses, notes, and tags.</HelpIndicator></div>
          <p className="text-sm text-slate-500">Profiles, positioning, services, notes, and related intelligence.</p>
        </div>
        <Link to="/competitors/new" className="btn-primary"><Plus className="h-4 w-4" /> Add</Link>
      </div>
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <HelpIndicator title="Filters">Filter by category or tag to narrow the competitor list. Consistent tags make search and analysis more useful.</HelpIndicator>
        <select className="field max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((value) => <option key={value}>{value}</option>)}
        </select>
        <select className="field max-w-xs" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All tags</option>
          {tags.map((value) => <option key={value}>{value}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? <EmptyState title="No competitors found" body="Add a competitor profile or adjust filters." /> : (
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3"><h2 className="font-semibold">Competitor Table</h2><HelpIndicator title="Competitor Table">Click a company name to open its profile. Profiles with richer services, strengths, weaknesses, and related intelligence produce better SWOT output.</HelpIndicator></div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Company</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Positioning</th><th className="px-4 py-3">Tags</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium"><Link to={`/competitors/${item.id}`}>{item.company_name}</Link></td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3 text-slate-600">{item.positioning}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{item.tags?.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
