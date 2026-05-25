const express = require('express');
const router = express.Router();
const { getPriceHistory, getPriceSummary } = require('../services/priceHistory');
const { getTrackedHistory } = require('../services/priceDB');

// GET /api/price-history/:productId?currentPrice=1049&title=...
router.get('/:productId', (req, res) => {
  const { productId } = req.params;
  const currentPrice = parseFloat(req.query.currentPrice);

  if (!productId || isNaN(currentPrice)) {
    return res.status(400).json({ error: 'productId and currentPrice are required.' });
  }

  const history = getPriceHistory(productId, currentPrice);
  const summary = getPriceSummary(history, currentPrice);
  const realDataPoints = history.filter((h) => h.real).length;

  res.json({
    productId,
    currentPrice,
    history,        // 90 data points, one per day
    summary,
    realDataPoints, // how many are real tracked vs estimated
    message: realDataPoints <= 1
      ? 'Estimated history — real data builds as you search over time'
      : `${realDataPoints} real price points tracked`,
  });
});

module.exports = router;
