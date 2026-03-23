import { createClient } from '@supabase/supabase-js';

// 临时禁用 Supabase（避免初始化错误）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
} else {
  console.log('⚠️ Supabase 已禁用（配置为占位符）');
  
  // 导出空客户端作为占位符
  export const supabase = null;
  export const supabaseAdmin = null;
}
