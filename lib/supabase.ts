import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type { PostgrestError } from '@supabase/supabase-js';
