require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const searchRouter = require('./routes/search');
const profileRouter = require('./routes/profile');
const priceHistoryRouter = require('./routes/priceHistory');
const dealsRouter = require('./routes/deals');
const compareRouter = require('./routes/compare');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Rate limiting — 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api/search', searchRouter);
app.use('/api/profile', profileRouter);
app.use('/api/price-history', priceHistoryRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/compare', compareRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serpapi: !!(process.env.SERPAPI_KEY && process.env.SERPAPI_KEY !== 'your_serpapi_key_here'),
    openai: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here'),
    country: process.env.COUNTRY || 'IN',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🛍️  SmartShop AI server running on http://localhost:${PORT}`);
  console.log(`   SerpAPI:  ${process.env.SERPAPI_KEY && process.env.SERPAPI_KEY !== 'your_serpapi_key_here' ? '✅ Configured' : '⚠️  Not set — using demo data'}`);
  console.log(`   OpenAI:   ${process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here' ? '✅ Configured' : '⚠️  Not set — using heuristic ranking'}\n`);
});
