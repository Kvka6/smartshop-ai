const express = require('express');
const router = express.Router();
const { searchSerpAPI } = require('../services/serpapi');
const { rankWithAI } = require('../services/aiRanker');
const { getMockProducts } = require('../services/mockData');
const { recordPrices } = require('../services/priceDB');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // 5-minute cache

router.get('/', async (req, res) => {
  const {
    q,
    category,
    budgetMin,
    budgetMax,
    gender,
    size,
    brand,
    sort = 'ai', // 'ai' | 'price_asc' | 'price_desc' | 'discount'
    country,
  } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query is required (min 2 characters).' });
  }

  // Build a context-aware query
  let enrichedQuery = q.trim();
  if (gender && category === 'clothing') enrichedQuery += ` ${gender}`;
  if (size && category === 'clothing') enrichedQuery += ` size ${size}`;
  if (brand) enrichedQuery += ` ${brand}`;

  const cacheKey = `${enrichedQuery}|${budgetMin}|${budgetMax}|${country || 'IN'}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    let products = await searchSerpAPI({
      query: enrichedQuery,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      country: country || process.env.COUNTRY || 'IN',
    });

    const usingMock = !products;
    if (!products || products.length === 0) {
      products = getMockProducts(q, budgetMax ? Number(budgetMax) : null);
    }

    // Client-side budget filter for mock/real data
    if (budgetMax) {
      products = products.filter((p) => !p.priceRaw || p.priceRaw <= Number(budgetMax));
    }
    if (budgetMin) {
      products = products.filter((p) => !p.priceRaw || p.priceRaw >= Number(budgetMin));
    }

    // AI ranking
    const ranked = await rankWithAI(products, {
      query: enrichedQuery,
      budget: budgetMax ? `₹${budgetMax}` : null,
      preferences: { gender, size, brand },
    });

    // Optional sort override
    let sorted = ranked;
    if (sort === 'price_asc') sorted = [...ranked].sort((a, b) => (a.priceRaw || 0) - (b.priceRaw || 0));
    else if (sort === 'price_desc') sorted = [...ranked].sort((a, b) => (b.priceRaw || 0) - (a.priceRaw || 0));
    else if (sort === 'discount') sorted = [...ranked].sort((a, b) => (b.discount || 0) - (a.discount || 0));

    // Record prices for history tracking (async, don't block response)
    if (!usingMock) setImmediate(() => recordPrices(sorted));

    const result = {
      query: enrichedQuery,
      total: sorted.length,
      usingMock,
      aiEnabled: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here'),
      products: sorted,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('[Search] Error:', err.message);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
});

module.exports = router;
