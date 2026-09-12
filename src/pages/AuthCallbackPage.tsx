import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * AuthCallbackPage
 *
 * Supabase uses the PKCE (Proof Key for Code Exchange) flow for OAuth providers
 * like Google. After the user authenticates with Google, they are redirected back
 * to this page with a `code` query parameter. We immediately exchange this code
 * for a session using Supabase's JS client.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const code = searchParams.get('code') || hashParams.get('code');
      const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
      const errorCode = searchParams.get('error_code') || hashParams.get('error_code');

      if (errorDescription) {
        setError(`${errorDescription}${errorCode ? ` (${errorCode})` : ''}`);
        return;
      }

      if (!code) {
        setError('No authentication code found in the URL.');
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        setError(exchangeError.message);
      } else {
        navigate('/dashboard', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-2xl">✕</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Sign In Failed</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">AI</span>
        </div>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Completing sign in…</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">You will be redirected shortly</p>
      </div>
    </div>
  );
}
