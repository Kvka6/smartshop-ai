const axios = require('axios');

const SERPAPI_BASE = 'https://serpapi.com/search';

/**
 * Search Google Shopping via SerpAPI.
 * Returns normalized product objects.
 */
async function searchSerpAPI({ query, budgetMin, budgetMax, country = 'IN' }) {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey || apiKey === 'your_serpapi_key_here') {
    return null; // caller will fall back to mock data
  }

  const params = {
    engine: 'google_shopping',
    q: query,
    api_key: apiKey,
    gl: country.toLowerCase(),
    hl: 'en',
    num: 40,
  };

  if (budgetMin) params.price_min = budgetMin;
  if (budgetMax) params.price_max = budgetMax;

  const response = await axios.get(SERPAPI_BASE, { params, timeout: 15000 });
  const results = response.data.shopping_results || [];

  return results.map((item) => ({
    id: item.product_id || String(Math.random()),
    title: item.title,
    price: item.price,
    priceRaw: parsePrice(item.price),
    originalPrice: item.old_price || null,
    originalPriceRaw: item.old_price ? parsePrice(item.old_price) : null,
    discount: computeDiscount(item.price, item.old_price),
    image: item.thumbnail,
    link: item.link,
    source: item.source,
    rating: item.rating || null,
    reviews: item.reviews || null,
    delivery: item.delivery || null,
  }));
}

function parsePrice(priceStr) {
  if (!priceStr) return null;
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
}

function computeDiscount(currentStr, originalStr) {
  const current = parsePrice(currentStr);
  const original = parsePrice(originalStr);
  if (!current || !original || original <= current) return null;
  const pct = Math.round(((original - current) / original) * 100);
  // Sanity check: Google Shopping sometimes returns bogus 100% values
  if (pct >= 95 || pct <= 0) return null;
  return pct;
}

module.exports = { searchSerpAPI };
