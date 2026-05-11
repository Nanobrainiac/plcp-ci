import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2 } from 'lucide-react';
import { api } from '../services/api.js';
import { tagsToArray } from '../utils/forms.js';
import HelpIndicator from '../components/HelpIndicator.jsx';

export default function IntelligenceForm() {
  const navigate = useNavigate();
  const [competitors, setCompetitors] = useState([]);
  const [form, setForm] = useState({ title: '', source_url: '', source_type: 'manual', publication_date: '', author: '', raw_content: '', tags: '', competitor_id: '' });
  const [error, setError] = useState('');
  useEffect(() => { api.competitors().then(setCompetitors); }, []);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const payload = { ...form, tags: tagsToArray(form.tags), competitor_id: form.competitor_id || null };
      await api.createIntelligence(payload);
      navigate('/intelligence');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">Add Intelligence</h1><HelpIndicator title="Add Intelligence">Use this form for specific public-source pages, articles, or manual notes. Attach a competitor when the item clearly relates to one.</HelpIndicator></div>
        <p className="text-sm text-slate-500">Paste article text or add a URL. URL-only entries use a mock scraping adapter for now.</p>
      </div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="panel grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2"><HelpIndicator title="Raw Content">Paste the useful excerpt or summary from the source. This text is what AI summaries and search use, so include enough context to be meaningful.</HelpIndicator></div>
        <Field label="Title" name="title" value={form.title} onChange={update} required />
        <Field label="Source URL" name="source_url" value={form.source_url} onChange={update} />
        <label className="space-y-1"><span className="label">Source type</span><select name="source_type" className="field" value={form.source_type} onChange={update}><option>manual</option><option>article</option><option>webpage</option></select></label>
        <Field label="Publication date" type="date" name="publication_date" value={form.publication_date} onChange={update} />
        <Field label="Author" name="author" value={form.author} onChange={update} />
        <label className="space-y-1"><span className="label">Related competitor</span><select name="competitor_id" className="field" value={form.competitor_id} onChange={update}><option value="">None</option>{competitors.map((item) => <option value={item.id} key={item.id}>{item.company_name}</option>)}</select></label>
        <Field label="Tags" name="tags" value={form.tags} onChange={update} placeholder="automation, defense, risk" />
        <label className="space-y-1 md:col-span-2"><span className="label">Raw content</span><textarea name="raw_content" className="field min-h-44" value={form.raw_content} onChange={update} /></label>
      </div>
      <button className="btn-primary" type="submit"><FilePlus2 className="h-4 w-4" /> Save intelligence</button>
    </form>
  );
}

function Field({ label, ...props }) {
  return <label className="space-y-1"><span className="label">{label}</span><input className="field" {...props} /></label>;
}
