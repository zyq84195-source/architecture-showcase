import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SQL_STATEMENTS = [
  // 1. profiles 表
  `CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // 2. 自动创建 profile 的函数
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER`,

  // 3. 触发器
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   CREATE TRIGGER on_auth_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`,

  // 4. favorites 表
  `CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    case_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, case_id)
  )`,

  // 5. comments 表
  `CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    case_id TEXT NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // 6. 索引
  `CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_favorites_case_id ON public.favorites(case_id)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_case_id ON public.comments(case_id)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_created ON public.comments(created_at DESC)`,

  // 7. RLS
  `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,
  `CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true)`,
  `CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)`,

  `ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY`,
  `CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id)`,
  `CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id)`,
  `CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id)`,

  `ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY`,
  `CREATE POLICY "Comments are publicly readable" ON public.comments FOR SELECT USING (true)`,
  `CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id)`,
  `CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id)`,
  `CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id)`,
];

async function run() {
  console.log('Using Supabase Management API to execute SQL...');
  console.log('Project URL:', supabaseUrl);

  // 用 Supabase 的 SQL 执行 REST 端点
  for (let i = 0; i < SQL_STATEMENTS.length; i++) {
    const sql = SQL_STATEMENTS[i];
    const label = sql.substring(0, 80).replace(/\n/g, ' ').trim();
    console.log(`\n[${i + 1}/${SQL_STATEMENTS.length}] ${label}...`);

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/pgmeta`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`  ✅ Success`);
      } else {
        const text = await res.text();
        // Try alternative: direct SQL via fetch
        const res2 = await fetch(`${supabaseUrl}/pg/query`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: sql }),
        });
        if (res2.ok) {
          console.log(`  ✅ Success (pg/query)`);
        } else {
          console.log(`  ❌ Failed (${res.status}): ${text.substring(0, 200)}`);
        }
      }
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
  }

  // 验证
  console.log('\n--- Verifying tables ---');
  for (const table of ['profiles', 'favorites', 'comments']) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`${table}: ❌ ${error.message}`);
    } else {
      console.log(`${table}: ✅ exists`);
    }
  }
}

run();
