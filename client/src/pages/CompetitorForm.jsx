import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { api } from '../services/api.js';
import { tagsToArray, tagsToString } from '../utils/forms.js';
import HelpIndicator from '../components/HelpIndicator.jsx';

const blank = { company_name: '', website: '', category: '', positioning: '', services_offered: '', target_customers: '', strengths: '', weaknesses: '', notes: '', tags: '' };

export default function CompetitorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) api.competitor(id).then((data) => setForm({ ...data, tags: tagsToString(data.tags) }));
  }, [id]);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const payload = { ...form, tags: tagsToArray(form.tags) };
      const saved = id ? await api.updateCompetitor(id, payload) : await api.createCompetitor(payload);
      navigate(`/competitors/${saved.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">{id ? 'Edit Competitor' : 'Add Competitor'}</h1><HelpIndicator title="Competitor Form">Add public-source competitor facts and internal observations. Better profile detail leads to better SWOT and positioning analysis.</HelpIndicator></div>
        <p className="text-sm text-slate-500">Capture the fields needed for profile detail, search, and SWOT generation.</p>
      </div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="panel grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2"><HelpIndicator title="Profile Fields">Use neutral, specific language. Put factual public claims in fields like services and positioning, and reserve notes for context or internal interpretation.</HelpIndicator></div>
        <Field label="Company name" name="company_name" value={form.company_name} onChange={update} required />
        <Field label="Website" name="website" value={form.website} onChange={update} />
        <Field label="Category" name="category" value={form.category} onChange={update} />
        <Field label="Tags" name="tags" value={form.tags} onChange={update} placeholder="analytics, defense, rehab" />
        <Text label="Positioning" name="positioning" value={form.positioning} onChange={update} />
        <Text label="Services offered" name="services_offered" value={form.services_offered} onChange={update} />
        <Text label="Target customers" name="target_customers" value={form.target_customers} onChange={update} />
        <Text label="Strengths" name="strengths" value={form.strengths} onChange={update} />
        <Text label="Weaknesses" name="weaknesses" value={form.weaknesses} onChange={update} />
        <Text label="Notes" name="notes" value={form.notes} onChange={update} />
      </div>
      <button className="btn-primary" type="submit"><Save className="h-4 w-4" /> Save competitor</button>
    </form>
  );
}

function Field({ label, ...props }) {
  return <label className="space-y-1"><span className="label">{label}</span><input className="field" {...props} /></label>;
}

function Text({ label, ...props }) {
  return <label className="space-y-1"><span className="label">{label}</span><textarea className="field min-h-28" {...props} /></label>;
}
