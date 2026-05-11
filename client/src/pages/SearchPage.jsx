import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../services/api.js';
import Badge from '../components/Badge.jsx';
import HelpIndicator from '../components/HelpIndicator.jsx';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [results, setResults] = useState({ competitors: [], intelligence: [] });

  useEffect(() => {
    const q = params.get('q') || '';
    setQuery(q);
    if (q) api.search(q).then(setResults);
  }, [params]);

  function submit(event) {
    event.preventDefault();
    setParams({ q: query });
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">Natural Language Search</h1><HelpIndicator title="Search">Search currently uses keyword matching across competitor profiles and intelligence items. Tags and detailed text improve results.</HelpIndicator></div>
        <p className="text-sm text-slate-500">Keyword search now, with service hooks ready for embeddings and semantic ranking.</p>
      </div>
      <form onSubmit={submit} className="panel flex items-center gap-3 p-4">
        <HelpIndicator title="Search Query">Try terms such as physician-led, rebuttal, vocational, economic damages, expert witness, or a competitor name.</HelpIndicator>
        <input className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Example: competitors creating risks around automated damages tools" />
        <button className="btn-primary"><Search className="h-4 w-4" /> Search</button>
      </form>
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2"><h2 className="font-semibold">Competitors</h2><HelpIndicator title="Competitor Results">These matches come from profile fields including positioning, services, strengths, weaknesses, notes, and tags.</HelpIndicator></div>
          <div className="space-y-3">{results.competitors.map((item) => <Link className="block rounded-md border border-slate-100 p-3 hover:bg-slate-50" to={`/competitors/${item.id}`} key={item.id}><p className="font-medium">{item.company_name}</p><p className="mt-1 text-sm text-slate-500">{item.positioning}</p><div className="mt-2 flex gap-2">{item.tags?.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div></Link>)}</div>
        </div>
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2"><h2 className="font-semibold">Intelligence</h2><HelpIndicator title="Intelligence Results">These matches come from item titles, source URLs, authors, raw content, and tags.</HelpIndicator></div>
          <div className="space-y-3">{results.intelligence.map((item) => <div className="rounded-md border border-slate-100 p-3" key={item.id}><p className="font-medium">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.raw_content}</p><div className="mt-2 flex gap-2">{item.tags?.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div></div>)}</div>
        </div>
      </section>
    </div>
  );
}
