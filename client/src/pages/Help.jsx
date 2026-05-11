import { useState } from 'react';
import { AlertTriangle, BookOpen, Brain, CheckCircle2, Database, FilePlus2, MessageCircleQuestion, Search, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { api } from '../services/api.js';
import HelpIndicator from '../components/HelpIndicator.jsx';

const workflows = [
  {
    title: 'Add a competitor profile',
    steps: [
      'Open Competitors, then choose Add.',
      'Enter public website, category, positioning, services, target customers, strengths, weaknesses, notes, and tags.',
      'Use concise tags such as life-care-planning, expert-witness, vocational, physician-led, or economic-damages.',
      'Open the saved competitor detail page to review related intelligence and generate SWOT.'
    ]
  },
  {
    title: 'Add an intelligence item',
    steps: [
      'Open Repository, then choose Add.',
      'Paste a source URL and add manual text from the public page, article, email, or internal note.',
      'Attach the item to a related competitor when applicable.',
      'Add tags that describe the content, not just the source.'
    ]
  },
  {
    title: 'Generate AI analysis',
    steps: [
      'Use AI Summary on an intelligence item to create executive summary, takeaways, risks, opportunities, and relevance to PLCP.',
      'Use Generate SWOT on a competitor detail page after the profile and related intelligence have enough context.',
      'Use Generate Insight on the Insights page for an executive synthesis across the repository.',
      'Use Generate Analysis on Positioning to compare PLCP against competitors and surface market gaps.'
    ]
  }
];

const pages = [
  ['Dashboard', 'Quick overview of competitor count, article count, generated insights, recent competitors, recent intelligence, and activity.'],
  ['Competitors', 'Structured company profiles for organizations PLCP wants to monitor. Use this for durable information about each competitor.'],
  ['Repository', 'Source-backed intelligence items: webpages, articles, manual notes, market updates, and public positioning excerpts.'],
  ['Search', 'Keyword-based search across competitors and intelligence. Search works best when records have clear tags and descriptive text.'],
  ['Insights', 'Stored AI summaries, SWOT outputs, and generated executive syntheses. Article summaries are created from the Repository page.'],
  ['Positioning', 'Admin-managed PLCP profile plus PLCP-vs-competitor feature matrix, strengths, weaknesses, opportunities, and strategic recommendations.']
];

const tagExamples = ['life-care-planning', 'physician-led', 'expert-witness', 'rebuttal-review', 'economic-damages', 'vocational', 'ime', 'nationwide', 'litigation-support'];

export default function Help() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function ask(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setAnswer(null);
    try {
      setAnswer(await api.askHelp(question));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">User Guide</h1>
        <p className="mt-1 text-sm text-slate-600">How to use the PLCP Competitive Intelligence Repository consistently and safely.</p>
      </div>

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircleQuestion className="h-5 w-5 text-mint" />
          <h2 className="font-semibold">Ask For Help</h2>
          <HelpIndicator title="Ask For Help">Use this assistant for questions about using the app. Keep questions about workflows, pages, fields, AI buttons, and data entry standards.</HelpIndicator>
        </div>
        <p className="mb-3 text-sm text-slate-600">Ask questions about how to use this app. Do not enter confidential client details, protected health information, or privileged case strategy.</p>
        <form onSubmit={ask} className="space-y-3">
          <textarea
            className="field min-h-24"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: Why is AI Summary empty? How do I generate a SWOT? What should go in an intelligence item?"
          />
          <button className="btn-primary" disabled={busy || !question.trim()} type="submit">
            <Sparkles className="h-4 w-4" /> {busy ? 'Answering...' : 'Ask assistant'}
          </button>
        </form>
        {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {answer && (
          <div className="mt-4 rounded-md border border-slate-100 bg-slate-50 p-4">
            <h3 className="font-semibold">Answer</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{answer.answer}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ListBlock title="Next Steps" items={answer.next_steps} />
              <ListBlock title="Related Pages" items={answer.related_pages} />
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <GuideCard icon={BookOpen} title="Purpose" body="Centralize competitor profiles, source-backed intelligence, AI summaries, SWOT analyses, and PLCP positioning notes." />
        <GuideCard icon={Database} title="Data Standard" body="Prefer public-source facts, clear notes, source URLs, and tags. Separate facts from internal assumptions." />
        <GuideCard icon={Brain} title="AI Role" body="AI drafts summaries and recommendations. Users should validate outputs before relying on them." />
        <GuideCard icon={ShieldCheck} title="Privacy" body="Avoid entering confidential client data, protected health information, or privileged legal strategy." />
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <FilePlus2 className="h-5 w-5 text-mint" />
          <h2 className="font-semibold">Core Workflows</h2>
          <HelpIndicator title="Core Workflows">These are the most common steps new users follow when building and using the repository.</HelpIndicator>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <div key={workflow.title} className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-semibold">{workflow.title}</h3>
              <ol className="mt-3 space-y-2 text-sm text-slate-600">
                {workflow.steps.map((step, index) => <li key={step}>{index + 1}. {step}</li>)}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-steel" />
            <h2 className="font-semibold">Page Reference</h2>
            <HelpIndicator title="Page Reference">Use this section to understand what each sidebar page is responsible for.</HelpIndicator>
          </div>
          <div className="divide-y divide-slate-100">
            {pages.map(([title, body]) => (
              <div key={title} className="py-3">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-mint" />
            <h2 className="font-semibold">Positioning Indicators</h2>
            <HelpIndicator title="Positioning Indicators">These definitions explain the colored labels used in the PLCP-vs-competitor matrix.</HelpIndicator>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <Indicator label="Advantage" body="PLCP appears stronger or more explicit on this feature than the competitor." className="bg-emerald-50 text-emerald-700 ring-emerald-200" />
            <Indicator label="Parity" body="PLCP and the competitor both appear to offer or message this capability." className="bg-slate-100 text-slate-700 ring-slate-200" />
            <Indicator label="Weakness" body="The competitor appears stronger or PLCP has limited evidence in the profile." className="bg-red-50 text-red-700 ring-red-200" />
            <Indicator label="Opportunity" body="A visible market need or competitor gap that PLCP may be able to exploit." className="bg-amber-50 text-amber-700 ring-amber-200" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-mint" />
            <h2 className="font-semibold">Data Entry Standards</h2>
            <HelpIndicator title="Data Entry Standards">Follow these standards to keep search, filters, AI analysis, and future reporting useful.</HelpIndicator>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Use the source URL whenever the intelligence comes from a public page or article.</li>
            <li>Write neutral notes: what the source says, why it matters, and how it relates to PLCP.</li>
            <li>Keep competitor strengths and weaknesses grounded in visible evidence or internal validation.</li>
            <li>Use consistent tags so search and filtering stay useful.</li>
            <li>Update old records rather than creating duplicates for the same source.</li>
          </ul>
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber" />
            <h2 className="font-semibold">Review Before Sharing</h2>
            <HelpIndicator title="Review Before Sharing">AI output and public-source competitor claims should be reviewed before using them in decisions or presentations.</HelpIndicator>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>AI output is a draft, not a final strategic conclusion.</li>
            <li>Check source URLs and competitor profiles before using generated recommendations.</li>
            <li>Do not treat public marketing claims as independently verified facts.</li>
            <li>Confirm internal PLCP weaknesses, pricing position, and goals with leadership before relying on positioning analysis.</li>
            <li>Remove stale demo rows if they are no longer useful for training or testing.</li>
          </ul>
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex items-center gap-2"><h2 className="font-semibold">Recommended Tags</h2><HelpIndicator title="Recommended Tags">Use these tags as a controlled vocabulary starter so filters and search behave predictably.</HelpIndicator></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {tagExamples.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{tag}</span>)}
        </div>
      </section>
    </div>
  );
}

function GuideCard({ icon: Icon, title, body }) {
  return (
    <div className="panel p-5">
      <Icon className="h-5 w-5 text-steel" />
      <h2 className="mt-3 font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function Indicator({ label, body, className }) {
  return (
    <div className="rounded-md border border-slate-100 p-3">
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ${className}`}>{label}</span>
      <p className="mt-2">{body}</p>
    </div>
  );
}

function ListBlock({ title, items = [] }) {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-slate-500">{title}</h4>
      <ul className="mt-2 space-y-1 text-sm text-slate-600">
        {safeItems.length === 0 ? <li>No suggestions returned.</li> : safeItems.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
