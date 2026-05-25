import { useState, useEffect } from 'react';
import { TrendingDown, ExternalLink, Flame, RefreshCw, ArrowDownRight, GitCompareArrows } from 'lucide-react';
import axios from 'axios';
import PriceChart from './PriceChart';
import CompareModal from './CompareModal';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function HotDeals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartProduct, setChartProduct] = useState(null);
  const [compareProduct, setCompareProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('hot'); // 'hot' | 'tracked'

  const fetchDeals = () => {
    setLoading(true);
    axios.get(`${API_BASE}/deals`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDeals(); }, []);

  const hotDeals = data?.hotDeals || [];
  const trackedDrops = data?.trackedDrops || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-xl flex items-center gap-2">
            <Flame size={20} className="text-orange-500" /> Today's Best Offers
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {data?.lastUpdated
              ? `Updated ${new Date(data.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
              : 'Loading…'}
          </p>
        </div>
        <button
          onClick={fetchDeals}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('hot')}
          className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${activeTab === 'hot' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
        >
          🔥 Hot Deals
        </button>
        <button
          onClick={() => setActiveTab('tracked')}
          className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${activeTab === 'tracked' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
        >
          📉 Price Drops {trackedDrops.length > 0 && <span className="ml-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">{trackedDrops.length}</span>}
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Hot Deals Tab */}
      {!loading && activeTab === 'hot' && (
        <>
          {hotDeals.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">🛍️</p>
              <p className="text-sm">No deals found yet. Try a search to populate deals!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {hotDeals.map((product, i) => (
                <HotDealCard key={product.id || i} product={product} onShowChart={setChartProduct} onCompare={setCompareProduct} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Price Drops Tab */}
      {!loading && activeTab === 'tracked' && (
        <>
          {trackedDrops.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
              <TrendingDown size={28} className="text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-amber-800">No tracked price drops yet</p>
              <p className="text-xs text-amber-600 mt-1">
                Search for products and come back in a few hours — the app tracks prices automatically and shows you when they drop.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {trackedDrops.map((item, i) => (
                <div key={i} className="bg-white border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <ArrowDownRight size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">Was ₹{Math.round(item.max_price).toLocaleString()}</span>
                      <span className="text-xs font-bold text-green-600">Now ₹{Math.round(item.current_price).toLocaleString()}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">↓ {item.drop_pct}%</span>
                      <span className="text-xs text-gray-400">{item.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {chartProduct && <PriceChart product={chartProduct} onClose={() => setChartProduct(null)} />}
      {compareProduct && <CompareModal product={compareProduct} onClose={() => setCompareProduct(null)} />}
    </div>
  );
}

function HotDealCard({ product, onShowChart, onCompare }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group flex flex-col">
      {/* Image */}
      <div className="relative bg-gray-50 h-36 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain p-2"
            onError={(e) => { e.target.src = 'https://placehold.co/200x150/f3f4f6/9ca3af?text=No+Image'; }}
          />
        ) : (
          <span className="text-4xl">📦</span>
        )}
        {product.discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{product.discount}%
          </span>
        )}
        <span className="absolute top-2 right-2 text-xs bg-white/90 text-gray-700 font-medium px-1.5 py-0.5 rounded-full border border-gray-200">
          {product.source}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{product.title}</p>
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-sm font-bold text-gray-900">{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
          )}
        </div>
        {product.originalPrice && product.priceRaw && product.originalPriceRaw && (
          <p className="text-xs text-green-600 font-semibold">
            Save ₹{(product.originalPriceRaw - product.priceRaw).toLocaleString()}
          </p>
        )}
        <div className="flex gap-1.5 mt-1">
          <button
            onClick={() => onShowChart(product)}
            className="text-xs py-1.5 px-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            title="Price chart"
          >
            📉
          </button>
          <button
            onClick={() => onCompare(product)}
            className="text-xs py-1.5 px-2 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
            title="Compare platforms"
          >
            ⚖️
          </button>
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Buy <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
