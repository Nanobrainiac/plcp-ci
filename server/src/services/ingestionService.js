export async function mockScrapeUrl(url) {
  const host = url ? new URL(url).hostname.replace('www.', '') : 'manual source';
  return {
    title: `Market intelligence from ${host}`,
    author: '',
    publication_date: null,
    raw_content: `Mock scraped content from ${url}. Replace mockScrapeUrl with a real scraper, readability parser, or hosted extraction service when production ingestion is ready.`
  };
}

