import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import type { Tool, Review } from '../types';
import Rating from '../components/ui/Rating';
import {
  Star, ExternalLink, Eye, Bookmark, Check, ThumbsUp,
  Globe, DollarSign, Tag, Calendar, ArrowLeft, MessageSquare
} from 'lucide-react';

import { mockTools } from '../data/mockData';

export default function ToolDetailPage() {
  const { slug } = useParams();
  const { user } = useApp();
  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (slug) fetchTool(); }, [slug]);

  const fetchTool = async () => {
    try {
      const timeout = new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2000));
      const res = (await Promise.race([
        supabase
          .from('tools')
          .select('*, category:categories(*)')
          .eq('slug', slug as string)
          .single(),
        timeout,
      ])) as any;

      if (res?.data) {
        setTool(res.data);
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*, user:profiles(*)')
          .eq('tool_id', res.data.id as string)
          .order('helpful_count', { ascending: false });
        setReviews(reviewsData || []);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }

    const mock = mockTools.find((t) => t.slug === slug || t.id === slug);
    setTool(mock ?? mockTools[0]);
    setLoading(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tool) return;
    setSubmitting(true);

    const { error } = await supabase.from('reviews').insert({
      tool_id: tool.id as string,
      user_id: user.id as string,
      rating: reviewForm.rating,
      title: reviewForm.title,
      content: reviewForm.content,
    });

    if (!error) {
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', content: '' });
      fetchTool();
    }
    setSubmitting(false);
  };

  const pricingColors = {
    free: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    freemium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8"><div className="max-w-5xl mx-auto"><div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" /></div></div>;
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Tool Not Found</h1>
          <Link to="/tools" className="text-blue-600 dark:text-blue-400 hover:underline">Browse all tools</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link to="/tools" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to tools
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-3xl font-bold text-white">{tool.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{tool.name}</h1>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${pricingColors[tool.pricing_type]}`}>
                      {tool.pricing_type}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{tool.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {tool.average_rating.toFixed(1)} ({tool.reviews_count} reviews)</div>
                    <div className="flex items-center gap-1"><Eye className="w-4 h-4" /> {tool.views_count.toLocaleString()} views</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  <ExternalLink className="w-5 h-5" /> Visit Website
                </a>
                <button className="inline-flex items-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <Bookmark className="w-5 h-5" /> Save
                </button>
              </div>

              {tool.features && tool.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tool.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-green-500" /> {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tool.tags && tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:w-1/3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Quick Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Website</p>
                      <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-sm hover:underline truncate block max-w-[200px]">
                        {new URL(tool.website_url).hostname}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Pricing</p>
                      <p className="text-slate-800 dark:text-white text-sm capitalize">{tool.pricing_type}{tool.starting_price && ` from $${tool.starting_price}/mo`}</p>
                    </div>
                  </div>
                  {tool.category && (
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Category</p>
                        <Link to={`/category/${tool.category.slug}`} className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                          {tool.category.name}
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Added</p>
                      <p className="text-slate-800 dark:text-white text-sm">{new Date(tool.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Reviews ({reviews.length})</h2>
            {user && (
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Write Your Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating</label>
                  <Rating value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
                  <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} required className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Review</label>
                  <textarea value={reviewForm.content} onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })} rows={4} required className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white" />
                </div>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{(review.user?.full_name || 'U').charAt(0)}</span>
                        </div>
                        <span className="font-medium text-slate-800 dark:text-white">{review.user?.full_name || 'Anonymous'}</span>
                      </div>
                      <Rating value={review.rating} readonly size="sm" />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  {review.title && <h4 className="font-medium text-slate-800 dark:text-white mb-1">{review.title}</h4>}
                  {review.content && <p className="text-slate-600 dark:text-slate-400 text-sm">{review.content}</p>}
                  <button className="mt-2 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600">
                    <ThumbsUp className="w-4 h-4" /> Helpful ({review.helpful_count})
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
