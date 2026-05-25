const express = require('express');
const router = express.Router();
const { searchSerpAPI } = require('../services/serpapi');
const { rankWithAI } = require('../services/aiRanker');
const { getMockProducts } = require('../services/mockData');
const { recordPrices, getBestPriceDrops } = require('../services/priceDB');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // cache hot deals for 1 hour

// Categories to scan for hot deals
const DEAL_QUERIES = [
  'men formal shirt sale offer',
  'men jeans best price',
  'smartphone under 20000 best deal',
  'laptop best offer',
  'wireless earbuds discount',
  'men casual wear sale',
];

// GET /api/deals — returns best current offers across all categories
router.get('/', async (req, res) => {
  const cacheKey = `hotdeals_${process.env.COUNTRY || 'IN'}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    // First: return DB-tracked price drops (real data)
    const trackedDrops = getBestPriceDrops(6);

    // Then: fetch fresh deals from SerpAPI for one random category (save API quota)
    const randomQuery = DEAL_QUERIES[Math.floor(Math.random() * DEAL_QUERIES.length)];
    let liveDeals = await searchSerpAPI({
      query: randomQuery,
      country: process.env.COUNTRY || 'IN',
    });

    if (!liveDeals || liveDeals.length === 0) {
      liveDeals = [
        ...getMockProducts('shirt', null),
        ...getMockProducts('pant', null),
        ...getMockProducts('mobile', null),
      ];
    }

    // Record prices for tracking
    recordPrices(liveDeals);

    // Keep only items with real discounts (30%+)
    const hotDeals = liveDeals
      .filter((p) => p.discount && p.discount >= 30)
      .sort((a, b) => (b.discount || 0) - (a.discount || 0))
      .slice(0, 8);

    const result = {
      hotDeals,
      trackedDrops,       // products we've tracked going down in price
      lastUpdated: new Date().toISOString(),
      usingMock: !process.env.SERPAPI_KEY || process.env.SERPAPI_KEY === 'your_serpapi_key_here',
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('[Deals] Error:', err.message);
    res.status(500).json({ error: 'Could not fetch deals.' });
  }
});

module.exports = router;
