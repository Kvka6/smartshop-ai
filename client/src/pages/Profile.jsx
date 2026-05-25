import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { User, Save, CheckCircle, ArrowRight, Info } from 'lucide-react';

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const PANT_SIZES = Array.from({ length: 12 }, (_, i) => String(28 + i * 2)); // 28-50
const SHOE_SIZES = Array.from({ length: 12 }, (_, i) => String(5 + i)); // 5-16

const CLOTHING_BRANDS = ['Allen Solly', 'Van Heusen', "Levi's", 'Peter England', 'Arrow', 'Louis Philippe', 'Zara', 'H&M', 'Wrogn', 'Lee', 'Wrangler', 'Jack & Jones'];
const ELECTRONICS_BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'OnePlus', 'ASUS', 'Lenovo', 'Dell', 'HP', 'Sony', 'realme', 'Motorola'];

export default function Profile() {
  const { profile, loading, updateProfile } = useProfile();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && !form) setForm(profile);
  }, [profile]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleBrand = (brand, type) => {
    const key = type === 'clothing' ? 'preferredClothingBrands' : 'preferredElectronicsBrands';
    const current = form?.[key] || [];
    const updated = current.includes(brand) ? current.filter((b) => b !== brand) : [...current, brand];
    set(key, updated);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    await updateProfile(form);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User size={22} className="text-indigo-600" /> My Shopping Profile
          </h1>
          <p className="text-gray-500 text-sm mt-1">Set your sizes and budget once. We'll auto-filter every search.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          {saved ? <><CheckCircle size={15} /> Saved!</> : saving ? 'Saving…' : <><Save size={15} /> Save Profile</>}
        </button>
      </div>

      {/* Section: Personal */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-base">Personal Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gender */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Gender</label>
            <div className="flex gap-2">
              {['male', 'female', 'unisex'].map((g) => (
                <button
                  key={g}
                  onClick={() => set('gender', g)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
                    form.gender === g ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'} {g}
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Country / Currency</label>
            <select
              value={form.country || 'IN'}
              onChange={(e) => set('country', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-indigo-400"
            >
              <option value="IN">🇮🇳 India (₹)</option>
              <option value="US">🇺🇸 United States ($)</option>
              <option value="GB">🇬🇧 United Kingdom (£)</option>
              <option value="AE">🇦🇪 UAE (AED)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Section: Clothing Sizes */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-base">👕 Clothing Sizes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Shirt Size */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Shirt / Top Size</label>
            <div className="flex gap-1 flex-wrap">
              {SHIRT_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => set('shirtSize', s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.shirtSize === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Pant Size */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Pant / Jeans Waist</label>
            <div className="flex gap-1 flex-wrap max-h-24 overflow-y-auto">
              {PANT_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => set('pantSize', s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.pantSize === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Shoe Size */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Shoe Size (UK)</label>
            <div className="flex gap-1 flex-wrap max-h-24 overflow-y-auto">
              {SHOE_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => set('shoeSize', s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.shoeSize === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clothing Budget */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Clothing Budget Min</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input type="number" value={form.budgetClothingMin || 0} onChange={(e) => set('budgetClothingMin', Number(e.target.value))} className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Clothing Budget Max</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input type="number" value={form.budgetClothingMax || 5000} onChange={(e) => set('budgetClothingMax', Number(e.target.value))} className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
        </div>

        {/* Preferred Clothing Brands */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Preferred Clothing Brands <span className="text-gray-400 font-normal">(optional)</span></label>
          <div className="flex gap-2 flex-wrap">
            {CLOTHING_BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => toggleBrand(b, 'clothing')}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  (form.preferredClothingBrands || []).includes(b) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Electronics */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-base">📱 Electronics Budget</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Electronics Budget Min</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input type="number" value={form.budgetElectronicsMin || 0} onChange={(e) => set('budgetElectronicsMin', Number(e.target.value))} className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Electronics Budget Max</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input type="number" value={form.budgetElectronicsMax || 30000} onChange={(e) => set('budgetElectronicsMax', Number(e.target.value))} className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
        </div>

        {/* Preferred Electronics Brands */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Preferred Electronics Brands <span className="text-gray-400 font-normal">(optional)</span></label>
          <div className="flex gap-2 flex-wrap">
            {ELECTRONICS_BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => toggleBrand(b, 'electronics')}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  (form.preferredElectronicsBrands || []).includes(b) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* API Keys notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Want live results from all platforms?</p>
          <p className="text-amber-700">Add your <strong>SerpAPI</strong> key (100 free searches/month) and <strong>OpenAI</strong> key to <code className="bg-amber-100 px-1 rounded">server/.env</code> for real-time data with AI ranking.</p>
        </div>
      </div>

      {/* Save + Search */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
        >
          {saved ? <><CheckCircle size={16} /> Profile Saved!</> : saving ? 'Saving…' : <><Save size={16} /> Save Profile</>}
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
        >
          Start Shopping <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
