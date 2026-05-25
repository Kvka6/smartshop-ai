import { useState } from 'react';
import { ExternalLink, Star, Truck, TrendingDown, GitCompareArrows, Zap } from 'lucide-react';
import PriceChart from './PriceChart';
import CompareModal from './CompareModal';

const PLATFORM_COLORS = {
  Amazon: 'bg-orange-100 text-orange-700',
  Flipkart: 'bg-blue-100 text-blue-700',
  Myntra: 'bg-pink-100 text-pink-700',
  Meesho: 'bg-purple-100 text-purple-700',
  Nykaa: 'bg-rose-100 text-rose-700',
  Ajio: 'bg-red-100 text-red-700',
};

function getPlatformClass(source) {
  for (const [key, cls] of Object.entries(PLATFORM_COLORS)) {
    if (source && source.toLowerCase().includes(key.toLowerCase())) return cls;
  }
  return 'bg-gray-100 text-gray-700';
}

export default function ProductCard({ product, rank }) {
  const [showChart, setShowChart] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const isTopPick = rank !== undefined && rank < 3;
  const discountBig = product.discount && product.discount >= 40;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative bg-gray-50 h-52 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain p-3"
            onError={(e) => {
              e.target.src = `https://placehold.co/300x200/f3f4f6/9ca3af?text=No+Image`;
            }}
          />
        ) : (
          <div className="text-gray-300 text-5xl">📦</div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isTopPick && (
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
              <Zap size={10} /> AI Pick
            </span>
          )}
          {product.discount && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shadow ${discountBig ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Platform badge */}
        {product.source && (
          <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${getPlatformClass(product.source)}`}>
            {product.source}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{product.title}</p>

        {/* AI Reason */}
        {product.aiReason && (
          <p className="text-xs text-indigo-600 flex items-start gap-1">
            <Zap size={11} className="mt-0.5 shrink-0" />
            {product.aiReason}
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="font-semibold text-gray-700">{product.rating}</span>
            {product.reviews && <span>({product.reviews.toLocaleString()} reviews)</span>}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-gray-900">{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
          )}
          {product.originalPrice && product.priceRaw && product.originalPriceRaw && (
            <span className="text-xs text-green-600 font-semibold">
              Save ₹{(product.originalPriceRaw - product.priceRaw).toLocaleString()}
            </span>
          )}
        </div>

        {/* Delivery */}
        {product.delivery && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Truck size={11} />
            {product.delivery}
          </p>
        )}

        {/* CTA buttons */}
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={() => setShowChart(true)}
            className="flex items-center gap-1 px-2.5 py-2.5 border border-indigo-200 text-indigo-600 text-xs font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
            title="Price history chart"
          >
            <TrendingDown size={13} />
          </button>
          <button
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-1 px-2.5 py-2.5 border border-green-200 text-green-600 text-xs font-semibold rounded-xl hover:bg-green-50 transition-colors"
            title="Compare prices across platforms"
          >
            <GitCompareArrows size={13} />
          </button>
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            View Deal <ExternalLink size={13} />
          </a>
        </div>
      </div>
      {showChart && <PriceChart product={product} onClose={() => setShowChart(false)} />}
      {showCompare && <CompareModal product={product} onClose={() => setShowCompare(false)} />}
    </div>
  );
}
