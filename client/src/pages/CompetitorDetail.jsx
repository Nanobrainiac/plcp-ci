import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Brain, Edit, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import Badge from '../components/Badge.jsx';
import HelpIndicator from '../components/HelpIndicator.jsx';

export default function CompetitorDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setData(await api.competitor(id));
  }

  useEffect(() => { load(); }, [id]);
  if (!data) return <p className="text-sm text-slate-500">Loading competitor...</p>;

  async function generateSwot() {
    setBusy(true);
    setError('');
    try {
      await api.swot(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">{data.company_name}</h1><HelpIndicator title="Competitor Detail">Review the full profile, related intelligence, and generated SWOT for this competitor. Use Edit to improve source-backed fields before generating analysis.</HelpIndicator></div>
          <p className="mt-1 text-sm text-slate-500">{data.positioning}</p>
          <div className="mt-3 flex flex-wrap gap-2">{data.tags?.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
        </div>
        <div className="flex gap-2">
          <Link className="btn-secondary" to={`/competitors/${id}/edit`}><Edit className="h-4 w-4" /> Edit</Link>
          <div className="flex items-center gap-2"><HelpIndicator title="Generate SWOT">Creates strengths, weaknesses, opportunities, and threats from this profile and its related intelligence. Review output before using it externally.</HelpIndicator><button className="btn-primary" onClick={generateSwot} disabled={busy}><Sparkles className="h-4 w-4" /> {busy ? 'Generating...' : 'Generate SWOT'}</button></div>
        </div>
      </div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <section className="grid gap-4 lg:grid-cols-3">
        <Info title="Services" value={data.services_offered} />
        <Info title="Target Customers" value={data.target_customers} />
        <Info title="Notes" value={data.notes} />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <Info title="Strengths" value={data.strengths} />
        <Info title="Weaknesses" value={data.weaknesses} />
      </section>
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2"><Brain className="h-5 w-5 text-mint" /><h2 className="font-semibold">SWOT Analysis</h2><HelpIndicator title="SWOT Analysis">AI-generated strategy draft. Strong outputs depend on complete profile fields and useful related intelligence.</HelpIndicator></div>
        {data.swot ? <Swot swot={data.swot} /> : <p className="text-sm text-slate-500">No SWOT generated yet.</p>}
      </section>
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2"><h2 className="font-semibold">Related Intelligence</h2><HelpIndicator title="Related Intelligence">Items linked to this competitor. Add more source-backed records to improve summaries, search, SWOT, and positioning analysis.</HelpIndicator></div>
        <div className="space-y-3">
          {data.intelligence?.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-100 p-3">
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.raw_content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({ title, value }) {
  return <div className="panel p-5"><h2 className="mb-2 text-sm font-semibold text-slate-500">{title}</h2><p className="text-sm leading-6">{value || 'Not provided'}</p></div>;
}

function Swot({ swot }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {['strengths', 'weaknesses', 'opportunities', 'threats'].map((key) => (
        <div key={key} className="rounded-md border border-slate-100 bg-slate-50 p-3">
          <h3 className="mb-2 text-sm font-semibold capitalize">{key}</h3>
          <ul className="space-y-2 text-sm text-slate-600">{swot[key]?.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}
