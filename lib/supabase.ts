import { createClient } from '@supabase/supabase-js';

// We use optional chaining and fallback to empty string to prevent build crashes
// when the user hasn't configured the environment variables yet.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);
