import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
  console.warn('Using placeholder Supabase credentials. Database functionality will be limited.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type { PostgrestError } from '@supabase/supabase-js';
