import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2, Clock, MessageSquare } from 'lucide-react';

// ─── Validation ──────────────────────────────────────────────────────────────

function validateContact(form: { name: string; email: string; subject: string; message: string }): string | null {
  if (!form.name.trim()) return 'Your name is required.';
  if (form.name.trim().length < 2) return 'Name must be at least 2 characters.';
  if (!form.email.trim()) return 'Email address is required.';
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(form.email.trim())) return 'Please enter a valid email address.';
  if (!form.subject.trim()) return 'Subject is required.';
  if (form.subject.trim().length < 3) return 'Subject must be at least 3 characters.';
  if (!form.message.trim()) return 'Message is required.';
  if (form.message.trim().length < 20) return 'Message must be at least 20 characters.';
  return null;
}

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' };

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email Us',
    value: 'hello@aitoolsdirectory.com',
    sub: 'We reply within 24 hours',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon – Fri, 9 AM – 6 PM EST',
    sub: 'Closed on public holidays',
  },
  {
    icon: MapPin,
    label: 'Headquarters',
    value: 'San Francisco, CA',
    sub: 'United States',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateContact(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting contact message to Supabase...', form);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out. Please check your network and try again.')), 15000)
      );

      const insertPromise = supabase.from('contact_messages').insert({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      const result = await Promise.race([insertPromise, timeoutPromise]) as any;
      const dbError = result?.error;

      if (dbError) {
        console.error('Supabase DB insertion error:', dbError);
        // Display exact Supabase error message
        setError(dbError.message || JSON.stringify(dbError));
      } else {
        console.log('Contact message submitted successfully!');
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error('Contact form submission caught error:', err);
      setError(err?.message || 'Unexpected error occurred. Please try again.');
    } finally {
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Message Sent!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Thank you, <strong>{form.name}</strong>! We've received your message and will get back to you within 24 hours at{' '}
            <span className="font-medium text-blue-600 dark:text-blue-400">{form.email}</span>.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); }}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  // ── Main page ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-blue-100 max-w-xl mx-auto">
            Have a question, suggestion, or partnership idea? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact Info */}
          <div className="space-y-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value, sub }) => (
              <div
                key={label}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Submit a Tool</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Want to list your AI tool?{' '}
                <a href="/submit" className="text-blue-600 dark:text-blue-400 underline font-medium">
                  Use our submission form
                </a>{' '}
                for faster processing.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Send us a Message</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Select a subject…</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Tool Submission Help">Tool Submission Help</option>
                  <option value="Report an Issue">Report an Issue</option>
                  <option value="Partnership / Advertising">Partnership / Advertising</option>
                  <option value="Press / Media">Press / Media</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you… (min. 20 characters)"
                  maxLength={2000}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{form.message.length}/2000</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="contact-submit-btn"
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
