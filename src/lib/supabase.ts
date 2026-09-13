import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ermpvrmjymtzzsxnbulh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybXB2cm1qeW10enpzeG5idWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzYyNDYsImV4cCI6MjA5Nzk1MjI0Nn0.hKDdaK9sgCWYjagozWGRj8losq1XAoxQnopbD3qVgSg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

