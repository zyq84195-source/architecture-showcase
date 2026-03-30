import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 临时禁用 Supabase（避免初始化错误）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

let supabase: SupabaseClient | null = null;
let supabaseAdmin: SupabaseClient | null = null;

if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
} else {
  console.log('Supabase is disabled (using placeholder config)');
}

export { supabase, supabaseAdmin };

