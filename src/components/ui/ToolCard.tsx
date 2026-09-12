import { Link } from 'react-router-dom';
import type { Tool } from '../../types';
import { Star, Eye } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  featured?: boolean;
}

export default function ToolCard({ tool, featured }: ToolCardProps) {
  const pricingColors = {
    free: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    freemium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <Link
      to={`/tool/${tool.slug}`}
      className={`group block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 ${featured ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="relative">
        {featured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-full">
              Featured
            </span>
          </div>
        )}
        {tool.logo_url ? (
          <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center p-6">
            <img
              src={tool.logo_url}
              alt={tool.name}
              className="max-h-24 max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=3B82F6&color=fff&size=128`;
              }}
            />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
            <span className="text-5xl font-bold text-white">{tool.name.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {tool.name}
          </h3>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${pricingColors[tool.pricing_type]}`}>
            {tool.pricing_type}
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
          {tool.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-slate-800 dark:text-white">{tool.average_rating.toFixed(1)}</span>
            <span className="text-slate-500 dark:text-slate-400">({tool.reviews_count})</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Eye className="w-4 h-4" />
            {tool.views_count.toLocaleString()}
          </div>
        </div>

        {tool.starting_price && tool.pricing_type !== 'free' && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Starting at </span>
            <span className="font-semibold text-slate-800 dark:text-white">${tool.starting_price}/mo</span>
          </div>
        )}
      </div>
    </Link>
  );
}
