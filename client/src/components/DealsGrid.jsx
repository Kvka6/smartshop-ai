import { useState } from 'react';
import ProductCard from './ProductCard';
import { Zap, AlertCircle, Loader2, ArrowDownUp } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'ai', label: 'AI Ranked' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Discount: Highest' },
  { value: 'rating', label: 'Rating: Best' },
];

function sortProducts(products, sortBy) {
  if (!products) return products;
  const sorted = [...products];
  switch (sortBy) {
    case 'price_asc': return sorted.sort((a, b) => (a.priceRaw || 0) - (b.priceRaw || 0));
    case 'price_desc': return sorted.sort((a, b) => (b.priceRaw || 0) - (a.priceRaw || 0));
    case 'discount': return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    case 'rating': return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    default: return sorted;
  }
}

export default function DealsGrid({ products, loading, error, query, usingMock, aiEnabled }) {
  const [sortBy, setSortBy] = useState('ai');
  const sortedProducts = sortProducts(products, sortBy);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
          <Loader2 size={28} className="text-indigo-600 animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-700">Scanning all platforms…</p>
          <p className="text-sm text-gray-400 mt-1">Finding the best deals for you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-gray-400">Make sure the backend server is running on port 5000.</p>
      </div>
    );
  }

  if (!products) return null;

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-gray-600 font-medium">No products found for "{query}"</p>
        <p className="text-sm text-gray-400 mt-1">Try a different search or adjust your budget filters.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">
            {sortedProducts.length} deals found
            {query && <span className="text-gray-400 font-normal text-base"> for "{query}"</span>}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            {aiEnabled && (
              <span className="text-xs text-indigo-600 flex items-center gap-1">
                <Zap size={11} /> AI-ranked by value
              </span>
            )}
            {!aiEnabled && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                Ranked by discount &amp; rating
              </span>
            )}
            {usingMock && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Demo data — add SerpAPI key for live results
              </span>
            )}
          </div>
        </div>
        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <ArrowDownUp size={14} className="text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 font-medium focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 highlight */}
      {sortedProducts.length >= 3 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-3 mb-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-800">AI Top Pick: {sortedProducts[0].title.slice(0, 60)}…</p>
            <p className="text-xs text-indigo-500 mt-0.5">
              {sortedProducts[0].aiReason || `Best value at ${sortedProducts[0].price}${sortedProducts[0].discount ? ` · ${sortedProducts[0].discount}% off` : ''}`}
            </p>
          </div>
          <a
            href={sortedProducts[0].link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto shrink-0 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Buy Now →
          </a>
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedProducts.map((product, index) => (
          <ProductCard key={product.id || index} product={product} rank={index} />
        ))}
      </div>
    </div>
  );
}
