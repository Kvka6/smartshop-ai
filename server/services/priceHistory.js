const { getTrackedHistory } = require('./priceDB');

/**
 * Returns a 90-day price history for a product.
 * Uses real tracked data from our DB, and fills gaps with
 * estimated data (clearly flagged) so the chart always shows 3 months.
 */
function getPriceHistory(productId, currentPrice) {
  const tracked = getTrackedHistory(productId);

  // Build a map of date → price from real tracked data
  const realMap = {};
  for (const row of tracked) {
    const date = row.recorded_at.split(' ')[0]; // "YYYY-MM-DD"
    realMap[date] = { price: row.price_raw, real: true };
  }

  const today = new Date();
  const result = [];

  // Walk back 90 days
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    if (realMap[dateStr]) {
      result.push({ date: dateStr, price: realMap[dateStr].price, real: true });
    } else {
      // Fill with estimated price
      result.push({ date: dateStr, price: null, real: false });
    }
  }

  // Forward-fill and back-fill null gaps with estimated prices
  const basePrice = currentPrice;
  fillEstimated(result, basePrice);

  return result;
}

/**
 * Fills null price points with realistic estimated prices.
 * Simulates typical Indian e-commerce price patterns:
 * - Prices are slightly higher before big sales (Flipkart Big Billion, Amazon Great Indian)
 * - Gradual drops toward current price
 * - Small random fluctuations daily
 */
function fillEstimated(points, currentPrice) {
  const n = points.length;

  // Find highest real price as reference
  const realPrices = points.filter((p) => p.real).map((p) => p.price);
  const highRef = realPrices.length > 0 ? Math.max(...realPrices) : currentPrice * 1.25;

  // Generate smooth estimated curve
  for (let i = 0; i < n; i++) {
    if (!points[i].real) {
      // Progress 0 (90 days ago) → 1 (today)
      const progress = i / (n - 1);
      // Price curve: high at start, drops toward current, with small noise
      const trend = highRef - (highRef - currentPrice) * easeInOutQuad(progress);
      const noise = (seededRandom(i * 7 + 13) - 0.5) * currentPrice * 0.04;
      // Mark significant sale events (simulate Big Billion Day ~day 30, End of Season ~day 60)
      const saleBoost = isSaleDay(i) ? -currentPrice * 0.06 : 0;
      points[i].price = Math.round(Math.max(currentPrice * 0.85, trend + noise + saleBoost));
      points[i].estimated = true;
    }
  }

  // Always make last point = current real price
  points[n - 1].price = currentPrice;
  points[n - 1].real = true;
  points[n - 1].estimated = false;
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Deterministic pseudo-random (so chart doesn't flicker on re-render)
function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function isSaleDay(dayIndex) {
  // Simulate sale events at roughly day 25 and day 55 in the 90-day window
  return dayIndex === 25 || dayIndex === 26 || dayIndex === 55 || dayIndex === 56;
}

/**
 * Compute summary stats for the price history.
 */
function getPriceSummary(history, currentPrice) {
  const prices = history.map((h) => h.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const dropFromPeak = Math.round(((maxPrice - currentPrice) / maxPrice) * 100);
  const isAtLowest = currentPrice <= minPrice * 1.02;
  const isNearHighest = currentPrice >= maxPrice * 0.95;

  // 7-day trend
  const last7 = history.slice(-7).map((h) => h.price);
  const trendDiff = last7[last7.length - 1] - last7[0];
  const trend = trendDiff < -currentPrice * 0.02 ? 'dropping' : trendDiff > currentPrice * 0.02 ? 'rising' : 'stable';

  return { maxPrice, minPrice, avgPrice, dropFromPeak, isAtLowest, isNearHighest, trend };
}

module.exports = { getPriceHistory, getPriceSummary };
