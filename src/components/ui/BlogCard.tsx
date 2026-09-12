import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import type { BlogPost } from '../../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600"
    >
      {post.cover_image_url ? (
        <div className="h-48 overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
          <span className="text-6xl font-bold text-white opacity-50">{post.title.charAt(0)}</span>
        </div>
      )}

      <div className="p-5">
        {post.category && (
          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full mb-3">
            {post.category}
          </span>
        )}

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post.published_at || post.created_at)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.reading_time} min read
          </div>
        </div>
      </div>
    </Link>
  );
}
