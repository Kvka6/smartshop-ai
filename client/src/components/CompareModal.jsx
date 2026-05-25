import { useState, useEffect } from 'react';
import { X, ExternalLink, Star, Truck, TrendingDown, Award, Clock, Shield, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const PLATFORM_STYLES = {
  Amazon: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: '🛒' },
  Flipkart: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: '📦' },
  Myntra: { bg: 'bg-pink-50', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700', icon: '👗' },
  Ajio: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: '🏷️' },
  Meesho: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', icon: '🛍️' },
  Raymond: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', icon: '👔' },
};

function getStyle(platform) {
  return PLATFORM_STYLES[platform] || { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', icon: '🏪' };
}

export default function CompareModal({ product, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Extract a clean search query from the product title (remove size/color noise)
    const cleanQuery = product.title
      .replace(/\(.*?\)/g, '')        // remove parentheses content
      .replace(/size\s*\w+/gi, '')    // remove "size XL"
      .replace(/\s*-\s*\w+$/gi, '')   // remove trailing "- Blue"
      .trim()
      .split(' ')
      .slice(0, 6)
      .join(' ');

    axios.get(`${API_BASE}/compare`, { params: { q: cleanQuery } })
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.error || 'Failed to compare'))
      .finally(() => setLoading(false));
  }, [product.id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-indigo-600 font-semibold mb-1 flex items-center gap-1">
                <TrendingDown size={12} /> Platform Price Comparison
              </p>
              <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{product.title}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X size={20} />
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
            <p className="text-sm text-gray-500">Comparing prices across platforms…</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 px-5">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {data && (
          <div className="px-5 py-4 space-y-4">
            {/* Insights summary */}
            {data.insights && data.platforms.length > 1 && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={16} className="text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-800">Smart Recommendation</span>
                </div>
                <p className="text-sm text-indigo-700 leading-relaxed">{data.recommendation}</p>
                {data.insights.maxSavings > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      Save up to {data.insights.maxSavingsStr}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({data.insights.priceDiffPercent}% price difference between platforms)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quick badges */}
            {data.platforms.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {data.insights.cheapestPlatform && (
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    💰 Cheapest: {data.insights.cheapestPlatform}
                  </span>
                )}
                {data.insights.bestRatedPlatform && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    ⭐ Best Rated: {data.insights.bestRatedPlatform}
                  </span>
                )}
                {data.insights.fastestDeliveryPlatform && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    🚚 Fastest: {data.insights.fastestDeliveryPlatform}
                  </span>
                )}
                {data.insights.mostReviewsPlatform && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    💬 Most Reviews: {data.insights.mostReviewsPlatform}
                  </span>
                )}
              </div>
            )}

            {/* Platform comparison cards */}
            <div className="space-y-3">
              {data.platforms.map((p, i) => {
                const style = getStyle(p.platform);
                const isCheapest = i === 0 && data.platforms.length > 1;
                return (
                  <div
                    key={p.platform}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      isCheapest ? 'border-green-300 bg-green-50/50 shadow-sm' : `${style.border} ${style.bg}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Platform image */}
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.bestMatch?.title}
                          className="w-16 h-16 object-contain rounded-lg bg-white border border-gray-200 shrink-0"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {/* Platform name + badges */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                            {style.icon} {p.platform}
                          </span>
                          {isCheapest && (
                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                              <CheckCircle size={10} /> Best Price
                            </span>
                          )}
                          {p.platform === data.insights.bestRatedPlatform && (
                            <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full font-bold">
                              ⭐ Top Rated
                            </span>
                          )}
                          {p.platform === data.insights.fastestDeliveryPlatform && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
                              🚀 Fastest
                            </span>
                          )}
                        </div>

                        {/* Product title */}
                        <p className="text-sm text-gray-800 font-medium line-clamp-1">{p.bestMatch?.title}</p>

                        {/* Price row */}
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className={`text-lg font-bold ${isCheapest ? 'text-green-700' : 'text-gray-900'}`}>
                            {p.priceStr}
                          </span>
                          {p.originalPriceStr && (
                            <span className="text-xs text-gray-400 line-through">{p.originalPriceStr}</span>
                          )}
                          {p.discount && (
                            <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">
                              -{p.discount}%
                            </span>
                          )}
                          {isCheapest && data.insights.maxSavings > 0 && (
                            <span className="text-xs text-green-600 font-semibold">
                              (cheapest by ₹{data.insights.maxSavings.toLocaleString()})
                            </span>
                          )}
                        </div>

                        {/* Rating + Reviews + Delivery */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {p.rating && (
                            <span className="flex items-center gap-1 text-xs text-gray-600">
                              <Star size={11} className="text-yellow-400 fill-yellow-400" />
                              <span className="font-semibold">{p.rating}</span>
                              {p.reviews && <span className="text-gray-400">({p.reviews.toLocaleString()})</span>}
                            </span>
                          )}
                          {p.delivery && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Truck size={11} />
                              {p.delivery}
                            </span>
                          )}
                          {p.deliveryDays && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={11} />
                              ~{p.deliveryDays} day{p.deliveryDays > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Buy button */}
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`shrink-0 flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          isCheapest
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        Buy <ExternalLink size={12} />
                      </a>
                    </div>

                    {/* Alternatives on same platform */}
                    {p.alternatives && p.alternatives.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200/50">
                        <p className="text-xs text-gray-400 mb-1.5">Also on {p.platform}:</p>
                        <div className="flex gap-2 overflow-x-auto">
                          {p.alternatives.map((alt, j) => (
                            <a
                              key={j}
                              href={alt.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-indigo-300 transition-colors flex items-center gap-1.5"
                            >
                              <span className="font-medium text-gray-700 max-w-[140px] truncate">{alt.title}</span>
                              <span className="text-indigo-600 font-bold">{alt.price}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer note */}
            {data.usingMock && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 text-center">
                Demo data — add SerpAPI key for live cross-platform comparison
              </p>
            )}

            {data.platforms.length <= 1 && (
              <p className="text-xs text-gray-400 text-center py-2">
                Only found on one platform. Try a broader search term for more comparison options.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
