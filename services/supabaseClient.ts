import { createClient } from '@supabase/supabase-js';

// Make sure that the environment variables are defined in your .env.local file
// and that Vite is configured to expose them.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
