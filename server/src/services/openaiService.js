import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function generateJson(system, user, fallback) {
  if (!client) return fallback();

  const response = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.2
  });

  return JSON.parse(response.choices[0].message.content);
}

// AI prompts are isolated here so model choice, JSON shape, and future prompt tests do not leak into route code.
export async function generateExecutiveSummary(content) {
  return generateJson(
    'You are a competitive intelligence analyst for Physician Life Care Planning. Return concise JSON only.',
    `Analyze this intelligence content and return executive_summary, key_takeaways, risks, opportunities, relevance_to_plcp as arrays or strings where appropriate.\n\n${content}`,
    () => ({
      executive_summary: content.slice(0, 220) || 'No content was provided for summarization.',
      key_takeaways: ['Monitor the competitor message', 'Compare the offer against PLCP strengths', 'Flag buyer pain points for follow-up'],
      risks: ['Competitor messaging may pressure PLCP positioning or turnaround expectations'],
      opportunities: ['Use this intelligence to refine PLCP differentiation and sales enablement'],
      relevance_to_plcp: 'Relevant to PLCP because it may affect how buyers compare expertise, responsiveness, and defensibility.'
    })
  );
}

export async function generateCompetitorDifferentiation(competitor, intelligenceItems) {
  return generateJson(
    'You write practical competitor differentiation notes for PLCP leadership. Return JSON only.',
    JSON.stringify({ competitor, intelligenceItems }),
    () => ({
      differentiation: `${competitor.company_name} appears to compete on ${competitor.positioning || 'service focus'}. PLCP can differentiate with expert depth, planning rigor, and medical nuance.`,
      proof_points: ['Profile positioning', 'Related intelligence themes', 'Observed service packaging']
    })
  );
}

export async function generateSWOT(competitor, intelligenceItems) {
  return generateJson(
    'You create concise SWOT analyses for competitive intelligence. Return JSON with strengths, weaknesses, opportunities, threats arrays.',
    JSON.stringify({ competitor, intelligenceItems }),
    () => ({
      strengths: splitText(competitor.strengths, ['Clear market position', 'Recognizable service focus']),
      weaknesses: splitText(competitor.weaknesses, ['Potentially narrow differentiation', 'Limited evidence of full-service breadth']),
      opportunities: ['PLCP can sharpen messaging around defensible expert work', 'Related intelligence can guide sales conversations'],
      threats: ['Competitor may win buyers prioritizing speed, automation, or bundled services']
    })
  );
}

export async function generateInsights(queryOrDataset) {
  const result = await generateJson(
    'You synthesize competitive intelligence for PLCP executives. Return strict JSON only. Keys must be insights and recommended_actions. Both values must be arrays of concise strings.',
    typeof queryOrDataset === 'string' ? queryOrDataset : JSON.stringify(queryOrDataset),
    () => ({
      insights: ['Speed, analytics, and bundled rehabilitation services are recurring competitive themes.'],
      recommended_actions: ['Create PLCP talk tracks for mediation readiness, expert rigor, and complex injury nuance.']
    })
  );

  return {
    insights: normalizeStringArray(result.insights),
    recommended_actions: normalizeStringArray(result.recommended_actions)
  };
}

export async function generatePositioningAnalysis(plcpProfile, competitors, intelligenceItems) {
  return generateJson(
    'You are a senior competitive strategy analyst for Physician Life Care Planning. Return JSON only with the requested keys and concise arrays.',
    `Analyze PLCP against these competitors and market intelligence. Return competitive_differentiation_analysis, plcp_strengths_vs_market, plcp_weaknesses_and_risks, opportunities_competitors_are_missing, strategic_positioning_summaries, market_gap_analysis, strategic_recommendations, and feature_matrix_notes.\n\n${JSON.stringify({ plcpProfile, competitors, intelligenceItems })}`,
    () => ({
      competitive_differentiation_analysis: 'PLCP should position around physician-led defensibility, complex injury expertise, and litigation-ready clarity rather than competing mainly on speed or automation.',
      plcp_strengths_vs_market: ['Physician-led credibility', 'Complex injury planning depth', 'Expert work product suitable for litigation'],
      plcp_weaknesses_and_risks: ['Premium pricing requires clear proof of value', 'Automation-led competitors may frame PLCP as slower or more expensive'],
      opportunities_competitors_are_missing: ['Mediation-ready expert packages', 'Clear explainers tying medical nuance to damages strategy', 'Broader education for attorneys comparing automated and expert-led reviews'],
      strategic_positioning_summaries: ['Lead with defensible physician expertise for high-stakes claims', 'Use speed as a workflow promise, not the core brand promise'],
      market_gap_analysis: ['Buyers need a middle ground between fast automated triage and deeply defensible expert analysis'],
      strategic_recommendations: ['Build competitor-specific talk tracks', 'Create proof points for premium value', 'Package expedited rebuttal and mediation support'],
      feature_matrix_notes: ['Use advantage where PLCP has service depth or explicit differentiators, parity where competitors offer similar services, and opportunity where buyer needs are visible but competitor positioning is thin.']
    })
  );
}

