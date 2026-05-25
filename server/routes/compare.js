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

    // Group by platform
    const platformMap = {};
    for (const p of products) {
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
