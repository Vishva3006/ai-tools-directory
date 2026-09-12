import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import type { Tool, ToolSubmission, Profile, BlogPost, Category } from '../types';
import {
  CheckCircle, XCircle, Eye, Edit, Trash2, Users, Package,
  FileText, Clock, AlertCircle, LayoutDashboard, Tag,
  Search, Plus, X, Star, ExternalLink, ToggleLeft, ToggleRight,
} from 'lucide-react';

/* ─── tiny shared helpers ─────────────────────────────────────── */
const badge = (label: string, color: string) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
);

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ─── Modal wrapper ────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Input helper ─────────────────────────────────────────────── */
const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  /* data */
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submissions, setSubmissions] = useState<ToolSubmission[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  /* search */
  const [toolSearch, setToolSearch] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [subFilter, setSubFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  /* modals */
  type ToolForm = {
    id?: string; name: string; description: string; website_url: string;
    pricing_type: string; category_id: string; tags: string; is_featured: boolean; is_approved: boolean;
  };
  type CatForm = { id?: string; name: string; slug: string; description: string; color: string; icon: string };
  type PostForm = {
    id?: string; title: string; slug: string; excerpt: string;
    content: string; category: string; tags: string; is_published: boolean;
  };

  const blankTool: ToolForm = { name: '', description: '', website_url: '', pricing_type: 'free', category_id: '', tags: '', is_featured: false, is_approved: true };
  const blankCat: CatForm = { name: '', slug: '', description: '', color: '#3B82F6', icon: '🤖' };
  const blankPost: PostForm = { title: '', slug: '', excerpt: '', content: '', category: '', tags: '', is_published: false };

  const [toolModal, setToolModal] = useState<ToolForm | null>(null);
  const [catModal, setCatModal] = useState<CatForm | null>(null);
  const [postModal, setPostModal] = useState<PostForm | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── fetch ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (user?.role === 'admin') fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [toolsR, catsR, subsR, usersR, postsR] = await Promise.all([
      supabase.from('tools').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('tool_submissions').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('blog_posts').select('*, author:profiles(*)').order('created_at', { ascending: false }),
    ]);
    setTools(toolsR.data || []);
    setCategories(catsR.data || []);
    setSubmissions(subsR.data || []);
    setUsers(usersR.data || []);
    setPosts(postsR.data || []);
    setLoading(false);
  };

  /* ── Tool CRUD ─────────────────────────────────────────────── */
  const saveTool = async () => {
    if (!toolModal) return;
    setSaving(true);
    const payload = {
      name: toolModal.name,
      slug: toolModal.id ? undefined : slugify(toolModal.name) + '-' + Date.now(),
      description: toolModal.description,
      website_url: toolModal.website_url,
      pricing_type: toolModal.pricing_type,
      category_id: toolModal.category_id || null,
      tags: toolModal.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_featured: toolModal.is_featured,
      is_approved: toolModal.is_approved,
    };
    if (toolModal.id) {
      const { slug: _s, ...rest } = payload;
      await supabase.from('tools').update(rest).eq('id', toolModal.id);
    } else {
      await supabase.from('tools').insert(payload);
    }
    setToolModal(null);
    setSaving(false);
    fetchAll();
  };

  const deleteTool = async (id: string) => {
    if (!confirm('Delete this tool?')) return;
    await supabase.from('tools').delete().eq('id', id);
    fetchAll();
  };

  const toggleFeatured = async (id: string, val: boolean) => {
    await supabase.from('tools').update({ is_featured: !val }).eq('id', id);
    setTools(prev => prev.map(t => t.id === id ? { ...t, is_featured: !val } : t));
  };

  /* ── Category CRUD ─────────────────────────────────────────── */
  const saveCat = async () => {
    if (!catModal) return;
    setSaving(true);
    const payload = { name: catModal.name, slug: catModal.slug || slugify(catModal.name), description: catModal.description, color: catModal.color, icon: catModal.icon };
    if (catModal.id) {
      await supabase.from('categories').update(payload).eq('id', catModal.id);
    } else {
      await supabase.from('categories').insert(payload);
    }
    setCatModal(null);
    setSaving(false);
    fetchAll();
  };

  const deleteCat = async (id: string) => {
    if (!confirm('Delete this category? Tools in it will become uncategorized.')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchAll();
  };

  /* ── Submission actions ────────────────────────────────────── */
  const approveSubmission = async (sub: ToolSubmission) => {
    await supabase.from('tools').insert({
      name: sub.name,
      slug: slugify(sub.name) + '-' + Date.now(),
      description: sub.description,
      long_description: sub.long_description,
      website_url: sub.website_url,
      category_id: sub.category_id,
      pricing_type: sub.pricing_type,
      starting_price: sub.starting_price,
      tags: sub.tags,
      features: sub.features,
      is_approved: true,
    });
    await supabase.from('tool_submissions').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', sub.id);
    fetchAll();
  };

  const rejectSubmission = async (id: string) => {
    await supabase.from('tool_submissions').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', id);
    fetchAll();
  };

  /* ── Blog CRUD ─────────────────────────────────────────────── */
  const savePost = async () => {
    if (!postModal) return;
    setSaving(true);
    const payload = {
      title: postModal.title,
      slug: postModal.id ? undefined : slugify(postModal.title) + '-' + Date.now(),
      excerpt: postModal.excerpt,
      content: postModal.content,
      category: postModal.category,
      tags: postModal.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_published: postModal.is_published,
      published_at: postModal.is_published ? new Date().toISOString() : null,
    };
    if (postModal.id) {
      const { slug: _s, ...rest } = payload;
      await supabase.from('blog_posts').update(rest).eq('id', postModal.id);
    } else {
      await supabase.from('blog_posts').insert({ ...payload, author_id: user!.id, reading_time: Math.ceil(postModal.content.split(' ').length / 200) });
    }
    setPostModal(null);
    setSaving(false);
    fetchAll();
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchAll();
  };

  const togglePublish = async (id: string, val: boolean) => {
    await supabase.from('blog_posts').update({ is_published: !val, published_at: !val ? new Date().toISOString() : null }).eq('id', id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, is_published: !val } : p));
  };

  /* ── Guards ────────────────────────────────────────────────── */
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;

  /* ── Derived / filtered data ───────────────────────────────── */
  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(toolSearch.toLowerCase())
  );
  const filteredCats = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );
  const filteredSubs = submissions.filter(s =>
    (subFilter === 'all' || s.status === subFilter) &&
    (s.name.toLowerCase().includes(subSearch.toLowerCase()) || s.description.toLowerCase().includes(subSearch.toLowerCase()))
  );
  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
    (p.excerpt || '').toLowerCase().includes(postSearch.toLowerCase())
  );

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'submissions', label: 'Submissions', icon: Clock, count: pendingCount },
    { id: 'tools', label: 'Tools', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'blog', label: 'Blog Posts', icon: FileText },
  ];

  /* ── Stats ─────────────────────────────────────────────────── */
  const stats = [
    { label: 'Total Tools', value: tools.length, sub: `${tools.filter(t => t.is_featured).length} featured`, color: 'from-blue-500 to-blue-600' },
    { label: 'Categories', value: categories.length, sub: 'active', color: 'from-teal-500 to-teal-600' },
    { label: 'Total Users', value: users.length, sub: `${users.filter(u => u.role === 'admin').length} admins`, color: 'from-purple-500 to-purple-600' },
    { label: 'Blog Posts', value: posts.length, sub: `${posts.filter(p => p.is_published).length} published`, color: 'from-pink-500 to-pink-600' },
    { label: 'Pending', value: pendingCount, sub: 'submissions', color: pendingCount > 0 ? 'from-orange-500 to-orange-600' : 'from-slate-400 to-slate-500' },
  ];

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your AI Tools Directory</p>
            </div>
            <Link to="/" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
              <ExternalLink className="w-4 h-4" /> View Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <nav className="lg:w-56 shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 sticky top-20">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </div>
                  {tab.count != null && tab.count > 0 && (
                    <span className="px-1.5 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse" />)}
              </div>
            ) : (
              <>
                {/* ── OVERVIEW ────────────────────────────────── */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {stats.map(s => (
                        <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                            <span className="text-white text-lg font-bold">{s.value}</span>
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-white">{s.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{s.sub}</p>
                        </div>
                      ))}
                    </div>

                    {pendingCount > 0 && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{pendingCount} tool submission{pendingCount > 1 ? 's' : ''} awaiting review</p>
                          <button onClick={() => setActiveTab('submissions')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1">Review now →</button>
                        </div>
                      </div>
                    )}

                    {/* Recent tools */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-800 dark:text-white">Recent Tools</h2>
                        <button onClick={() => setActiveTab('tools')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all</button>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {tools.slice(0, 5).map(t => (
                          <div key={t.id} className="px-6 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-white">{t.name}</p>
                              <p className="text-xs text-slate-500">{t.category?.name || 'No category'} · {t.pricing_type}</p>
                            </div>
                            {t.is_featured && badge('Featured', 'bg-blue-100 text-blue-700')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SUBMISSIONS ─────────────────────────────── */}
                {activeTab === 'submissions' && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Tool Submissions</h2>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input className={inputCls + ' pl-9'} placeholder="Search submissions…" value={subSearch} onChange={e => setSubSearch(e.target.value)} />
                        </div>
                        <select className={inputCls + ' sm:w-40'} value={subFilter} onChange={e => setSubFilter(e.target.value as typeof subFilter)}>
                          <option value="all">All</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                    {filteredSubs.length > 0 ? (
                      <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredSubs.map(sub => (
                          <div key={sub.id} className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-medium text-slate-800 dark:text-white">{sub.name}</h3>
                                  {badge(sub.status, sub.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : sub.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{sub.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                  <span>{sub.submitter_email}</span>
                                  <span>·</span>
                                  <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                                  <span>·</span>
                                  <a href={sub.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" /> Visit
                                  </a>
                                </div>
                              </div>
                              {sub.status === 'pending' && (
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => approveSubmission(sub)} title="Approve" className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => rejectSubmission(sub.id)} title="Reject" className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-slate-400 dark:text-slate-500">No submissions match your filter</div>
                    )}
                  </div>
                )}

                {/* ── TOOLS ───────────────────────────────────── */}
                {activeTab === 'tools' && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Manage Tools <span className="text-sm font-normal text-slate-400">({tools.length})</span></h2>
                        <button onClick={() => setToolModal({ ...blankTool })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          <Plus className="w-4 h-4" /> Add Tool
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input className={inputCls + ' pl-9'} placeholder="Search tools…" value={toolSearch} onChange={e => setToolSearch(e.target.value)} />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                          <tr>
                            {['Name', 'Category', 'Pricing', 'Featured', 'Actions'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {filteredTools.map(tool => (
                            <tr key={tool.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-medium text-slate-800 dark:text-white truncate max-w-[180px]">{tool.name}</p>
                                <p className="text-xs text-slate-400 truncate max-w-[180px]">{tool.description}</p>
                              </td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tool.category?.name || '—'}</td>
                              <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">{tool.pricing_type}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => toggleFeatured(tool.id, tool.is_featured)} className={`flex items-center gap-1 text-xs font-medium transition-colors ${tool.is_featured ? 'text-blue-600' : 'text-slate-400'}`}>
                                  {tool.is_featured ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                  {tool.is_featured ? 'Yes' : 'No'}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <Link to={`/tool/${tool.slug}`} title="View" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"><Eye className="w-4 h-4" /></Link>
                                  <button title="Edit" onClick={() => setToolModal({ id: tool.id, name: tool.name, description: tool.description, website_url: tool.website_url, pricing_type: tool.pricing_type, category_id: tool.category_id || '', tags: tool.tags.join(', '), is_featured: tool.is_featured, is_approved: tool.is_approved })} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                                  <button title="Delete" onClick={() => deleteTool(tool.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredTools.length === 0 && <div className="p-12 text-center text-slate-400">No tools found</div>}
                    </div>
                  </div>
                )}

                {/* ── CATEGORIES ──────────────────────────────── */}
                {activeTab === 'categories' && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Manage Categories <span className="text-sm font-normal text-slate-400">({categories.length})</span></h2>
                        <button onClick={() => setCatModal({ ...blankCat })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          <Plus className="w-4 h-4" /> Add Category
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input className={inputCls + ' pl-9'} placeholder="Search categories…" value={catSearch} onChange={e => setCatSearch(e.target.value)} />
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredCats.map(cat => (
                        <div key={cat.id} className="px-6 py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: cat.color + '22', border: `2px solid ${cat.color}` }}>
                              {cat.icon || cat.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 dark:text-white">{cat.name}</p>
                              <p className="text-xs text-slate-400">/{cat.slug} · {tools.filter(t => t.category_id === cat.id).length} tools</p>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => setCatModal({ id: cat.id, name: cat.name, slug: cat.slug, description: cat.description || '', color: cat.color, icon: cat.icon || '' })} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteCat(cat.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                      {filteredCats.length === 0 && <div className="p-12 text-center text-slate-400">No categories found</div>}
                    </div>
                  </div>
                )}

                {/* ── USERS ───────────────────────────────────── */}
                {activeTab === 'users' && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Users <span className="text-sm font-normal text-slate-400">({users.length})</span></h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                          <tr>
                            {['User', 'Role', 'Joined'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                    {(u.full_name || u.email).charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800 dark:text-white">{u.full_name || '—'}</p>
                                    <p className="text-xs text-slate-400">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">{badge(u.role, u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'moderator' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300')}</td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── BLOG ────────────────────────────────────── */}
                {activeTab === 'blog' && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Blog Posts <span className="text-sm font-normal text-slate-400">({posts.length})</span></h2>
                        <button onClick={() => setPostModal({ ...blankPost })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          <Plus className="w-4 h-4" /> New Post
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input className={inputCls + ' pl-9'} placeholder="Search posts…" value={postSearch} onChange={e => setPostSearch(e.target.value)} />
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredPosts.map(post => (
                        <div key={post.id} className="px-6 py-4 flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-slate-800 dark:text-white">{post.title}</p>
                              {badge(post.is_published ? 'Published' : 'Draft', post.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400')}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{post.excerpt || 'No excerpt'}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button title={post.is_published ? 'Unpublish' : 'Publish'} onClick={() => togglePublish(post.id, post.is_published)} className={`p-1.5 rounded transition-colors ${post.is_published ? 'text-green-500 hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700' : 'text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                              <Star className="w-4 h-4" />
                            </button>
                            <Link to={`/blog/${post.slug}`} title="View" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"><Eye className="w-4 h-4" /></Link>
                            <button title="Edit" onClick={() => setPostModal({ id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt || '', content: post.content, category: post.category || '', tags: post.tags.join(', '), is_published: post.is_published })} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                            <button title="Delete" onClick={() => deletePost(post.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                      {filteredPosts.length === 0 && <div className="p-12 text-center text-slate-400">No posts found</div>}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ══ TOOL MODAL ══════════════════════════════════════════ */}
      {toolModal && (
        <Modal title={toolModal.id ? 'Edit Tool' : 'Add Tool'} onClose={() => setToolModal(null)}>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input className={inputCls} value={toolModal.name} onChange={e => setToolModal({ ...toolModal, name: e.target.value })} placeholder="ChatGPT" />
            </div>
            <div>
              <label className={labelCls}>Description *</label>
              <textarea className={inputCls} rows={3} value={toolModal.description} onChange={e => setToolModal({ ...toolModal, description: e.target.value })} placeholder="Short description…" />
            </div>
            <div>
              <label className={labelCls}>Website URL *</label>
              <input className={inputCls} value={toolModal.website_url} onChange={e => setToolModal({ ...toolModal, website_url: e.target.value })} placeholder="https://example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Pricing</label>
                <select className={inputCls} value={toolModal.pricing_type} onChange={e => setToolModal({ ...toolModal, pricing_type: e.target.value })}>
                  {['free', 'freemium', 'paid', 'enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={toolModal.category_id} onChange={e => setToolModal({ ...toolModal, category_id: e.target.value })}>
                  <option value="">— None —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Tags (comma-separated)</label>
              <input className={inputCls} value={toolModal.tags} onChange={e => setToolModal({ ...toolModal, tags: e.target.value })} placeholder="ai, chatbot, writing" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={toolModal.is_featured} onChange={e => setToolModal({ ...toolModal, is_featured: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={toolModal.is_approved} onChange={e => setToolModal({ ...toolModal, is_approved: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                Approved
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setToolModal(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button onClick={saveTool} disabled={saving || !toolModal.name || !toolModal.description || !toolModal.website_url} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors">
                {saving ? 'Saving…' : toolModal.id ? 'Save Changes' : 'Add Tool'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ CATEGORY MODAL ══════════════════════════════════════ */}
      {catModal && (
        <Modal title={catModal.id ? 'Edit Category' : 'Add Category'} onClose={() => setCatModal(null)}>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input className={inputCls} value={catModal.name} onChange={e => setCatModal({ ...catModal, name: e.target.value, slug: catModal.id ? catModal.slug : slugify(e.target.value) })} placeholder="Image Generation" />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input className={inputCls} value={catModal.slug} onChange={e => setCatModal({ ...catModal, slug: e.target.value })} placeholder="image-generation" />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={2} value={catModal.description} onChange={e => setCatModal({ ...catModal, description: e.target.value })} placeholder="Brief description…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={catModal.color} onChange={e => setCatModal({ ...catModal, color: e.target.value })} className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer" />
                  <input className={inputCls} value={catModal.color} onChange={e => setCatModal({ ...catModal, color: e.target.value })} placeholder="#3B82F6" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Icon (emoji)</label>
                <input className={inputCls} value={catModal.icon} onChange={e => setCatModal({ ...catModal, icon: e.target.value })} placeholder="🤖" maxLength={4} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setCatModal(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button onClick={saveCat} disabled={saving || !catModal.name} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors">
                {saving ? 'Saving…' : catModal.id ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ BLOG POST MODAL ═════════════════════════════════════ */}
      {postModal && (
        <Modal title={postModal.id ? 'Edit Post' : 'New Blog Post'} onClose={() => setPostModal(null)}>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title *</label>
              <input className={inputCls} value={postModal.title} onChange={e => setPostModal({ ...postModal, title: e.target.value, slug: postModal.id ? postModal.slug : slugify(e.target.value) })} placeholder="Top 10 AI tools in 2025" />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input className={inputCls} value={postModal.slug} onChange={e => setPostModal({ ...postModal, slug: e.target.value })} placeholder="top-10-ai-tools-2025" />
            </div>
            <div>
              <label className={labelCls}>Excerpt</label>
              <input className={inputCls} value={postModal.excerpt} onChange={e => setPostModal({ ...postModal, excerpt: e.target.value })} placeholder="Short summary shown on listing page" />
            </div>
            <div>
              <label className={labelCls}>Content *</label>
              <textarea className={inputCls} rows={8} value={postModal.content} onChange={e => setPostModal({ ...postModal, content: e.target.value })} placeholder="Write your post content here…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <input className={inputCls} value={postModal.category} onChange={e => setPostModal({ ...postModal, category: e.target.value })} placeholder="Tutorials" />
              </div>
              <div>
                <label className={labelCls}>Tags (comma-separated)</label>
                <input className={inputCls} value={postModal.tags} onChange={e => setPostModal({ ...postModal, tags: e.target.value })} placeholder="ai, news" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={postModal.is_published} onChange={e => setPostModal({ ...postModal, is_published: e.target.checked })} className="w-4 h-4 accent-blue-600" />
              Publish immediately
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setPostModal(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button onClick={savePost} disabled={saving || !postModal.title || !postModal.content} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors">
                {saving ? 'Saving…' : postModal.id ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
