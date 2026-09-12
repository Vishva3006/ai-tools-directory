import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import type { Tool, Review } from '../types';
import { LayoutDashboard, Settings, Star, Heart, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [myReviews, setMyReviews] = useState<(Review & { tool?: Tool })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, tool:tools(*)')
      .eq('user_id', user?.id as string)
      .order('created_at', { ascending: false });

    setMyReviews((reviewsData || []) as (Review & { tool?: Tool })[]);

    const { data: favoritesData } = await supabase
      .from('favorites')
      .select('tool_id')
      .eq('user_id', user?.id as string);

    if (favoritesData && favoritesData.length > 0) {
      const toolIds = favoritesData.map((f) => f.tool_id);
      const { data: toolsData } = await supabase
        .from('tools')
        .select('*, category:categories(*)')
        .in('id', toolIds);
      setFavoriteTools(toolsData || []);
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Please sign in</h1>
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Go to login</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome back, {user.full_name || user.email}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <nav className="md:w-48 shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <main className="flex-1">
            {loading ? (
              <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-2xl font-bold text-slate-800 dark:text-white">{favoriteTools.length}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Saved Tools</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <span className="text-2xl font-bold text-slate-800 dark:text-white">{myReviews.length}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Reviews Written</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{user.role}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Account Type</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                      <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Profile Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Email</span>
                          <span className="text-slate-800 dark:text-white">{user.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Name</span>
                          <span className="text-slate-800 dark:text-white">{user.full_name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Joined</span>
                          <span className="text-slate-800 dark:text-white">{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'favorites' && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Your Favorite Tools</h3>
                    {favoriteTools.length > 0 ? (
                      <div className="space-y-3">
                        {favoriteTools.map((tool) => (
                          <Link key={tool.id} to={`/tool/${tool.slug}`} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                            <div>
                              <h4 className="font-medium text-slate-800 dark:text-white">{tool.name}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{tool.description}</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-slate-400" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-slate-500 dark:text-slate-400">No favorite tools yet</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Your Reviews</h3>
                    {myReviews.length > 0 ? (
                      <div className="space-y-3">
                        {myReviews.map((review) => (
                          <div key={review.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {review.tool && <Link to={`/tool/${review.tool.slug}`} className="font-medium text-blue-600 dark:text-blue-400">{review.tool.name}</Link>}
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  <span className="text-sm text-slate-600 dark:text-slate-400">{review.rating}</span>
                                </div>
                              </div>
                              <span className="text-sm text-slate-500 dark:text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            {review.title && <h4 className="font-medium text-slate-800 dark:text-white mb-1">{review.title}</h4>}
                            {review.content && <p className="text-sm text-slate-600 dark:text-slate-400">{review.content}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-slate-500 dark:text-slate-400">No reviews yet</p>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Account Settings</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
                        <input type="text" defaultValue={user.full_name || ''} placeholder="Your name" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                        <input type="email" defaultValue={user.email} disabled className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed" />
                      </div>
                      <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Save Changes</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
