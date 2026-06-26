import express from 'express';
import Parser from 'rss-parser';

const router = express.Router();

const FEEDS = [
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Automobiles.xml', domain: 'nytimes.com', name: 'NYT Automobiles' },
  { url: 'https://www.autocar.co.uk/rss', domain: 'autocar.co.uk', name: 'Autocar' },
  { url: 'https://www.hemmings.com/stories/feed/', domain: 'hemmings.com', name: 'Hemmings' },
  { url: 'https://www.whichcar.com.au/rss', domain: 'whichcar.com.au', name: 'WhichCar' },
];

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000;

function extractImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item['media:content']?.$?.url) return item['media:content'].$.url;
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url;
  if (item.content) {
    const m = item.content.match(/<img[^>]+src=["']([^"']+)["']/);
    if (m) return m[1];
  }
  return '';
}

async function fetchFeed(feedDef) {
  const parser = new Parser({ timeout: 15000 });
  const feed = await parser.parseURL(feedDef.url);
  return (feed.items || []).map((item) => ({
    id: item.guid || item.link || item.title,
    url: item.link || '',
    published_at: item.isoDate || item.pubDate || '',
    title: item.title || '',
    description: item.contentSnippet || item.summary || '',
    content: item.content || '',
    image_url: extractImage(item),
    source: { name: feedDef.name, domain: feedDef.domain },
  }));
}

router.get('/api/news', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 12;
  const now = Date.now();

  if (cache.data && now - cache.timestamp < CACHE_TTL && page === 1) {
    return res.json(cache.data);
  }

  try {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed));
    const allItems = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

    if (allItems.length === 0) {
      return res.status(502).json({ status: 'error', results: [], page, has_next_pages: false });
    }

    allItems.sort((a, b) => {
      const da = a.published_at ? new Date(a.published_at).getTime() : 0;
      const db = b.published_at ? new Date(b.published_at).getTime() : 0;
      return db - da;
    });

    const start = (page - 1) * perPage;
    const items = allItems.slice(start, start + perPage);

    const response = {
      status: 'ok',
      page,
      has_next_pages: start + perPage < allItems.length,
      results: items,
    };

    if (page === 1) {
      cache = { data: response, timestamp: now };
    }

    return res.json(response);
  } catch (err) {
    console.error('News aggregation failed:', err);
    return res.status(500).json({ status: 'error', results: [], page, has_next_pages: false });
  }
});

export default router;
