import { Link } from 'react-router-dom';
import type { Category } from '../../types';
import {
  FileText, Image, Music, Video, Code, Bot, Search,
  TrendingUp, GraduationCap, BarChart2, Zap, ArrowRight,
} from 'lucide-react';

interface CategoryCardProps {
  category: Category & { tool_count?: number };
  variant?: 'default' | 'featured';
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Image, Music, Video, Code, Bot, Search,
  TrendingUp, GraduationCap, BarChart2, Zap,
  // legacy aliases
  Bolt: Zap,
  Palette: Image,
};

export default function CategoryCard({ category, variant = 'default' }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon || ''] || Zap;
  const color = category.color || '#3B82F6';

  if (variant === 'featured') {
    return (
      <Link
        to={`/category/${category.slug}`}
        className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        {/* Gradient header strip */}
        <div
          className="h-24 flex items-end px-6 pb-4 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color}dd, ${color}88)` }}
        >
          <div
            className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20"
            style={{ backgroundColor: '#fff' }}
          />
          <IconComponent className="w-10 h-10 text-white drop-shadow" />
        </div>
        <div className="p-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
              {category.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            {category.tool_count !== undefined ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: color }}>
                {category.tool_count} {category.tool_count === 1 ? 'tool' : 'tools'}
              </span>
            ) : <span />}
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
              Explore <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600"
    >
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ backgroundColor: color }}
      />
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ backgroundColor: color }}
      >
        <IconComponent className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
          {category.description}
        </p>
      )}
      {category.tool_count !== undefined && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          {category.tool_count} {category.tool_count === 1 ? 'tool' : 'tools'}
        </p>
      )}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Explore →</span>
      </div>
    </Link>
  );
}
