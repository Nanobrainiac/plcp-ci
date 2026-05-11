import { v4 as uuid } from 'uuid';
import { createSupabaseClient } from '../db/supabase.js';
import {
  competitors as seededCompetitors,
  intelligenceItems as seededIntelligence,
  aiSummaries as seededSummaries,
  swotAnalyses as seededSwots,
  activityLog as seededActivity,
  plcpProfile as seededPlcpProfile,
  positioningAnalyses as seededPositioningAnalyses,
  generatedInsights as seededGeneratedInsights
} from '../db/seedData.js';

const supabase = createSupabaseClient();
const memory = {
  competitors: [...seededCompetitors],
  intelligence_items: [...seededIntelligence],
  ai_summaries: [...seededSummaries],
  swot_analyses: [...seededSwots],
  plcp_profile: [seededPlcpProfile],
  positioning_analyses: [...seededPositioningAnalyses],
  generated_insights: [...seededGeneratedInsights],
  activity_log: [...seededActivity]
};

const now = () => new Date().toISOString();
const cleanTags = (tags = []) => Array.isArray(tags) ? tags.map((tag) => String(tag).trim()).filter(Boolean) : [];

async function supabaseSelect(table, query = '*') {
  const { data, error } = await supabase.from(table).select(query).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export const storageMode = supabase ? 'supabase' : 'memory';

export async function listCompetitors(filters = {}) {
  if (supabase) {
    let query = supabase.from('competitors').select('*').order('created_at', { ascending: false });
    if (filters.category) query = query.eq('category', filters.category);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return filterByTag(data, filters.tag);
  }
  return filterByTag([...memory.competitors], filters.tag).filter((item) => !filters.category || item.category === filters.category);
}

export async function createCompetitor(payload) {
  const competitor = {
    id: uuid(),
    company_name: payload.company_name,
    website: payload.website || '',
    category: payload.category || 'Uncategorized',
    positioning: payload.positioning || '',
    services_offered: payload.services_offered || '',
    target_customers: payload.target_customers || '',
    strengths: payload.strengths || '',
    weaknesses: payload.weaknesses || '',
    notes: payload.notes || '',
    tags: cleanTags(payload.tags),
    created_at: now(),
    updated_at: now()
  };
  if (supabase) {
    const { data, error } = await supabase.from('competitors').insert(competitor).select().single();
    if (error) throw new Error(error.message);
    await logActivity('competitor_created', `Added ${data.company_name}`);
    return data;
  }
  memory.competitors.unshift(competitor);
  await logActivity('competitor_created', `Added ${competitor.company_name}`);
  return competitor;
}

export async function getCompetitor(id) {
  const competitor = supabase
    ? await fetchSingle('competitors', id)
    : memory.competitors.find((item) => item.id === id);
  if (!competitor) return null;
  const intelligence = await listIntelligence({ competitor_id: id });
  const summaries = await listSummariesForCompetitor(id);
  const swot = await getLatestSwot(id);
  return { ...competitor, intelligence, summaries, swot };
}

export async function updateCompetitor(id, payload) {
  const updates = { ...payload, tags: cleanTags(payload.tags), updated_at: now() };
  if (supabase) {
    const { data, error } = await supabase.from('competitors').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  const index = memory.competitors.findIndex((item) => item.id === id);
  if (index === -1) return null;
  memory.competitors[index] = { ...memory.competitors[index], ...updates };
  return memory.competitors[index];
}

export async function deleteCompetitor(id) {
  if (supabase) {
    const { error } = await supabase.from('competitors').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
  memory.competitors = memory.competitors.filter((item) => item.id !== id);
  return true;
}

export async function listIntelligence(filters = {}) {
  if (supabase) {
    let query = supabase.from('intelligence_items').select('*, competitors(company_name)').order('created_at', { ascending: false });
    if (filters.competitor_id) query = query.eq('competitor_id', filters.competitor_id);
    if (filters.source_type) query = query.eq('source_type', filters.source_type);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return filterByTag(data, filters.tag);
  }
  return filterByTag([...memory.intelligence_items], filters.tag)
    .filter((item) => !filters.competitor_id || item.competitor_id === filters.competitor_id)
    .filter((item) => !filters.source_type || item.source_type === filters.source_type)
    .map((item) => ({ ...item, competitors: memory.competitors.find((comp) => comp.id === item.competitor_id) || null }));
}

export async function createIntelligence(payload) {
  const item = {
    id: uuid(),
    title: payload.title,
    source_url: payload.source_url || '',
    source_type: payload.source_type || (payload.source_url ? 'webpage' : 'manual'),
    publication_date: payload.publication_date || null,
    author: payload.author || '',
    raw_content: payload.raw_content || '',
    tags: cleanTags(payload.tags),
    competitor_id: payload.competitor_id || null,
    created_at: now()
  };
  if (supabase) {
    const { data, error } = await supabase.from('intelligence_items').insert(item).select().single();
    if (error) throw new Error(error.message);
    await logActivity('intelligence_created', `Ingested ${data.title}`);
    return data;
  }
  memory.intelligence_items.unshift(item);
  await logActivity('intelligence_created', `Ingested ${item.title}`);
  return item;
}

export async function getIntelligence(id) {
  const item = supabase ? await fetchSingle('intelligence_items', id) : memory.intelligence_items.find((entry) => entry.id === id);
  if (!item) return null;
  const summary = await getSummaryForItem(id);
  return { ...item, summary };
}

export async function saveSummary(intelligenceItemId, summary) {
  const row = { id: uuid(), intelligence_item_id: intelligenceItemId, ...summary, created_at: now() };
  if (supabase) {
    const { data, error } = await supabase.from('ai_summaries').insert(row).select().single();
    if (error) throw new Error(error.message);
    await logActivity('summary_generated', `Generated AI summary for ${intelligenceItemId}`);
    return data;
  }
  memory.ai_summaries.unshift(row);
  await logActivity('summary_generated', `Generated AI summary for ${intelligenceItemId}`);
  return row;
}

export async function saveSwot(competitorId, swot) {
  const row = { id: uuid(), competitor_id: competitorId, ...swot, created_at: now() };
  if (supabase) {
    const { data, error } = await supabase.from('swot_analyses').insert(row).select().single();
    if (error) throw new Error(error.message);
    await logActivity('swot_generated', `Generated SWOT for ${competitorId}`);
    return data;
  }
  memory.swot_analyses.unshift(row);
  await logActivity('swot_generated', `Generated SWOT for ${competitorId}`);
  return row;
}

export async function getDashboardStats() {
  const competitors = await listCompetitors();
  const intelligence = await listIntelligence();
  const summaries = supabase ? await supabaseSelect('ai_summaries') : memory.ai_summaries;
  const swots = supabase ? await supabaseSelect('swot_analyses') : memory.swot_analyses;
  const activity = supabase ? await supabaseSelect('activity_log') : [...memory.activity_log].sort(byCreatedDesc);
  return {
    totals: {
      competitors: competitors.length,
      articles: intelligence.length,
      insights: summaries.length + swots.length,
      activity: activity.length
    },
    recentCompetitors: competitors.slice(0, 5),
    recentIntelligence: intelligence.slice(0, 5),
    activity: activity.slice(0, 8)
  };
}

export async function listInsights() {
  const summaries = supabase ? await supabaseSelect('ai_summaries') : [...memory.ai_summaries].sort(byCreatedDesc);
  const swots = supabase ? await supabaseSelect('swot_analyses') : [...memory.swot_analyses].sort(byCreatedDesc);
  const generated = supabase ? await optionalSupabaseSelect('generated_insights') : [...memory.generated_insights].sort(byCreatedDesc);
  return { summaries, swots, generated };
}

export async function saveGeneratedInsight(payload) {
  const row = { id: uuid(), ...payload, created_at: now() };
  if (supabase) {
    const { data, error } = await supabase.from('generated_insights').insert(row).select().single();
    if (error) {
      if (isMissingTableError(error)) {
        console.warn('generated_insights table is missing; returning generated insight without persistence.');
        return row;
      }
      throw new Error(error.message);
    }
    await logActivity('insight_generated', 'Generated executive insight synthesis');
    return data;
  }
  memory.generated_insights.unshift(row);
  await logActivity('insight_generated', 'Generated executive insight synthesis');
  return row;
}

export async function getPlcpProfile() {
  if (supabase) {
    const { data, error } = await supabase.from('plcp_profile').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw new Error(error.message);
    return data || seededPlcpProfile;
  }
  return memory.plcp_profile[0];
}

export async function updatePlcpProfile(payload) {
  const existing = await getPlcpProfile();
  const profile = {
    id: existing?.id || uuid(),
    core_services: cleanTags(payload.core_services),
    differentiators: cleanTags(payload.differentiators),
    pricing_position: payload.pricing_position || '',
    operational_strengths: cleanTags(payload.operational_strengths),
    weaknesses: cleanTags(payload.weaknesses),
    target_customer_profile: payload.target_customer_profile || '',
    strategic_goals: cleanTags(payload.strategic_goals),
    created_at: existing?.created_at || now(),
    updated_at: now()
  };

  if (supabase) {
    const { data, error } = await supabase.from('plcp_profile').upsert(profile).select().single();
    if (error) throw new Error(error.message);
    await logActivity('plcp_profile_updated', 'Updated PLCP positioning profile');
    return data;
  }

  memory.plcp_profile = [profile];
  await logActivity('plcp_profile_updated', 'Updated PLCP positioning profile');
  return profile;
}

export async function savePositioningAnalysis(analysis) {
  const row = { id: uuid(), analysis, created_at: now() };
  if (supabase) {
    const { data, error } = await supabase.from('positioning_analyses').insert(row).select().single();
    if (error) throw new Error(error.message);
    await logActivity('positioning_analysis_generated', 'Generated PLCP positioning analysis');
    return data;
  }
  memory.positioning_analyses.unshift(row);
  await logActivity('positioning_analysis_generated', 'Generated PLCP positioning analysis');
  return row;
}

export async function getLatestPositioningAnalysis() {
  if (supabase) {
    const { data, error } = await supabase.from('positioning_analyses').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }
  return memory.positioning_analyses[0] || null;
}

export async function getAllSearchableData() {
  return {
    competitors: await listCompetitors(),
    intelligence: await listIntelligence()
  };
}

async function fetchSingle(table, id) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
}

async function optionalSupabaseSelect(table, query = '*') {
  try {
    return await supabaseSelect(table, query);
  } catch (error) {
    if (isMissingTableMessage(error.message)) {
      console.warn(`${table} table is missing; returning an empty list.`);
      return [];
    }
    throw error;
  }
}

async function getSummaryForItem(id) {
  if (supabase) {
    const { data, error } = await supabase.from('ai_summaries').select('*').eq('intelligence_item_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }
  return memory.ai_summaries.find((summary) => summary.intelligence_item_id === id) || null;
}

async function listSummariesForCompetitor(competitorId) {
  const items = await listIntelligence({ competitor_id: competitorId });
  const itemIds = new Set(items.map((item) => item.id));
  const summaries = supabase ? await supabaseSelect('ai_summaries') : memory.ai_summaries;
  return summaries.filter((summary) => itemIds.has(summary.intelligence_item_id));
}

async function getLatestSwot(competitorId) {
  if (supabase) {
    const { data, error } = await supabase.from('swot_analyses').select('*').eq('competitor_id', competitorId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }
  return memory.swot_analyses.find((swot) => swot.competitor_id === competitorId) || null;
}

async function logActivity(activity_type, description) {
  const row = { id: uuid(), activity_type, description, created_at: now() };
  if (supabase) {
    const { error } = await supabase.from('activity_log').insert(row);
    if (error) console.warn(`Activity log skipped: ${error.message}`);
    return;
  }
  memory.activity_log.unshift(row);
}

function filterByTag(items, tag) {
  if (!tag) return items;
  return items.filter((item) => item.tags?.includes(tag));
}

function byCreatedDesc(a, b) {
  return new Date(b.created_at) - new Date(a.created_at);
}

function isMissingTableError(error) {
  return isMissingTableMessage(error?.message);
}

function isMissingTableMessage(message = '') {
  return message.includes('Could not find the table') || message.includes('schema cache');
}
