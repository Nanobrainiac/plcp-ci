import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Brain, Building2, Files } from 'lucide-react';
import { api } from '../services/api.js';
import Badge from '../components/Badge.jsx';
import HelpIndicator from '../components/HelpIndicator.jsx';

const cards = [
  ['competitors', 'Total Competitors', Building2],
  ['articles', 'Articles Ingested', Files],
  ['insights', 'Insights Generated', Brain],
  ['activity', 'Recent Activity', Activity]
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { api.dashboard().then(setData); }, []);
  if (!data) return <p className="text-sm text-slate-500">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-ink">Competitive Intelligence Repository</h1>
          <HelpIndicator title="Dashboard">Use this page as the daily snapshot: totals, recent competitor changes, new intelligence, and recent system activity.</HelpIndicator>
        </div>
        <p className="mt-1 text-sm text-slate-600">Track competitor movement, article intelligence, summaries, SWOT analyses, and PLCP strategy signals.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        {cards.map(([key, label, Icon]) => (
          <div key={key} className="panel p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p className="text-sm text-slate-500">{label}</p>
                <HelpIndicator title={label}>This card counts records currently stored in the repository and helps spot whether the database is growing as expected.</HelpIndicator>
              </div>
              <Icon className="h-5 w-5 text-steel" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-ink">{data.totals[key]}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><h2 className="font-semibold">Recent Competitors</h2><HelpIndicator title="Recent Competitors">Recently added or updated competitor profiles. Open a profile to review details, related intelligence, or generate SWOT.</HelpIndicator></div>
            <Link className="text-sm font-semibold text-mint" to="/competitors">View all</Link>
          </div>
          <div className="space-y-3">
            {data.recentCompetitors.map((competitor) => (
              <Link key={competitor.id} to={`/competitors/${competitor.id}`} className="block rounded-md border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{competitor.company_name}</p>
                  <Badge>{competitor.category}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{competitor.positioning}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><h2 className="font-semibold">Recent Intelligence</h2><HelpIndicator title="Recent Intelligence">Newest intelligence items from public pages, articles, or manual notes. These items feed summaries, SWOT, search, and positioning analysis.</HelpIndicator></div>
            <Link className="text-sm font-semibold text-mint" to="/intelligence">View all</Link>
          </div>
          <div className="space-y-3">
            {data.recentIntelligence.map((item) => (
              <div key={item.id} className="rounded-md border border-slate-100 p-3">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.raw_content}</p>
                <div className="mt-2 flex flex-wrap gap-2">{item.tags?.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2"><h2 className="font-semibold">Activity</h2><HelpIndicator title="Activity">Audit-style feed of recent app events such as competitor creation, intelligence ingestion, and AI generation.</HelpIndicator></div>
        <div className="divide-y divide-slate-100">
          {data.activity.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-3 text-sm">
              <span>{entry.description}</span>
              <span className="text-slate-500">{new Date(entry.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
