import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Compass } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Browse All Tools', href: '/tools', icon: Search },
  { label: 'View Categories', href: '/categories', icon: Compass },
  { label: 'Read Our Blog', href: '/blog', icon: ArrowLeft },
  { label: 'Submit a Tool', href: '/submit', icon: Home },
];

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">

        {/* Animated 404 */}
        <div className="relative mb-8 inline-block">
          <div className="text-[10rem] md:text-[14rem] font-black text-slate-100 dark:text-slate-800 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-600 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-black text-3xl md:text-4xl">AI</span>
            </div>
          </div>
        </div>

        {/* Copy */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-3 max-w-lg mx-auto">
          Looks like this page got lost in the AI multiverse. Don't worry — the best tools are just a click away.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mb-10">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Primary CTA */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/25 mb-10"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>

        {/* Quick Links */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-5">
            Or explore these sections:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
              >
                <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
