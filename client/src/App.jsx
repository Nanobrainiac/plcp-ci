import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Competitors from './pages/Competitors.jsx';
import CompetitorForm from './pages/CompetitorForm.jsx';
import CompetitorDetail from './pages/CompetitorDetail.jsx';
import Intelligence from './pages/Intelligence.jsx';
import IntelligenceForm from './pages/IntelligenceForm.jsx';
import SearchPage from './pages/SearchPage.jsx';
import Insights from './pages/Insights.jsx';
import Positioning from './pages/Positioning.jsx';
import Help from './pages/Help.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/competitors" element={<Competitors />} />
        <Route path="/competitors/new" element={<CompetitorForm />} />
        <Route path="/competitors/:id" element={<CompetitorDetail />} />
        <Route path="/competitors/:id/edit" element={<CompetitorForm />} />
        <Route path="/intelligence" element={<Intelligence />} />
        <Route path="/intelligence/new" element={<IntelligenceForm />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/positioning" element={<Positioning />} />
        <Route path="/help" element={<Help />} />
      </Route>
    </Routes>
  );
}
