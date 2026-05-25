import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-gray-900 text-lg tracking-tight">SmartShop</span>
            <span className="block text-xs text-indigo-500 font-semibold -mt-1 flex items-center gap-1">
              <Sparkles size={10} /> AI-Powered Deals
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Search size={15} />
            Search
          </Link>
          <Link
            to="/profile"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/profile') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User size={15} />
            My Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
