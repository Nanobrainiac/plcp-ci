import { supabase } from '../utils/supabase.js';

const base = import.meta.env.VITE_API_BASE_URL || '';
const directSupabase = !base && typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

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

async function selectRows(table, query = '*') {
  const { data, error } = await supabase.from(table).select(query).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

async function optionalRows(table, query = '*') {
  try {
    return await selectRows(table, query);
  } catch (error) {
    if (isMissingTable(error.message)) return [];
    throw error;
  }
}

async function listCompetitors(params = '') {
  const filters = new URLSearchParams(String(params).replace(/^\?/, ''));
  let rows = await selectRows('competitors');
  if (filters.get('category')) rows = rows.filter((item) => item.category === filters.get('category'));
  if (filters.get('tag')) rows = rows.filter((item) => item.tags?.includes(filters.get('tag')));
  return rows;
}

async function getCompetitor(id) {
  const { data, error } = await supabase.from('competitors').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  const intelligence = await listIntelligence(`?competitor_id=${encodeURIComponent(id)}`);
  const swots = await optionalRows('swot_analyses');
  const itemIds = new Set(intelligence.map((item) => item.id));
  const summaries = (await optionalRows('ai_summaries')).filter((summary) => itemIds.has(summary.intelligence_item_id));
  return {
    ...data,
    intelligence,
    summaries,
    swot: swots.find((swot) => swot.competitor_id === id) || null
  };
}

async function createCompetitor(data) {
  const row = {
    company_name: data.company_name,
    website: data.website || '',
    category: data.category || 'Uncategorized',
    positioning: data.positioning || '',
    services_offered: data.services_offered || '',
    target_customers: data.target_customers || '',
    strengths: data.strengths || '',
    weaknesses: data.weaknesses || '',
    notes: data.notes || '',
    tags: cleanTags(data.tags),
    updated_at: new Date().toISOString()
  };
  const { data: saved, error } = await supabase.from('competitors').insert(row).select().single();
  if (error) throw new Error(error.message);
  return saved;
}

async function updateCompetitor(id, data) {
  const row = {
    company_name: data.company_name,
    website: data.website || '',
    category: data.category || 'Uncategorized',
    positioning: data.positioning || '',
    services_offered: data.services_offered || '',
    target_customers: data.target_customers || '',
    strengths: data.strengths || '',
    weaknesses: data.weaknesses || '',
    notes: data.notes || '',
    tags: cleanTags(data.tags),
    updated_at: new Date().toISOString()
  };
  const { data: saved, error } = await supabase.from('competitors').update(row).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return saved;
}

async function deleteCompetitor(id) {
  const { error } = await supabase.from('competitors').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return null;
}

async function listIntelligence(params = '') {
  const filters = new URLSearchParams(String(params).replace(/^\?/, ''));
  let rows;
  try {
    rows = await selectRows('intelligence_items', '*, competitors(company_name)');
  } catch {
    rows = await selectRows('intelligence_items');
  }
  if (filters.get('competitor_id')) rows = rows.filter((item) => item.competitor_id === filters.get('competitor_id'));
  if (filters.get('source_type')) rows = rows.filter((item) => item.source_type === filters.get('source_type'));
  if (filters.get('tag')) rows = rows.filter((item) => item.tags?.includes(filters.get('tag')));
  return rows;
}

async function getIntelligence(id) {
  const { data, error } = await supabase.from('intelligence_items').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  const summaries = await optionalRows('ai_summaries');
  return {
    ...data,
    summary: summaries.find((summary) => summary.intelligence_item_id === id) || null
  };
}

async function createIntelligence(data) {
  const row = {
    title: data.title,
    source_url: data.source_url || '',
    source_type: data.source_type || (data.source_url ? 'webpage' : 'manual'),
    publication_date: data.publication_date || null,
    author: data.author || '',
    raw_content: data.raw_content || '',
    tags: cleanTags(data.tags),
    competitor_id: data.competitor_id || null
  };
  const { data: saved, error } = await supabase.from('intelligence_items').insert(row).select().single();
  if (error) throw new Error(error.message);
  return saved;
}

async function dashboard() {
  const [competitors, intelligence, summaries, swots, generated, activity] = await Promise.all([
    listCompetitors(),
    listIntelligence(),
    optionalRows('ai_summaries'),
    optionalRows('swot_analyses'),
    optionalRows('generated_insights'),
    optionalRows('activity_log')
  ]);

  return {
    totals: {
      competitors: competitors.length,
      articles: intelligence.length,
      insights: summaries.length + swots.length + generated.length,
      activity: activity.length
    },
    recentCompetitors: competitors.slice(0, 5),
    recentIntelligence: intelligence.slice(0, 5),
    activity: activity.slice(0, 8)
  };
}

async function insights() {
  const [summaries, swots, generated] = await Promise.all([
    optionalRows('ai_summaries'),
    optionalRows('swot_analyses'),
    optionalRows('generated_insights')
  ]);
  return { summaries, swots, generated };
}

async function search(q) {
  const [competitors, intelligence] = await Promise.all([listCompetitors(), listIntelligence()]);
  const tokens = tokenize(q);
  return {
    query: q,
    competitors: rank(competitors, tokens, competitorText),
    intelligence: rank(intelligence, tokens, intelligenceText)
  };
}

async function positioning() {
  const [profileRows, competitors, intelligence, analyses] = await Promise.all([
    optionalRows('plcp_profile'),
    listCompetitors(),
    listIntelligence(),
    optionalRows('positioning_analyses')
  ]);
  const profile = profileRows[0] || defaultPlcpProfile();
  const latestAnalysis = analyses[0] || null;
  return {
    profile,
    competitors,
    intelligenceCount: intelligence.length,
    latestAnalysis,
    comparison: buildComparisonDashboard(profile, competitors, latestAnalysis?.analysis)
  };
}

async function updatePlcpProfile(data) {
  const current = (await optionalRows('plcp_profile'))[0];
  const row = {
    id: current?.id,
    core_services: cleanTags(data.core_services),
    differentiators: cleanTags(data.differentiators),
    pricing_position: data.pricing_position || '',
    operational_strengths: cleanTags(data.operational_strengths),
    weaknesses: cleanTags(data.weaknesses),
    target_customer_profile: data.target_customer_profile || '',
    strategic_goals: cleanTags(data.strategic_goals),
    updated_at: new Date().toISOString()
  };
  const { data: saved, error } = await supabase.from('plcp_profile').upsert(row).select().single();
  if (error) throw new Error(error.message);
  return saved;
}

function backendRequired(feature) {
  throw new Error(`${feature} requires the Express backend because it uses the OpenAI API. GitHub Pages is static, so deploy the backend separately and set VITE_API_BASE_URL to enable this feature online.`);
}

export const api = {
  dashboard: () => directSupabase ? dashboard() : request('/api/dashboard'),
  competitors: (params = '') => directSupabase ? listCompetitors(params) : request(`/api/competitors${params}`),
  competitor: (id) => directSupabase ? getCompetitor(id) : request(`/api/competitors/${id}`),
  createCompetitor: (data) => directSupabase ? createCompetitor(data) : request('/api/competitors', { method: 'POST', body: JSON.stringify(data) }),
  updateCompetitor: (id, data) => directSupabase ? updateCompetitor(id, data) : request(`/api/competitors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCompetitor: (id) => directSupabase ? deleteCompetitor(id) : request(`/api/competitors/${id}`, { method: 'DELETE' }),
  intelligence: (params = '') => directSupabase ? listIntelligence(params) : request(`/api/intelligence${params}`),
  intelligenceItem: (id) => directSupabase ? getIntelligence(id) : request(`/api/intelligence/${id}`),
  createIntelligence: (data) => directSupabase ? createIntelligence(data) : request('/api/intelligence', { method: 'POST', body: JSON.stringify(data) }),
  summarize: (id) => directSupabase ? backendRequired('AI Summary') : request(`/api/intelligence/${id}/summarize`, { method: 'POST' }),
  swot: (id) => directSupabase ? backendRequired('SWOT generation') : request(`/api/competitors/${id}/swot`, { method: 'POST' }),
  search: (q) => directSupabase ? search(q) : request(`/api/search?q=${encodeURIComponent(q)}`),
  insights: () => directSupabase ? insights() : request('/api/insights'),
  generateInsights: (query) => directSupabase ? backendRequired('Generate Insight') : request('/api/insights/generate', { method: 'POST', body: JSON.stringify({ query }) }),
  positioning: () => directSupabase ? positioning() : request('/api/positioning'),
  updatePlcpProfile: (data) => directSupabase ? updatePlcpProfile(data) : request('/api/positioning/profile', { method: 'PUT', body: JSON.stringify(data) }),
  analyzePositioning: () => directSupabase ? backendRequired('Positioning analysis') : request('/api/positioning/analyze', { method: 'POST' }),
  askHelp: (question) => directSupabase ? staticHelp(question) : request('/api/help/ask', { method: 'POST', body: JSON.stringify({ question }) })
};

function cleanTags(tags = []) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  return String(tags).split(/\n|,/).map((tag) => tag.trim()).filter(Boolean);
}

function isMissingTable(message = '') {
  return message.includes('Could not find the table') || message.includes('schema cache');
}

function tokenize(query) {
  return String(query || '').toLowerCase().split(/\W+/).filter((token) => token.length > 2);
}

function rank(items, tokens, toText) {
  if (!tokens.length) return [];
  return items
    .map((item) => {
      const text = toText(item).toLowerCase();
      return { ...item, score: tokens.reduce((total, token) => total + (text.includes(token) ? 1 : 0), 0) };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

function competitorText(item) {
  return [item.company_name, item.category, item.positioning, item.services_offered, item.target_customers, item.strengths, item.weaknesses, item.notes, ...(item.tags || [])].join(' ');
}

function intelligenceText(item) {
  return [item.title, item.source_url, item.source_type, item.author, item.raw_content, ...(item.tags || [])].join(' ');
}

function buildComparisonDashboard(plcpProfile, competitors, analysis = null) {
  const features = [...new Set([
    ...(plcpProfile.core_services || []),
    ...(plcpProfile.differentiators || []),
    ...competitors.flatMap((competitor) => String(competitor.services_offered || '').split(/[.;,]/).map((item) => item.trim()).filter(Boolean)),
    'Premium expert positioning',
    'Mediation-ready support',
    'Automated analytics'
  ])].slice(0, 12);

  return {
    featureMatrix: features.map((feature) => ({
      feature,
      plcp: scoreFeature(feature, plcpProfile, true),
      competitors: competitors.map((competitor) => ({
        id: competitor.id,
        company_name: competitor.company_name,
        status: scoreFeature(feature, competitor, false)
      }))
    })),
    strengthComparisons: competitors.map((competitor) => ({
      competitor_id: competitor.id,
      company_name: competitor.company_name,
      plcp: plcpProfile.operational_strengths || [],
      competitor: splitText(competitor.strengths)
    })),
    weaknessComparisons: competitors.map((competitor) => ({
      competitor_id: competitor.id,
      company_name: competitor.company_name,
      plcp: plcpProfile.weaknesses || [],
      competitor: splitText(competitor.weaknesses)
    })),
    recommendations: analysis?.strategic_recommendations || []
  };
}

function scoreFeature(feature, entity, isPlcp) {
  const text = JSON.stringify(entity).toLowerCase();
  const tokens = String(feature).toLowerCase().split(/\W+/).filter((token) => token.length > 3);
  const matches = tokens.filter((token) => text.includes(token)).length;
  if (isPlcp && matches > 0) return 'advantage';
  if (matches >= 2) return 'parity';
  if (String(feature).toLowerCase().includes('automated') && isPlcp) return 'opportunity';
  if (matches === 1) return 'parity';
  return isPlcp ? 'opportunity' : 'weakness';
}

function splitText(value = '') {
  return String(value).split(/[.;,]/).map((item) => item.trim()).filter(Boolean).slice(0, 5);
}

function defaultPlcpProfile() {
  return {
    core_services: [],
    differentiators: [],
    pricing_position: '',
    operational_strengths: [],
    weaknesses: [],
    target_customer_profile: '',
    strategic_goals: []
  };
}

function staticHelp(question) {
  return Promise.resolve({
    answer: `GitHub Pages is running the static version of the app. Repository data loads from Supabase, but AI actions need the Express backend. For your question "${question}", check the Help page workflow sections or run the local backend for AI assistance.`,
    next_steps: ['Use the sidebar Help page for workflow guidance', 'Use Dashboard, Competitors, Repository, Search, and Positioning for Supabase-backed data', 'Run or deploy the Express backend to enable OpenAI-powered actions'],
    related_pages: ['Help', 'Dashboard', 'Repository', 'Insights', 'Positioning']
  });
}
