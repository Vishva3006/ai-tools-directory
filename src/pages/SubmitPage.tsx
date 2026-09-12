import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Send, CheckCircle, AlertCircle, Loader2, LogIn, Info } from 'lucide-react';

// ─── Validation ──────────────────────────────────────────────────────────────

function validateForm(form: {
  name: string;
  description: string;
  website_url: string;
  category_id: string;
  pricing_type: string;
  starting_price: string;
  tags: string;
}): string | null {
  if (!form.name.trim()) return 'Tool name is required.';
  if (form.name.trim().length < 2) return 'Tool name must be at least 2 characters.';
  if (!form.description.trim()) return 'Description is required.';
  if (form.description.trim().length < 20)
    return 'Description must be at least 20 characters — give users a good overview.';
  if (!form.website_url.trim()) return 'Website URL is required.';
  try {
    const u = new URL(form.website_url.trim());
    if (!['http:', 'https:'].includes(u.protocol)) throw new Error();
  } catch {
    return 'Website URL must be a valid URL starting with http:// or https://';
  }
  if (form.pricing_type === 'paid' || form.pricing_type === 'freemium') {
    if (form.starting_price && isNaN(parseFloat(form.starting_price))) {
      return 'Starting price must be a valid number.';
    }
  }
  return null;
}

// ─── Human-readable Supabase error messages ──────────────────────────────────

function friendlyError(msg: string): string {
  if (msg.includes('42501') || msg.toLowerCase().includes('row-level security'))
    return 'You do not have permission to submit. Please sign in and try again.';
  if (msg.includes('duplicate') || msg.includes('unique'))
    return 'A tool with this name already exists. Please use a different name.';
  if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch'))
    return 'Network error — please check your connection and try again.';
  return msg;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '',
  description: '',
  website_url: '',
  category_id: '',
  pricing_type: 'freemium',
  starting_price: '',
  tags: '',
};

export default function SubmitPage() {
  const { user, categories } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation first
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return; // Don't even hit the network
    }

    setLoading(true);

    try {
      // Generate slug with random suffix to avoid collisions
      const baseSlug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

      const { error: submitError } = await supabase.from('tool_submissions').insert({
        name: form.name.trim(),
        slug,
        description: form.description.trim(),
        website_url: form.website_url.trim(),
        category_id: form.category_id || null,
        pricing_type: form.pricing_type,
        starting_price: form.starting_price ? parseFloat(form.starting_price) : null,
        tags: form.tags
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        submitter_email: user?.email || 'anonymous@example.com',
        status: 'pending',
      });

      if (submitError) {
        setError(friendlyError(submitError.message));
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error occurred.';
      setError(friendlyError(msg));
    } finally {
      // Always reset loading — prevents stuck spinner
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Submission Received!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            Thank you for submitting <strong>{form.name || 'your AI tool'}</strong>.
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mb-8">
            Our team will review it shortly and notify you at{' '}
            <span className="font-medium">{user?.email || 'your email'}</span>.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm(EMPTY_FORM);
              setError(null);
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Submit another tool
          </button>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Submit Your AI Tool</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Share your AI tool with our community. All submissions are reviewed before publishing.
          </p>
        </div>

        {/* Not logged in notice */}
        {!user && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium">You are not logged in.</span> You can still submit, but{' '}
              <Link to="/login" className="underline font-medium hover:text-blue-900 dark:hover:text-blue-100">
                signing in
              </Link>{' '}
              lets us notify you about your submission status.
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8">
          {/* Error banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Submission failed</p>
                <p className="text-sm mt-0.5">{error}</p>
                {error.includes('sign in') && (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 mt-2 text-sm font-medium underline hover:text-red-900 dark:hover:text-red-200"
                  >
                    <LogIn className="w-4 h-4" /> Go to Login
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Tool Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tool Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Amazing AI Writer"
                maxLength={100}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of your AI tool (min. 20 characters)"
                maxLength={500}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">
                {form.description.length}/500
              </p>
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Website URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Category + Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pricing Model
                </label>
                <select
                  value={form.pricing_type}
                  onChange={(e) => setForm({ ...form, pricing_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            {/* Starting Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Starting Price (USD, if applicable)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.starting_price}
                onChange={(e) => setForm({ ...form, starting_price: e.target.value })}
                placeholder="e.g., 9.99"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tags{' '}
                <span className="font-normal text-slate-400">(comma separated)</span>
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g., AI, writing, automation"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              id="submit-tool-btn"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Tool
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

