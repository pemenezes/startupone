import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

/**
 * Implicit flow so recovery e-mail links work even if the user opens them
 * in another browser/device (PKCE would require the original code verifier).
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      flowType: 'implicit',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
