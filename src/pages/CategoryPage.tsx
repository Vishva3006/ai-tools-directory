import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Tool, Category } from '../types';
import FeaturedToolCard from '../components/ui/FeaturedToolCard';
import {
  ArrowLeft, FileText, Image, Music, Video, Code, Bot,
  Search, TrendingUp, GraduationCap, BarChart2, Zap,
  SlidersHorizontal, Star,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  FileText, Image, Music, Video, Code, Bot, Search,
  TrendingUp, GraduationCap, BarChart2, Zap,
  Bolt: Zap, Palette: Image,
};

type SortKey = 'rating' | 'reviews' | 'views' | 'newest';
type PricingFilter = 'all' | 'free' | 'freemium' | 'paid';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'rating',  label: 'Top Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
  { value: 'views',   label: 'Most Popular' },
  { value: 'newest',  label: 'Newest' },
];

const pricingOptions: { value: PricingFilter; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'free',     label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid',     label: 'Paid' },
];

import { mockCategories, mockTools } from '../data/mockData';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('rating');
  const [pricing, setPricing] = useState<PricingFilter>('all');

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const timeout = new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2000));
        const res = (await Promise.race([
          supabase.from('categories').select('*').eq('slug', slug).maybeSingle(),
          timeout,
        ])) as any;

        if (res?.data && !cancelled) {
          setCategory(res.data);
          const toolsRes = (await Promise.race([
            supabase
              .from('tools')
              .select('*, category:categories(*)')
              .eq('category_id', res.data.id as string)
              .eq('is_approved', true),
            timeout,
          ])) as any;

          if (toolsRes?.data && toolsRes.data.length > 0) {
            setTools(toolsRes.data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback
      }

      if (!cancelled) {
        const mockCat = mockCategories.find((c) => c.slug === slug) ?? mockCategories[0];
        setCategory(mockCat);
        const catTools = mockTools.filter((t) => t.category_id === mockCat.id || t.category?.slug === mockCat.slug);
        setTools(catTools.length > 0 ? catTools : mockTools);
        setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [slug, sort]);

  const IconComponent = iconMap[category?.icon || ''] || Zap;
  const color = category?.color || '#3B82F6';

  const filtered = tools.filter((t) => {
    const matchSearch = search === '' || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchPricing = pricing === 'all' || t.pricing_type === pricing;
    return matchSearch && matchPricing;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="h-52 bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Category Not Found</h1>
          <Link to="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
            Browse all categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)` }}
      >
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full opacity-10"
          style={{ backgroundColor: color }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Categories
          </Link>

          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
              style={{ backgroundColor: color }}
            >
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-base max-w-xl leading-relaxed">
                  {category.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: color }}>
                  {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
                </span>
                {tools.filter(t => t.average_rating >= 4.5).length > 0 && (
                  <span className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 font-medium">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {tools.filter(t => t.average_rating >= 4.5).length} top-rated
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-blue-500 dark:focus:border-blue-400 rounded-lg outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Pricing filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 rounded-lg p-1">
            {pricingOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPricing(opt.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  pricing === opt.value
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tools grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length > 0 ? (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Showing {filtered.length} of {tools.length} tools
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((tool, i) => (
                <FeaturedToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${color}22` }}
            >
              <IconComponent className="w-8 h-8" style={{ color }} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No tools found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {search || pricing !== 'all' ? 'Try adjusting your filters' : 'No tools in this category yet'}
            </p>
            {(search || pricing !== 'all') && (
              <button
                onClick={() => { setSearch(''); setPricing('all'); }}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
