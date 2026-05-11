import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Brain, Building2, FilePlus2, Files, LayoutDashboard, PlusCircle, Search, Target } from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/competitors', label: 'Competitors', icon: Building2 },
  { to: '/competitors/new', label: 'Add Competitor', icon: PlusCircle },
  { to: '/intelligence', label: 'Repository', icon: Files },
  { to: '/intelligence/new', label: 'Add Intelligence', icon: FilePlus2 },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/insights', label: 'Insights', icon: Brain },
  { to: '/positioning', label: 'Positioning', icon: Target },
  { to: '/help', label: 'Help', icon: BookOpen }
];

export default function Layout() {
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get('q');
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="min-h-screen bg-cloud">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-ink text-white lg:block">
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-mint">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">PLCP</p>
            <p className="text-xs text-slate-300">Competitive Intelligence</p>
          </div>
        </div>
        <nav className="space-y-1 px-3">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-white/12 text-white' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
          <form onSubmit={submit} className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input name="q" className="field pl-9" placeholder="Search competitors, risks, opportunities, services, market trends..." />
            </div>
            <button className="btn-primary" type="submit">Search</button>
          </form>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
