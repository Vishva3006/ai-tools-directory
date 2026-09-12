import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../types';
import BlogCard from '../components/ui/BlogCard';
import { FileText } from 'lucide-react';

import { mockBlogPosts } from '../data/mockData';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const timeout = new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2000));
      const res = (await Promise.race([
        supabase.from('blog_posts').select('*, author:profiles(*)').eq('is_published', true).order('published_at', { ascending: false }),
        timeout,
      ])) as any;

      if (res?.data && res.data.length > 0) {
        setPosts(res.data);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }

    setPosts(mockBlogPosts);
    setLoading(false);
  };

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];

  const filteredPosts = category ? posts.filter((p) => p.category === category) : posts;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Blog</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Latest news, tutorials, and insights about AI tools</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setCategory('')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              All
            </button>
            {categories.map((cat) => (
              <button key={cat as string} onClick={() => setCategory(cat as string)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => <BlogCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <FileText className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No posts yet</h3>
            <p className="text-slate-600 dark:text-slate-400">Check back soon for new content</p>
          </div>
        )}
      </div>
    </div>
  );
}
