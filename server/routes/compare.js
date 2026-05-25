const express = require('express');
const router = express.Router();
const { searchSerpAPI } = require('../services/serpapi');
const { getMockProducts } = require('../services/mockData');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache for comparisons

// GET /api/compare?q=product+name
// Searches for same/similar product across platforms and groups by platform
router.get('/', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 3) {
    return res.status(400).json({ error: 'Product query required (min 3 characters).' });
  }

  const cacheKey = `compare_${q.trim().toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    let products = await searchSerpAPI({
      query: q.trim(),
      country: process.env.COUNTRY || 'IN',
    });

    const usingMock = !products;
    if (!products || products.length === 0) {
      products = getMockProducts(q, null);
    }

    // Extract brand and key identifiers from the search query
    const queryWords = q.trim().toLowerCase().split(/\s+/);
    const queryBrand = extractBrand(q);

    // Filter to only products that match the same brand/model
    const exactMatches = products.filter((p) => isSameProduct(p, q, queryBrand));
    const closeMatches = products.filter((p) => isCloseMatch(p, q, queryBrand) && !isSameProduct(p, q, queryBrand));

    // Use exact matches if available, otherwise close matches
    const matchedProducts = exactMatches.length >= 2 ? exactMatches : [...exactMatches, ...closeMatches];

    // Group by platform
    const platformMap = {};
    for (const p of matchedProducts) {
      const platform = normalizePlatform(p.source);
      if (!platformMap[platform]) {
        platformMap[platform] = [];
      }
      platformMap[platform].push(p);
    }

    // For each platform, pick the most relevant (cheapest) match
    const platforms = Object.entries(platformMap).map(([platform, items]) => {
      // Sort by price within platform
      const sorted = items.sort((a, b) => (a.priceRaw || Infinity) - (b.priceRaw || Infinity));
      const best = sorted[0];
      return {
        platform,
        bestMatch: best,
        alternatives: sorted.slice(1, 3), // up to 2 more options on same platform
        price: best.priceRaw,
        priceStr: best.price,
        originalPrice: best.originalPriceRaw,
        originalPriceStr: best.originalPrice,
        discount: best.discount,
        rating: best.rating,
        reviews: best.reviews,
        delivery: best.delivery || 'Standard delivery',
        link: best.link,
        image: best.image,
      };
    });

    // Sort platforms by price (cheapest first)
    platforms.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));

    // Compute comparison insights
    const prices = platforms.filter((p) => p.price).map((p) => p.price);
    const cheapest = prices.length > 0 ? Math.min(...prices) : null;
    const costliest = prices.length > 0 ? Math.max(...prices) : null;
    const savings = cheapest && costliest ? costliest - cheapest : 0;

    // Tag best for each category
    const bestPrice = platforms[0]?.platform || null;
    const bestRating = [...platforms].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.platform || null;
    const bestReviews = [...platforms].sort((a, b) => (b.reviews || 0) - (a.reviews || 0))[0]?.platform || null;

    // Delivery analysis
    for (const p of platforms) {
      p.deliveryDays = estimateDeliveryDays(p.delivery);
    }
    const fastestDelivery = [...platforms].sort((a, b) => (a.deliveryDays || 99) - (b.deliveryDays || 99))[0]?.platform || null;

    const result = {
      query: q.trim(),
      totalPlatforms: platforms.length,
      totalProducts: products.length,
      usingMock,
      platforms,
      insights: {
        cheapestPlatform: bestPrice,
        bestRatedPlatform: bestRating,
        mostReviewsPlatform: bestReviews,
        fastestDeliveryPlatform: fastestDelivery,
        maxSavings: savings,
        maxSavingsStr: savings > 0 ? `₹${savings.toLocaleString()}` : null,
        priceDiffPercent: cheapest && costliest && costliest > cheapest
          ? Math.round(((costliest - cheapest) / costliest) * 100)
          : 0,
      },
      recommendation: generateRecommendation(platforms, bestPrice, bestRating, fastestDelivery, savings),
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('[Compare] Error:', err.message);
    res.status(500).json({ error: 'Comparison failed. Please try again.' });
  }
});

function normalizePlatform(source) {
  if (!source) return 'Other';
  const s = source.toLowerCase();
  if (s.includes('amazon')) return 'Amazon';
  if (s.includes('flipkart')) return 'Flipkart';
  if (s.includes('myntra')) return 'Myntra';
  if (s.includes('ajio')) return 'Ajio';
  if (s.includes('meesho')) return 'Meesho';
  if (s.includes('nykaa')) return 'Nykaa';
  if (s.includes('snapdeal')) return 'Snapdeal';
  if (s.includes('jiomart')) return 'JioMart';
  if (s.includes('tata') || s.includes('croma')) return 'Tata/Croma';
  if (s.includes('reliance')) return 'Reliance Digital';
  if (s.includes('raymond') || s.includes('myraymond')) return 'Raymond';
  if (s.includes('marks') || s.includes('m&s')) return 'Marks & Spencer';
  return source;
}

// Known brands list for extraction
const KNOWN_BRANDS = [
  'nike', 'adidas', 'puma', 'reebok', 'levis', "levi's", 'h&m', 'zara', 'samsung',
  'apple', 'oneplus', 'realme', 'xiaomi', 'redmi', 'poco', 'oppo', 'vivo', 'sony',
  'boat', 'jbl', 'bose', 'sennheiser', 'beats', 'pepe', 'wrangler', 'allen solly',
  'peter england', 'van heusen', 'raymond', 'louis philippe', 'arrow', 'us polo',
  'tommy hilfiger', 'calvin klein', 'gap', 'uniqlo', 'mango', 'forever 21',
  'roadster', 'highlander', 'urbano', 'snitch', 'mufti', 'woodland', 'bata',
  'sparx', 'campus', 'skechers', 'new balance', 'asics', 'hp', 'dell', 'lenovo',
  'asus', 'acer', 'msi', 'lg', 'whirlpool', 'bosch', 'panasonic', 'philips',
  'titan', 'fastrack', 'casio', 'fossil', 'noise', 'fire-boltt', 'amazfit',
  'marks & spencer', 'off duty', 'the pant project', 'the souled store',
];

function extractBrand(query) {
  const q = query.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (q.includes(brand)) return brand;
  }
  // Try first word as potential brand
  return q.split(/\s+/)[0];
}

function isSameProduct(product, query, queryBrand) {
  const title = (product.title || '').toLowerCase();
  const q = query.toLowerCase();

  // Check if brand matches
  const hasBrand = queryBrand && title.includes(queryBrand);
  if (!hasBrand) return false;

  // Check if model/key identifiers match (numbers, specific model names)
  const queryModels = q.match(/\b([a-z]*\d+[a-z\d]*)\b/gi) || []; // alphanumeric model numbers
  if (queryModels.length > 0) {
    return queryModels.some((model) => title.toLowerCase().includes(model.toLowerCase()));
  }

  // For clothing: check if key descriptors match (slim fit, regular, etc.)
  const keyTerms = q.split(/\s+/).filter((w) => w.length > 3 && w !== queryBrand);
  const matchCount = keyTerms.filter((term) => title.includes(term)).length;
  return matchCount >= Math.ceil(keyTerms.length * 0.6);
}

function isCloseMatch(product, query, queryBrand) {
  const title = (product.title || '').toLowerCase();
  const q = query.toLowerCase();

  // Must have same brand
  if (queryBrand && !title.includes(queryBrand)) return false;

  // At least some key words match
  const keyTerms = q.split(/\s+/).filter((w) => w.length > 3);
  const matchCount = keyTerms.filter((term) => title.includes(term)).length;
  return matchCount >= Math.ceil(keyTerms.length * 0.4);
}

function estimateDeliveryDays(deliveryStr) {
  if (!deliveryStr) return 5;
  const d = deliveryStr.toLowerCase();
  if (d.includes('tomorrow') || d.includes('1 day') || d.includes('next day')) return 1;
  if (d.includes('2 day') || d.includes('2-day')) return 2;
  if (d.includes('3 day') || d.includes('2-3')) return 3;
  if (d.includes('free') || d.includes('prime')) return 2;
  if (d.includes('5') || d.includes('4-5') || d.includes('week')) return 5;
  if (d.includes('7') || d.includes('5-7')) return 7;
  return 4; // default estimate
}

function generateRecommendation(platforms, bestPrice, bestRating, fastestDelivery, savings) {
  if (platforms.length <= 1) {
    return 'Only found on one platform. No comparison available.';
  }

  const parts = [];
  if (bestPrice && savings > 100) {
    parts.push(`💰 Best price on **${bestPrice}** — save ₹${savings.toLocaleString()} vs other platforms`);
  }
  if (bestRating && bestRating !== bestPrice) {
    parts.push(`⭐ Highest rated on **${bestRating}**`);
  }
  if (fastestDelivery) {
    parts.push(`🚚 Fastest delivery from **${fastestDelivery}**`);
  }

  if (parts.length === 0) {
    return `Available on ${platforms.length} platforms. Prices are similar — pick based on delivery preference.`;
  }
  return parts.join(' · ');
}

module.exports = router;
