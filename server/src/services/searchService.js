export async function keywordSearch(query, data) {
  const tokens = tokenize(query);
  if (!tokens.length) return { competitors: [], intelligence: [] };

  return {
    competitors: rank(data.competitors, tokens, competitorText),
    intelligence: rank(data.intelligence, tokens, intelligenceText)
  };
}

export async function semanticSearchPlaceholder(query, data) {
  // Future extension point: create embeddings for query and stored documents, then rank by vector similarity.
  return keywordSearch(query, data);
}

export async function createEmbeddingPlaceholder(text) {
  // Future extension point for OpenAI embeddings. Return stable metadata for now.
  return { dimensions: 0, sourceLength: text?.length || 0, vector: [] };
}

function tokenize(query) {
  return String(query || '').toLowerCase().split(/\W+/).filter((token) => token.length > 2);
}

function rank(items, tokens, toText) {
  return items
    .map((item) => {
      const text = toText(item).toLowerCase();
      const score = tokens.reduce((total, token) => total + (text.includes(token) ? 1 : 0), 0);
      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

function competitorText(item) {
  return [
    item.company_name,
    item.category,
    item.positioning,
    item.services_offered,
    item.target_customers,
    item.strengths,
    item.weaknesses,
    item.notes,
    ...(item.tags || [])
  ].join(' ');
}

function intelligenceText(item) {
  return [
    item.title,
    item.source_url,
    item.source_type,
    item.author,
    item.raw_content,
    ...(item.tags || [])
  ].join(' ');
}