export async function answerHelpQuestion(question) {
  const trimmedQuestion = String(question || '').trim();
  if (!trimmedQuestion) {
    return {
      answer: 'Enter a question about how to use the app, such as how to add intelligence, generate a SWOT, or interpret the Positioning dashboard.',
      next_steps: ['Type a specific workflow question in the help box.'],
      related_pages: ['Help']
    };
  }

  const result = await generateJson(
    'You are the in-app help assistant for the PLCP Competitive Intelligence Repository. Answer only questions about using this app. Do not analyze legal, medical, client, patient, or case facts. Return strict JSON with answer, next_steps, and related_pages. next_steps and related_pages must be arrays of strings.',
    JSON.stringify({
      question: trimmedQuestion,
      appKnowledgeBase: helpKnowledgeBase()
    }),
    () => fallbackHelpAnswer(trimmedQuestion)
  );

  return {
    answer: typeof result.answer === 'string' ? result.answer : fallbackHelpAnswer(trimmedQuestion).answer,
    next_steps: normalizeStringArray(result.next_steps),
    related_pages: normalizeStringArray(result.related_pages)
  };
}

function splitText(value, fallback) {
  if (!value) return fallback;
  return value.split(/[.;]/).map((part) => part.trim()).filter(Boolean).slice(0, 4);
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).filter(Boolean);
  }
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(normalizeStringArray);
  return [];
}

function fallbackHelpAnswer(question) {
  return {
    answer: `This app helps PLCP users manage competitor profiles, source-backed intelligence, AI summaries, SWOT analyses, repository search, and PLCP positioning. Your question was: "${question}".`,
    next_steps: ['Check the relevant page in the sidebar', 'Use source URLs and tags when adding data', 'Generate AI output only after the underlying record has enough context'],
    related_pages: ['Dashboard', 'Competitors', 'Repository', 'Insights', 'Positioning']
  };
}

function helpKnowledgeBase() {
  return {
    pages: {
      Dashboard: 'Overview cards, recent competitors, recent intelligence, and activity.',
      Competitors: 'Create and manage durable competitor profiles. Generate SWOT from competitor detail pages.',
      Repository: 'Store source-backed intelligence items, public webpages, articles, and manual notes. Generate AI Summary from intelligence items.',
      Search: 'Keyword search across competitors and intelligence. Better tags improve search results.',
      Insights: 'Shows saved AI summaries, SWOT analyses, and executive syntheses. Generate Insight creates a high-level synthesis, not article summaries.',
      Positioning: 'Admin-managed PLCP profile, PLCP-vs-competitor feature matrix, market gaps, and strategic recommendations.',
      Help: 'User guide and help assistant.'
    },
    aiFeatures: {
      aiSummary: 'Generated from an intelligence item. Includes executive summary, key takeaways, risks, opportunities, and relevance to PLCP.',
      swot: 'Generated from a competitor profile plus related intelligence.',
      insight: 'Generated from the repository to synthesize risks and opportunities.',
      positioning: 'Generated from the PLCP profile, competitors, and intelligence items.'
    },
    safety: [
      'Do not enter confidential client data, protected health information, or privileged legal strategy.',
      'AI output is a draft and should be reviewed before sharing.',
      'Public marketing claims should not be treated as independently verified facts.'
    ],
    dataStandards: [
      'Use source URLs when possible.',
      'Separate public facts from internal assumptions.',
      'Use consistent tags such as life-care-planning, expert-witness, physician-led, economic-damages, vocational, ime, and litigation-support.',
      'Update existing records instead of creating duplicates.'
    ]
  };
}
