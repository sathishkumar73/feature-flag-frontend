import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('[DEBUG] Supabase config:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey?.slice(0, 6) + '...' });

export const supabase = createClient(supabaseUrl, supabaseAnonKey)