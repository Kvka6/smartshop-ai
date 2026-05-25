import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, Info, X } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatPrice(val) {
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{formatDate(label)}</p>
      <p className="font-bold text-gray-900 text-sm">{formatPrice(point.value)}</p>
      {point.payload?.estimated && (
        <p className="text-amber-500 mt-0.5">Estimated</p>
      )}
    </div>
  );
};

export default function PriceChart({ product, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/price-history/${encodeURIComponent(product.id)}`, {
        params: { currentPrice: product.priceRaw, title: product.title },
      })
      .then((r) => setData(r.data))
      .catch(() => setError('Could not load price history'))
      .finally(() => setLoading(false));
  }, [product.id]);

  const summary = data?.summary;

  const trendIcon = summary?.trend === 'dropping'
    ? <TrendingDown size={14} className="text-green-500" />
    : summary?.trend === 'rising'
    ? <TrendingUp size={14} className="text-red-500" />
    : <Minus size={14} className="text-gray-400" />;

  const trendLabel = summary?.trend === 'dropping'
    ? 'Price is dropping — good time to buy!'
    : summary?.trend === 'rising'
    ? 'Price is rising — buy soon'
    : 'Price is stable';

  // Color the area based on current vs average
  const areaColor = summary && product.priceRaw <= summary.avgPrice ? '#22c55e' : '#f59e0b';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{product.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{product.source}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5">
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500 text-sm">{error}</div>
        )}

        {data && (
          <>
            {/* Stats row */}
            <div className="px-5 pb-3 grid grid-cols-4 gap-2">
              <StatBox label="Current" value={formatPrice(product.priceRaw)} highlight={summary?.isAtLowest ? 'green' : null} />
              <StatBox label="3M Low" value={formatPrice(summary?.minPrice)} highlight="green" />
              <StatBox label="3M High" value={formatPrice(summary?.maxPrice)} />
              <StatBox label="3M Avg" value={formatPrice(summary?.avgPrice)} />
            </div>

            {/* Trend badge */}
            <div className="px-5 pb-3 flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                summary?.trend === 'dropping' ? 'bg-green-100 text-green-700'
                : summary?.trend === 'rising' ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
              }`}>
                {trendIcon} {trendLabel}
              </span>
              {summary?.isAtLowest && (
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-semibold">
                  🎯 Lowest price in 3 months!
                </span>
              )}
              {summary?.dropFromPeak > 0 && (
                <span className="text-xs text-gray-500">↓ {summary.dropFromPeak}% from peak</span>
              )}
            </div>

            {/* Chart */}
            <div className="px-2 pb-2">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data.history} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={areaColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={areaColor} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => {
                      const dt = new Date(d);
                      return dt.getDate() === 1 ? dt.toLocaleDateString('en-IN', { month: 'short' }) : '';
                    }}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {/* Average price reference line */}
                  <ReferenceLine
                    y={summary?.avgPrice}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{ value: 'Avg', position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }}
                  />
                  {/* Current price reference line */}
                  <ReferenceLine
                    y={product.priceRaw}
                    stroke={areaColor}
                    strokeWidth={1.5}
                    label={{ value: 'Now', position: 'insideTopLeft', fontSize: 10, fill: areaColor }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={areaColor}
                    strokeWidth={2}
                    fill="url(#priceGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: areaColor }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Data notice */}
            <div className="px-5 pb-4 flex items-start gap-1.5 text-xs text-gray-400">
              <Info size={11} className="mt-0.5 shrink-0" />
              <span>
                {data.realDataPoints <= 1
                  ? 'Chart shows estimated 3-month trend. Real tracking starts now — check back after a few searches.'
                  : `${data.realDataPoints} real price points tracked. Gaps filled with estimates.`}
              </span>
            </div>

            {/* Buy button */}
            <div className="px-5 pb-5">
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-colors ${
                  summary?.isAtLowest ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {summary?.isAtLowest ? '🎯 Buy Now — Best Price!' : 'View Deal on ' + product.source}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight }) {
  return (
    <div className={`rounded-xl p-2.5 text-center ${highlight === 'green' ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${highlight === 'green' ? 'text-green-700' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}
