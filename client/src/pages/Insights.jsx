import { useEffect, useState } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import HelpIndicator from '../components/HelpIndicator.jsx';

export default function Insights() {
  const [data, setData] = useState({ summaries: [], swots: [], generated: [] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setData(await api.insights());
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  async function generate() {
    setBusy(true);
    setError('');
    try {
      await api.generateInsights('Synthesize the strongest competitive risks and opportunities for PLCP from the current repository.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">Insights</h1><HelpIndicator title="Insights">This page collects generated AI outputs. Article summaries come from Repository items; SWOT comes from competitor pages; executive syntheses come from Generate Insight.</HelpIndicator></div>
          <p className="text-sm text-slate-500">Stored AI summaries, SWOT outputs, and executive-level synthesis.</p>
        </div>
        <div className="flex items-center gap-2"><HelpIndicator title="Generate Insight">Creates a high-level synthesis of competitive risks and opportunities across the repository. It is separate from article-level AI summaries.</HelpIndicator><button onClick={generate} className="btn-primary" disabled={busy}><Sparkles className="h-4 w-4" /> {busy ? 'Generating...' : 'Generate Insight'}</button></div>
      </div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <section className="panel p-5">
        <div className="mb-3 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber" /><h2 className="font-semibold">Generated Executive Syntheses</h2><HelpIndicator title="Executive Syntheses">Broad AI-generated takeaways and recommended actions based on the repository. Use these as drafts for internal discussion.</HelpIndicator></div>
        <div className="space-y-3">
          {asArray(data.generated).length === 0 && <p className="text-sm text-slate-500">No generated insight syntheses yet.</p>}
          {asArray(data.generated).map((item) => (
            <div className="rounded-md border border-slate-100 p-3" key={item.id}>
              <p className="text-xs font-semibold uppercase text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
              <List title="Insights" items={item.insights} />
              <List title="Recommended Actions" items={item.recommended_actions} />
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2"><h2 className="font-semibold">AI Summaries</h2><HelpIndicator title="AI Summaries">These appear after clicking AI Summary on individual intelligence items in the Repository.</HelpIndicator></div>
          <div className="space-y-3">
            {asArray(data.summaries).length === 0 && <p className="text-sm text-slate-500">No AI summaries yet. Generate summaries from the Intelligence Repository page.</p>}
            {asArray(data.summaries).map((item) => <div className="rounded-md border border-slate-100 p-3" key={item.id}><p className="font-medium">{item.executive_summary || 'Summary has no executive summary text.'}</p><List title="Key Takeaways" items={item.key_takeaways} /></div>)}
          </div>
        </div>
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2"><h2 className="font-semibold">SWOT Analyses</h2><HelpIndicator title="SWOT Analyses">These appear after generating SWOT from a competitor detail page.</HelpIndicator></div>
          <div className="space-y-3">
            {asArray(data.swots).length === 0 && <p className="text-sm text-slate-500">No SWOT analyses yet. Generate SWOT from a competitor detail page.</p>}
            {asArray(data.swots).map((item) => <div className="rounded-md border border-slate-100 p-3" key={item.id}><List title="Strengths" items={item.strengths} /><List title="Threats" items={item.threats} /></div>)}
          </div>
        </div>
      </section>
    </div>
  );
}

function List({ title, items = [] }) {
  const safeItems = asArray(items);
  return <div className="mt-3"><h3 className="text-xs font-semibold uppercase text-slate-500">{title}</h3><ul className="mt-2 space-y-1 text-sm text-slate-600">{safeItems.length === 0 ? <li>No content yet.</li> : safeItems.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(asArray);
  return [];
}
