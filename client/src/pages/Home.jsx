import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import DealsGrid from '../components/DealsGrid';
import HotDeals from '../components/HotDeals';
import { searchProducts } from '../api';
import { useProfile } from '../hooks/useProfile';
import { ShoppingBag, Zap, ArrowRight, TrendingUp } from 'lucide-react';

const FEATURED_CATEGORIES = [
  { label: "Men's Formals", icon: '👔', query: 'men formal shirt XL', bg: 'from-blue-500 to-indigo-600' },
  { label: "Jeans & Pants", icon: '👖', query: 'jeans size 36 men', bg: 'from-indigo-500 to-purple-600' },
  { label: "Smartphones", icon: '📱', query: 'best smartphone 5G', bg: 'from-purple-500 to-pink-600' },
  { label: "Laptops", icon: '💻', query: 'budget laptop student', bg: 'from-pink-500 to-rose-600' },
  { label: "Casual Wear", icon: '👕', query: 'men casual t-shirt', bg: 'from-orange-500 to-amber-500' },
  { label: "Headphones", icon: '🎧', query: 'wireless headphones', bg: 'from-teal-500 to-cyan-600' },
];

export default function Home() {
  const { profile, loading: profileLoading } = useProfile();
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (params) => {
    setSearching(true);
    setError(null);
    setCurrentQuery(params.q);
    try {
      const data = await searchProducts(params);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Hero — only when no results */}
      {!results && !searching && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <Zap size={14} /> AI-powered shopping across Amazon, Flipkart, Myntra & more
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
            Find the <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Best Deals</span>
            <br />tailored to your size & budget
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Set your size once. Search once. Get the best discounted products from all platforms — with direct buy links.
          </p>
        </div>
      )}

      {/* Search bar */}
      <SearchBar profile={profile} onSearch={handleSearch} loading={searching} />

      {/* Results */}
      {(results || searching || error) && (
        <DealsGrid
          products={results?.products}
          loading={searching}
          error={error}
          query={currentQuery}
          usingMock={results?.usingMock}
          aiEnabled={results?.aiEnabled}
        />
      )}

      {/* Hot Deals — shown on home when not in a search */}
      {!results && !searching && (
        <HotDeals />
      )}

      {/* Category cards — shown when not searching */}
      {!results && !searching && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-xl flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" /> Popular Categories
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURED_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleSearch({
                  q: cat.query,
                  category: 'all',
                  sort: 'ai',
                  gender: profile?.gender || '',
                  country: profile?.country || 'IN',
                  budgetMax: '',
                  budgetMin: '',
                })}
                className={`bg-gradient-to-br ${cat.bg} rounded-2xl p-4 text-white text-center hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer`}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="text-xs font-semibold leading-tight">{cat.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* How it works — shown when no results */}
      {!results && !searching && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <ShoppingBag size={20} /> How SmartShop AI Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Set your profile', desc: 'Enter your size (shirt XL, pants 36), gender and budget once.', icon: '👤' },
              { step: '2', title: 'Search anything', desc: 'Type what you need — we automatically apply your sizes & budget.', icon: '🔍' },
              { step: '3', title: 'Get ranked deals', desc: 'AI ranks results from Amazon, Flipkart, Myntra & more by value.', icon: '🤖' },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.icon} {item.title}</p>
                  <p className="text-white/75 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="mt-5 flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Set up my profile <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
