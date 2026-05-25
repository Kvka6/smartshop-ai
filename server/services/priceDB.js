const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/prices.db');

// Ensure data directory exists
const fs = require('fs');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS price_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  TEXT NOT NULL,
    title       TEXT,
    source      TEXT,
    price_raw   REAL NOT NULL,
    price_str   TEXT,
    recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_product_id ON price_history(product_id);
  CREATE INDEX IF NOT EXISTS idx_recorded_at ON price_history(recorded_at);
`);

/**
 * Save a batch of products' current prices (called after every search).
 * Only saves if the price changed or it's been > 6 hours since last record.
 */
function recordPrices(products) {
  const insert = db.prepare(`
    INSERT INTO price_history (product_id, title, source, price_raw, price_str, recorded_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  const lastPrice = db.prepare(`
    SELECT price_raw, recorded_at FROM price_history
    WHERE product_id = ?
    ORDER BY recorded_at DESC LIMIT 1
  `);

  const insertMany = db.transaction((items) => {
    for (const p of items) {
      if (!p.id || !p.priceRaw) continue;
      const last = lastPrice.get(p.id);
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      // Record if: no previous entry, price changed, or 6+ hours since last record
      if (!last || last.price_raw !== p.priceRaw || last.recorded_at < sixHoursAgo) {
        insert.run(p.id, p.title, p.source, p.priceRaw, p.price);
      }
    }
  });

  try {
    insertMany(products);
  } catch (err) {
    console.error('[PriceDB] Failed to record prices:', err.message);
  }
}

/**
 * Get real tracked price history for a product from our DB.
 */
function getTrackedHistory(productId) {
  const rows = db.prepare(`
    SELECT price_raw, price_str, recorded_at
    FROM price_history
    WHERE product_id = ?
    ORDER BY recorded_at ASC
  `).all(productId);
  return rows;
}

/**
 * Get products with biggest price drops (current vs highest recorded).
 */
function getBestPriceDrops(limit = 10) {
  return db.prepare(`
    SELECT
      ph.product_id,
      ph.title,
      ph.source,
      ph.price_raw   AS current_price,
      ph.price_str   AS current_price_str,
      max_p.max_price,
      ROUND((max_p.max_price - ph.price_raw) / max_p.max_price * 100) AS drop_pct,
      ph.recorded_at AS last_seen
    FROM price_history ph
    INNER JOIN (
      SELECT product_id, MAX(price_raw) AS max_price
      FROM price_history
      GROUP BY product_id
      HAVING COUNT(*) > 1
    ) max_p ON ph.product_id = max_p.product_id
    WHERE ph.recorded_at = (
      SELECT MAX(recorded_at) FROM price_history WHERE product_id = ph.product_id
    )
    AND ph.price_raw < max_p.max_price
    ORDER BY drop_pct DESC
    LIMIT ?
  `).all(limit);
}

module.exports = { recordPrices, getTrackedHistory, getBestPriceDrops, db };
