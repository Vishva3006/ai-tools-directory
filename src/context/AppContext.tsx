import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Category } from '../types';

import { mockCategories } from '../data/mockData';

interface AppContextType {
  user: Profile | null;
  loading: boolean;
  categories: Category[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const timeout = new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2500));
        const res = await Promise.race([supabase.from('categories').select('*').order('name'), timeout]) as any;
        if (res?.data && res.data.length > 0) {
          setCategories(res.data);
          return;
        }
      } catch {
        // Fallback to mockCategories
      }
      setCategories(mockCategories);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const timeout = new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 2000));
        const res = await Promise.race([supabase.auth.getSession(), timeout]) as any;
        if (res?.data?.session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', res.data.session.user.id)
            .single();
          setUser(profile);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setUser(profile);
    }
  };

  return (
    <AppContext.Provider value={{ user, loading, categories, darkMode, toggleDarkMode, signOut, refreshUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
