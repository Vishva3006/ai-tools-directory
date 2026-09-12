import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ExternalLink, Sparkles } from 'lucide-react';
import type { Tool } from '../../types';

interface FeaturedToolCardProps {
  tool: Tool;
  index: number;
}

const pricingConfig = {
  free: { label: 'Free', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800' },
  freemium: { label: 'Freemium', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 ring-blue-200 dark:ring-blue-800' },
  paid: { label: 'Paid', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 ring-amber-200 dark:ring-amber-800' },
  enterprise: { label: 'Enterprise', classes: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-600' },
};

const gradients = [
  'from-blue-500 to-teal-400',
  'from-rose-500 to-orange-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-cyan-400',
  'from-amber-500 to-yellow-400',
  'from-pink-500 to-fuchsia-400',
  'from-indigo-500 to-blue-400',
  'from-teal-500 to-green-400',
  'from-orange-500 to-red-400',
  'from-cyan-500 to-sky-400',
  'from-fuchsia-500 to-pink-400',
  'from-lime-500 to-emerald-400',
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : star - 0.5 <= rating
              ? 'text-amber-400 fill-amber-400/50'
              : 'text-slate-300 dark:text-slate-600'
          }`}
        />
      ))}
    </div>
  );
}

export default function FeaturedToolCard({ tool, index }: FeaturedToolCardProps) {
  const [imgError, setImgError] = useState(false);
  const pricing = pricingConfig[tool.pricing_type] ?? pricingConfig.free;
  const gradient = gradients[index % gradients.length];
  const initial = tool.name.charAt(0).toUpperCase();

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 hover:-translate-y-1">
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />

      {/* Card header */}
      <div className="flex items-start gap-4 p-5 pb-4">
        {/* Logo */}
        <div className="relative shrink-0">
          {tool.logo_url && !imgError ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm">
              <img
                src={tool.logo_url}
                alt={tool.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
              <span className="text-xl font-bold text-white">{initial}</span>
            </div>
          )}
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Name + category + pricing */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tool.name}
            </h3>
            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${pricing.classes}`}>
              {pricing.label}
            </span>
          </div>

          {tool.category && (
            <span className="inline-block text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md font-medium">
              {tool.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="px-5 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1">
        {tool.description}
      </p>

      {/* Rating row */}
      <div className="px-5 mt-4 flex items-center gap-2">
        <StarRating rating={tool.average_rating} />
        <span className="text-sm font-semibold text-slate-800 dark:text-white">
          {Number(tool.average_rating).toFixed(1)}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          ({tool.reviews_count.toLocaleString()} reviews)
        </span>
      </div>

      {/* Action footer */}
      <div className="px-5 pt-4 pb-5 mt-auto flex items-center gap-2">
        <a
          href={tool.website_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r ${gradient} text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm`}
        >
          Visit Website
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <Link
          to={`/tool/${tool.slug}`}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
