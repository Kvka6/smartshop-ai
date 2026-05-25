import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = [
  { value: 'clothing', label: '👕 Clothing' },
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'shoes', label: '👟 Shoes' },
  { value: 'all', label: '🛍️ All' },
];

const QUICK_SEARCHES = [
  'Men formal shirt XL',
  'Jeans size 36',
  'Wireless earbuds',
  'Budget laptop',
  'Running shoes',
  'Women kurti M',
];

export default function SearchBar({ profile, onSearch, loading }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [sort, setSort] = useState('ai');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    triggerSearch(query.trim());
  };

  const triggerSearch = (q) => {
    const params = {
      q,
      category,
      sort,
      budgetMin: budgetMin || (category === 'clothing' ? profile?.budgetClothingMin : profile?.budgetElectronicsMin) || '',
      budgetMax: budgetMax || (category === 'clothing' ? profile?.budgetClothingMax : profile?.budgetElectronicsMax) || '',
      gender: profile?.gender || '',
      size: category === 'clothing' ? (q.toLowerCase().includes('pant') || q.toLowerCase().includes('jean') ? profile?.pantSize : profile?.shirtSize) || '' : '',
      country: profile?.country || 'IN',
    };
    onSearch(params);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      {/* Category tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              category === c.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shirts, jeans, phones, laptops…"
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 rounded-xl border transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
        >
          <SlidersHorizontal size={17} />
        </button>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Min Budget (₹)</label>
            <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Max Budget (₹)</label>
            <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Any" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Sort By</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400">
              <option value="ai">🤖 AI Best Deal</option>
              <option value="discount">🏷️ Highest Discount</option>
              <option value="price_asc">💰 Price: Low → High</option>
              <option value="price_desc">💰 Price: High → Low</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setBudgetMin(''); setBudgetMax(''); setSort('ai'); }} className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Quick search chips */}
      <div className="mt-3 flex gap-2 flex-wrap">
        <span className="text-xs text-gray-400">Quick:</span>
        {QUICK_SEARCHES.map((qs) => (
          <button
            key={qs}
            onClick={() => { setQuery(qs); triggerSearch(qs); }}
            className="text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 px-2.5 py-1 rounded-full transition-colors"
          >
            {qs}
          </button>
        ))}
      </div>

      {/* Profile summary pill */}
      {profile && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-indigo-50 rounded-lg px-3 py-2">
          <span>🎯 Using your profile:</span>
          <span className="font-medium text-indigo-700 capitalize">{profile.gender}</span>
          <span>·</span>
          <span className="font-medium text-indigo-700">Shirt {profile.shirtSize}</span>
          <span>·</span>
          <span className="font-medium text-indigo-700">Pants {profile.pantSize}</span>
          <span>·</span>
          <span className="font-medium text-indigo-700">Budget ₹{profile.budgetClothingMax?.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
