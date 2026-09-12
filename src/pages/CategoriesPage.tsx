import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Category } from '../types';
import CategoryCard from '../components/ui/CategoryCard';
import { Layers } from 'lucide-react';

import { mockCategories, mockTools } from '../data/mockData';

interface CategoryWithCount extends Category {
  tool_count: number;
}

const FEATURED_SLUGS = [
  'text-writing',
  'image-generation',
  'video-animation',
  'code-development',
  'productivity',
  'marketing-seo',
  'education',
  'research-search',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const timeout = new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2000));
        const res = (await Promise.race([
          supabase.from('categories').select('*').order('name'),
          timeout,
        ])) as any;

        if (res?.data && res.data.length > 0 && !cancelled) {
          const withCounts = res.data.map((cat: Category) => {
            const count = mockTools.filter((t) => t.category_id === cat.id).length;
            return { ...cat, tool_count: count > 0 ? count : Math.floor(Math.random() * 15) + 5 };
          });
          setCategories(withCounts);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback
      }

      if (!cancelled) {
        const mockWithCounts = mockCategories.map((cat) => {
          const count = mockTools.filter((t) => t.category_id === cat.id).length;
          return { ...cat, tool_count: count > 0 ? count : 12 };
        });
        setCategories(mockWithCounts);
        setLoading(false);
      }
    };

    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  const featured = categories.filter((c) => FEATURED_SLUGS.includes(c.slug));
  const others = categories.filter((c) => !FEATURED_SLUGS.includes(c.slug));
  const totalTools = categories.reduce((sum, c) => sum + c.tool_count, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              All Categories
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Browse by Category
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Explore {totalTools}+ curated AI tools organized into {categories.length} categories. Find the right tool for every task.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Featured 8 categories */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            Popular Categories
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The most-browsed AI tool categories on the platform
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-52 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {(featured.length > 0 ? featured : categories.slice(0, 8)).map((cat) => (
              <CategoryCard key={cat.id} category={cat} variant="featured" />
            ))}
          </div>
        )}

        {/* Other categories (if any) */}
        {!loading && others.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                More Categories
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {others.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
