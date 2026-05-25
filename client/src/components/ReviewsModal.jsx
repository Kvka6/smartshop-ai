import { useState, useEffect } from 'react';
import { X, Video, Image, MessageSquare, ExternalLink, ThumbsUp, Shield } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function ReviewsModal({ product, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('reviews'); // 'reviews' | 'videos'

  useEffect(() => {
    const q = product.title.split(' ').slice(0, 5).join(' ');
    axios.get(`${API_BASE}/reviews`, { params: { q, source: product.source } })
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.error || 'Failed to fetch reviews'))
      .finally(() => setLoading(false));
  }, [product.id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-600 font-semibold mb-1 flex items-center gap-1">
                <Shield size={12} /> Genuine Reviews & Tech Videos
              </p>
              <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{product.title}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0"><X size={20} /></button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-3">
            <button
              onClick={() => setTab('reviews')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'reviews' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <MessageSquare size={12} /> Reviews with Photos
            </button>
            <button
              onClick={() => setTab('videos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'videos' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Video size={12} /> Tech Videos
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full" />
            <p className="text-sm text-gray-500">Finding genuine reviews…</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 px-5">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {data && tab === 'reviews' && (
          <div className="px-5 py-4 space-y-3">
            {data.reviews.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No verified photo reviews found for this product.</p>
            ) : (
              data.reviews.map((review, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-3 hover:border-green-200 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                      {review.author?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{review.author || 'Verified Buyer'}</p>
                      <div className="flex items-center gap-1">
                        {review.rating && <span className="text-xs text-yellow-600">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>}
                        {review.verified && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                            <Shield size={8} /> Verified
                          </span>
                        )}
                        {review.hasPhotos && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                            <Image size={8} /> Photos
                          </span>
                        )}
                      </div>
                    </div>
                    {review.helpful && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><ThumbsUp size={9} /> {review.helpful}</span>}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{review.text}</p>
                  {review.date && <p className="text-[10px] text-gray-400 mt-1">{review.date}</p>}
                </div>
              ))
            )}
            {data.reviewSource && (
              <a href={data.reviewSource} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline py-2">
                View all reviews on {product.source} <ExternalLink size={11} />
              </a>
            )}
          </div>
        )}

        {data && tab === 'videos' && (
          <div className="px-5 py-4 space-y-3">
            {data.videos.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No tech review videos found.</p>
            ) : (
              data.videos.map((video, i) => (
                <a key={i} href={video.link} target="_blank" rel="noopener noreferrer"
                  className="flex gap-3 border border-gray-100 rounded-xl p-3 hover:border-red-200 hover:bg-red-50/30 transition-colors group">
                  <div className="w-28 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">▶️</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Video size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{video.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{video.channel} {video.views && `· ${video.views}`}</p>
                  </div>
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
