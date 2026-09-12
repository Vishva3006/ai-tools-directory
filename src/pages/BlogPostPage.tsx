import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../types';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (slug) fetchPost(); }, [slug]);

  const fetchPost = async () => {
    const { data } = await supabase.from('blog_posts').select('*, author:profiles(*)').eq('slug', slug as string).eq('is_published', true).single();
    if (data) setPost(data);
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8"><div className="max-w-4xl mx-auto"><div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" /></div></div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">Back to blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/blog" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-8">
          {post.category && <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full mb-4">{post.category}</span>}
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-xl text-slate-600 dark:text-slate-400">{post.excerpt}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.reading_time} min read</div>
            {post.author && <div className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author.full_name || 'Author'}</div>}
          </div>
        </header>

        {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-xl mb-8" />}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap">{post.content}</div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">{post.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">{tag}</span>)}</div>
          </div>
        )}
      </article>
    </div>
  );
}
