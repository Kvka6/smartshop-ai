const axios = require('axios');

/**
 * Uses OpenAI to rank products and explain the top picks.
 * Returns products with an added `aiScore` and `aiReason` field.
 * If no API key is set, returns products with a computed heuristic score.
 */
async function rankWithAI(products, { query, budget, preferences }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_key_here' || products.length === 0) {
    return heuristicRank(products);
  }

  // Send top 20 products to AI (keep token usage low)
  const subset = products.slice(0, 20).map((p, i) => ({
    index: i,
    title: p.title,
    price: p.price,
    discount: p.discount ? `${p.discount}%` : 'none',
    source: p.source,
    rating: p.rating,
    reviews: p.reviews,
  }));

  const systemPrompt = `You are a smart shopping assistant. A user is searching for "${query}" with a budget of ${budget || 'any'}. 
Your job is to score each product 1-100 (higher = better deal) based on:
- Value for money (price vs quality indicators)
- Discount percentage (higher is better)  
- Brand reputation
- Ratings and reviews
- Relevance to the query

Return ONLY valid JSON: an array of objects with "index" (number) and "score" (1-100) and "reason" (one short sentence max 12 words).`;

  const userPrompt = JSON.stringify(subset);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);
    const rankings = Array.isArray(parsed) ? parsed : parsed.rankings || parsed.products || [];

    const scoreMap = {};
    rankings.forEach((r) => {
      scoreMap[r.index] = { score: r.score, reason: r.reason };
    });

    const ranked = products.map((p, i) => ({
      ...p,
      aiScore: scoreMap[i]?.score ?? heuristicScore(p),
      aiReason: scoreMap[i]?.reason ?? null,
    }));

    return ranked.sort((a, b) => b.aiScore - a.aiScore);
  } catch (err) {
    console.error('[AI Ranker] OpenAI call failed:', err.message);
    return heuristicRank(products);
  }
}

/** Score products without AI using price/discount/rating heuristics */
function heuristicRank(products) {
  return products
    .map((p) => ({ ...p, aiScore: heuristicScore(p), aiReason: null }))
    .sort((a, b) => b.aiScore - a.aiScore);
}

function heuristicScore(p) {
  let score = 50;
  if (p.discount) score += Math.min(p.discount * 0.6, 30); // up to +30 for discount
  if (p.rating) score += (p.rating - 3) * 5; // +5 per star above 3
  if (p.reviews && p.reviews > 100) score += 5;
  if (p.reviews && p.reviews > 1000) score += 5;
  return Math.min(Math.max(Math.round(score), 1), 100);
}

module.exports = { rankWithAI };
