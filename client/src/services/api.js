const base = '';

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  dashboard: () => request('/api/dashboard'),
  competitors: (params = '') => request(`/api/competitors${params}`),
  competitor: (id) => request(`/api/competitors/${id}`),
  createCompetitor: (data) => request('/api/competitors', { method: 'POST', body: JSON.stringify(data) }),
  updateCompetitor: (id, data) => request(`/api/competitors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCompetitor: (id) => request(`/api/competitors/${id}`, { method: 'DELETE' }),
  intelligence: (params = '') => request(`/api/intelligence${params}`),
  intelligenceItem: (id) => request(`/api/intelligence/${id}`),
  createIntelligence: (data) => request('/api/intelligence', { method: 'POST', body: JSON.stringify(data) }),
  summarize: (id) => request(`/api/intelligence/${id}/summarize`, { method: 'POST' }),
  swot: (id) => request(`/api/competitors/${id}/swot`, { method: 'POST' }),
  search: (q) => request(`/api/search?q=${encodeURIComponent(q)}`),
  insights: () => request('/api/insights'),
  generateInsights: (query) => request('/api/insights/generate', { method: 'POST', body: JSON.stringify({ query }) }),
  positioning: () => request('/api/positioning'),
  updatePlcpProfile: (data) => request('/api/positioning/profile', { method: 'PUT', body: JSON.stringify(data) }),
  analyzePositioning: () => request('/api/positioning/analyze', { method: 'POST' }),
  askHelp: (question) => request('/api/help/ask', { method: 'POST', body: JSON.stringify({ question }) })
};
