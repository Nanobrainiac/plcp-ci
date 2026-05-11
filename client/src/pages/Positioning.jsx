import { useEffect, useState } from 'react';
import { Save, Sparkles, Target } from 'lucide-react';
import { api } from '../services/api.js';
import HelpIndicator from '../components/HelpIndicator.jsx';

const statusStyles = {
  advantage: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  parity: 'bg-slate-100 text-slate-700 ring-slate-200',
  weakness: 'bg-red-50 text-red-700 ring-red-200',
  opportunity: 'bg-amber-50 text-amber-700 ring-amber-200'
};

export default function Positioning() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const payload = await api.positioning();
    setData(payload);
    setForm(toForm(payload.profile));
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function saveProfile(event) {
    event.preventDefault();
    setBusy('save');
    setError('');
    try {
      await api.updatePlcpProfile(fromForm(form));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  }

  async function analyze() {
    setBusy('analyze');
    setError('');
    try {
      await api.analyzePositioning();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  }

  if (!data || !form) return <p className="text-sm text-slate-500">Loading positioning dashboard...</p>;

  const analysis = data.latestAnalysis?.analysis;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">Internal Positioning Analysis</h1><HelpIndicator title="Positioning Analysis">Compare PLCP against competitors using the PLCP profile, competitor profiles, and intelligence items. Validate AI recommendations before using them.</HelpIndicator></div>
          <p className="text-sm text-slate-500">Compare PLCP against competitors, identify gaps, and generate strategic recommendations.</p>
        </div>
        <button className="btn-primary" onClick={analyze} disabled={busy === 'analyze'}>
          <Sparkles className="h-4 w-4" /> {busy === 'analyze' ? 'Analyzing...' : 'Generate Analysis'}
        </button>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={saveProfile} className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-mint" />
          <h2 className="font-semibold">PLCP Profile</h2>
          <HelpIndicator title="PLCP Profile">Admin-maintained description of PLCP services, differentiators, pricing position, strengths, weaknesses, target customers, and goals. This drives the comparison dashboard.</HelpIndicator>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Text label="Core services" name="core_services" value={form.core_services} onChange={update} />
          <Text label="Differentiators" name="differentiators" value={form.differentiators} onChange={update} />
          <Text label="Operational strengths" name="operational_strengths" value={form.operational_strengths} onChange={update} />
          <Text label="Weaknesses" name="weaknesses" value={form.weaknesses} onChange={update} />
          <Text label="Target customer profile" name="target_customer_profile" value={form.target_customer_profile} onChange={update} />
          <Text label="Strategic goals" name="strategic_goals" value={form.strategic_goals} onChange={update} />
          <label className="space-y-1 md:col-span-2">
            <span className="label">Pricing position</span>
            <input className="field" name="pricing_position" value={form.pricing_position} onChange={update} />
          </label>
        </div>
        <button className="btn-secondary mt-4" type="submit" disabled={busy === 'save'}>
          <Save className="h-4 w-4" /> {busy === 'save' ? 'Saving...' : 'Save PLCP profile'}
        </button>
      </form>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-2"><h2 className="font-semibold">PLCP vs Competitor Feature Matrix</h2><HelpIndicator title="Feature Matrix">Compares PLCP and competitors across services and positioning themes. Indicators are directional and should be reviewed against source data.</HelpIndicator></div>
          <p className="mt-1 text-sm text-slate-500">Visual indicators classify each feature as advantage, parity, weakness, or opportunity.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Feature</th>
                <th className="px-4 py-3">PLCP</th>
                {data.competitors.map((competitor) => <th className="px-4 py-3" key={competitor.id}>{competitor.company_name}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.comparison.featureMatrix.map((row) => (
                <tr key={row.feature}>
                  <td className="px-4 py-3 font-medium">{row.feature}</td>
                  <td className="px-4 py-3"><Status value={row.plcp} /></td>
                  {row.competitors.map((competitor) => <td className="px-4 py-3" key={competitor.id}><Status value={competitor.status} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Comparison title="Strength Comparisons" help="Compares PLCP operational strengths against each competitor strengths." rows={data.comparison.strengthComparisons} field="plcp" other="competitor" />
        <Comparison title="Weakness Comparisons" help="Compares PLCP known weaknesses against each competitor weaknesses. Public data often under-reports weaknesses." rows={data.comparison.weaknessComparisons} field="plcp" other="competitor" />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <AnalysisCard title="Competitive Differentiation" help="How PLCP can explain why it is meaningfully different from competitors." content={analysis?.competitive_differentiation_analysis} />
        <AnalysisCard title="Market Gap Analysis" help="Unmet or under-served market needs visible from competitor and intelligence data." items={analysis?.market_gap_analysis} />
        <AnalysisCard title="PLCP Strengths vs Market" help="Where PLCP appears strong relative to the monitored competitor set." items={analysis?.plcp_strengths_vs_market} />
        <AnalysisCard title="Weaknesses and Risks" help="Potential vulnerabilities to validate with internal evidence and customer feedback." items={analysis?.plcp_weaknesses_and_risks} />
        <AnalysisCard title="Opportunities Competitors Are Missing" help="Possible openings where competitors are not clearly positioned." items={analysis?.opportunities_competitors_are_missing} />
        <AnalysisCard title="Strategic Recommendations" help="Draft action ideas for internal review, not final strategy." items={analysis?.strategic_recommendations || data.comparison.recommendations} />
      </section>
    </div>
  );
}

function Text({ label, ...props }) {
  return (
    <label className="space-y-1">
      <span className="label">{label}</span>
      <textarea className="field min-h-28" {...props} />
    </label>
  );
}

function Status({ value }) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ring-1 ${statusStyles[value] || statusStyles.parity}`}>{value}</span>;
}

function Comparison({ title, help, rows }) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center gap-2"><h2 className="font-semibold">{title}</h2><HelpIndicator title={title}>{help}</HelpIndicator></div>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.competitor_id} className="rounded-md border border-slate-100 p-3">
            <h3 className="font-medium">{row.company_name}</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <List title="PLCP" items={row.plcp} />
              <List title="Competitor" items={row.competitor} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisCard({ title, help, content, items }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2"><h2 className="font-semibold">{title}</h2><HelpIndicator title={title}>{help}</HelpIndicator></div>
      {content ? <p className="mt-3 text-sm leading-6 text-slate-600">{content}</p> : <List items={items || ['Generate analysis to populate this section.']} />}
    </div>
  );
}

function List({ title, items = [] }) {
  return (
    <div>
      {title && <h4 className="text-xs font-semibold uppercase text-slate-500">{title}</h4>}
      <ul className="mt-2 space-y-1 text-sm text-slate-600">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function toForm(profile) {
  return {
    core_services: listToLines(profile.core_services),
    differentiators: listToLines(profile.differentiators),
    pricing_position: profile.pricing_position || '',
    operational_strengths: listToLines(profile.operational_strengths),
    weaknesses: listToLines(profile.weaknesses),
    target_customer_profile: profile.target_customer_profile || '',
    strategic_goals: listToLines(profile.strategic_goals)
  };
}

function fromForm(form) {
  return {
    ...form,
    core_services: linesToList(form.core_services),
    differentiators: linesToList(form.differentiators),
    operational_strengths: linesToList(form.operational_strengths),
    weaknesses: linesToList(form.weaknesses),
    strategic_goals: linesToList(form.strategic_goals)
  };
}

function listToLines(value = []) {
  return Array.isArray(value) ? value.join('\n') : value;
}

function linesToList(value) {
  return String(value || '').split(/\n|,/).map((item) => item.trim()).filter(Boolean);
}
