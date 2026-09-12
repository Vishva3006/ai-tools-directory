import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import type { Tool } from '../types';
import ToolCard from '../components/ui/ToolCard';
import SearchBar from '../components/ui/SearchBar';
import { Filter, Grid, List, Star, AlertCircle } from 'lucide-react';
import { mockTools } from '../data/mockData';

export default function ToolsPage() {
  const { categories } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    pricing: searchParams.get('pricing') || '',
    sort: searchParams.get('sort') || 'rating',
  });

  const getFilteredMockTools = (currentFilters: typeof filters) => {
    let list = [...mockTools];
    if (currentFilters.search) {
      const q = currentFilters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (currentFilters.category) {
      list = list.filter(
        (t) => t.category_id === currentFilters.category || t.category?.slug === currentFilters.category
      );
    }
    if (currentFilters.pricing) {
      list = list.filter((t) => t.pricing_type === currentFilters.pricing);
    }
    if (currentFilters.sort === 'rating') list.sort((a, b) => b.average_rating - a.average_rating);
    if (currentFilters.sort === 'reviews') list.sort((a, b) => b.reviews_count - a.reviews_count);
    if (currentFilters.sort === 'newest') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (currentFilters.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  };

  const fetchTools = useCallback(async (currentFilters: typeof filters) => {
    setLoading(true);
    setError(null);

    try {
      const timeout = new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2000));
      let query = supabase
        .from('tools')
        .select('*, category:categories(*)')
        .eq('is_approved', true)
        .eq('status', 'active');

      if (currentFilters.search) {
        const term = currentFilters.search;
        query = query.or(
          `name.ilike.%${term}%,description.ilike.%${term}%,long_description.ilike.%${term}%`
        );
      }

      if (currentFilters.category) {
        query = query.eq('category_id', currentFilters.category);
      }

      if (currentFilters.pricing) {
        query = query.eq('pricing_type', currentFilters.pricing);
      }

      switch (currentFilters.sort) {
        case 'rating':
          query = query.order('average_rating', { ascending: false });
          break;
        case 'reviews':
          query = query.order('reviews_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('average_rating', { ascending: false });
      }

      const res = (await Promise.race([query, timeout])) as any;

      if (res?.data && res.data.length > 0) {
        setTools(res.data);
      } else {
        setTools(getFilteredMockTools(currentFilters));
      }
    } catch {
      setTools(getFilteredMockTools(currentFilters));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTools(filters);
  }, [filters, fetchTools]);

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k === 'search' ? 'q' : k, v);
    });
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', pricing: '', sort: 'rating' });
    setSearchParams({}, { replace: true });
  };

  const activeFiltersCount = [filters.search, filters.category, filters.pricing].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">AI Tools</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Discover the best AI tools for your projects
              </p>
            </div>
            <div className="flex-1 max-w-xl">
              <SearchBar
                placeholder="Search by name, category, or description..."
                defaultValue={filters.search}
                onSearch={(q) => updateFilter('search', q)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-white">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pricing
                  </label>
                  <select
                    value={filters.pricing}
                    onChange={(e) => updateFilter('pricing', e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  >
                    <option value="">All Pricing</option>
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Paid</option>
                    <option value="subscription">Subscription</option>
                    <option value="contact">Contact for Pricing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="newest">Newest</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 dark:text-slate-400">
                {loading ? 'Loading...' : `${tools.length} tool${tools.length !== 1 ? 's' : ''} found`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  Failed to load tools
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-sm">{error}</p>
                <button
                  onClick={() => fetchTools(filters)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse ${viewMode === 'grid' ? 'h-72' : 'h-32'}`} />
                ))}
              </div>
            ) : tools.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {tools.map((tool) => (
                    <ToolListItem key={tool.id} tool={tool} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <Filter className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No tools found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {filters.search
                    ? `No tools match "${filters.search}". Try a different search term.`
                    : 'Try adjusting your filters or search query.'}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const pricingColors: Record<string, string> = {
  free: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  freemium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  subscription: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  contact: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

function ToolListItem({ tool }: { tool: Tool }) {
  return (
    <Link
      to={`/tool/${tool.slug}`}
      className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
    >
      <div className="flex items-start gap-4">
        {tool.logo_url ? (
          <img
            src={tool.logo_url}
            alt={tool.name}
            className="w-16 h-16 rounded-lg object-contain bg-slate-100 dark:bg-slate-700 p-2 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=3B82F6&color=fff&size=64`;
            }}
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-white">{tool.name.charAt(0)}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate">
                {tool.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                {tool.description}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full capitalize shrink-0 ${
                pricingColors[tool.pricing_type] ?? pricingColors.contact
              }`}
            >
              {tool.pricing_type}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {(tool.average_rating ?? 0).toFixed(1)}
              <span className="text-slate-400">({tool.reviews_count ?? 0})</span>
            </div>
            {tool.category && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                {(tool.category as { name: string }).name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
