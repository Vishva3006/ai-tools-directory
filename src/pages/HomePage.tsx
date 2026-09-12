import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import type { Tool } from '../types';
import ToolCard from '../components/ui/ToolCard';
import CategoryCard from '../components/ui/CategoryCard';
import FeaturedToolCard from '../components/ui/FeaturedToolCard';
import { ArrowRight, Sparkles, Zap, Shield, Globe } from 'lucide-react';

import { mockTools } from '../data/mockData';

export default function HomePage() {
  const { categories } = useApp();
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [latestTools, setLatestTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const timeout = new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2000));
        const fetchPromise = Promise.all([
          supabase
            .from('tools')
            .select('*, category:categories(*)')
            .eq('is_featured', true)
            .eq('is_approved', true)
            .order('average_rating', { ascending: false })
            .limit(12),
          supabase
            .from('tools')
            .select('*, category:categories(*)')
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(8),
        ]);

        const [featuredRes, latestRes] = (await Promise.race([fetchPromise, timeout])) as any;

        if (cancelled) return;

        const featured = featuredRes?.data && featuredRes.data.length > 0
          ? featuredRes.data
          : mockTools.filter((t) => t.is_featured);

        const latest = latestRes?.data && latestRes.data.length > 0
          ? latestRes.data
          : mockTools;

        setFeaturedTools(featured);
        setLatestTools(latest);
      } catch {
        if (!cancelled) {
          setFeaturedTools(mockTools.filter((t) => t.is_featured));
          setLatestTools(mockTools);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const stats = [
    { label: 'AI Tools Listed', value: '500+' },
    { label: 'Categories', value: '10' },
    { label: 'User Reviews', value: '5,000+' },
    { label: 'Monthly Visitors', value: '100K+' },
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'Curated Collection',
      description: 'Hand-picked AI tools reviewed by experts for quality and reliability.',
    },
    {
      icon: Zap,
      title: 'Always Updated',
      description: 'New tools added daily with the latest innovations in AI technology.',
    },
    {
      icon: Shield,
      title: 'Verified Listings',
      description: 'All featured tools are verified for authenticity and performance.',
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Tools from around the world serving diverse use cases and industries.',
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQjciIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI2di0yaDEwek0zNiAyNHYySDI2di0yaDEweiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Discover the Best AI Tools
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Your Ultimate
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent"> AI Tools </span>
              Directory
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Find, compare, and review the best AI tools for your projects. From image generation to code assistants, we've got you covered.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                Explore Tools
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
      </section>

      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-700 dark:text-blue-400 text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Handpicked &amp; Verified
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Featured AI Tools
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The most popular and highest-rated AI tools trusted by professionals, creators, and developers worldwide.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredTools.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 dark:text-slate-400">No featured tools found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredTools.map((tool, i) => (
                <FeaturedToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-blue-500/25 hover:shadow-md"
            >
              View All Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Find the perfect AI tool by exploring our organized categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Latest AI Tools
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Stay ahead of the curve with the newest additions to our directory.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Why Choose AI Tools Directory?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We make it easy to find the right AI solution for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-600 to-teal-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Have an AI Tool to Share?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Submit your AI tool to our directory and reach thousands of potential users.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
          >
            Submit Your Tool
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
