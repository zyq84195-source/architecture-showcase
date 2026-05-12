// supabase-auth.ts 不再需要，AuthContext 直接使用 supabase 客户端
// 保留文件以避免 import 报错，导出已有的 supabase 客户端
export { supabase, supabaseAdmin } from './supabase';
