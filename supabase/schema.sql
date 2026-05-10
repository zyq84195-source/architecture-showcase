-- Architecture Showcase - Supabase 建表 SQL
-- 在 Supabase SQL Editor 中运行此脚本

-- ============================================================
-- 1. 案例主表
-- ============================================================
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  architect TEXT DEFAULT '',
  location TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  scale TEXT DEFAULT '',
  investment TEXT DEFAULT '',
  participants TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  awards TEXT DEFAULT '',
  case_type TEXT DEFAULT '',
  sustainable_goal TEXT DEFAULT '',
  demo_significance TEXT DEFAULT '',
  likes_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  ratings JSONB DEFAULT '{"total": 0, "count": 0, "average": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. 案例图片表
-- ============================================================
CREATE TABLE IF NOT EXISTS case_images (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  filename TEXT DEFAULT '',
  url TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  is_main BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- 3. 搜索服务提取的案例（全网搜索结果）
-- ============================================================
CREATE TABLE IF NOT EXISTS smart_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_name TEXT NOT NULL,
  location TEXT DEFAULT '',
  project_scale TEXT DEFAULT '',
  total_investment TEXT DEFAULT '',
  participants TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  award_status TEXT DEFAULT '',
  case_type TEXT DEFAULT '',
  sustainability_targets TEXT[] DEFAULT '{}',
  demonstration_value TEXT DEFAULT '',
  project_introduction TEXT DEFAULT '',
  construction_phase TEXT[] DEFAULT '{}',
  award_evaluation TEXT DEFAULT '',
  project_initiatives TEXT[] DEFAULT '{}',
  info_source TEXT DEFAULT '',
  case_images TEXT[] DEFAULT '{}',
  extraction_source TEXT DEFAULT '',
  data_quality TEXT DEFAULT '',
  source_url TEXT DEFAULT '',
  search_query TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. 索引
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cases_title ON cases USING gin(to_tsvector('simple', title));
CREATE INDEX IF NOT EXISTS idx_cases_description ON cases USING gin(to_tsvector('simple', description));
CREATE INDEX IF NOT EXISTS idx_cases_tags ON cases USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_cases_location ON cases USING gin(location);
CREATE INDEX IF NOT EXISTS idx_case_images_case_id ON case_images(case_id);
CREATE INDEX IF NOT EXISTS idx_smart_cases_query ON smart_cases(search_query);
CREATE INDEX IF NOT EXISTS idx_smart_cases_created ON smart_cases(created_at DESC);

-- ============================================================
-- 5. 更新时间自动触发器
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER smart_cases_updated_at
  BEFORE UPDATE ON smart_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. RLS（行级安全）- 暂时开放读，写需要认证
-- ============================================================
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_cases ENABLE ROW LEVEL SECURITY;

-- 公开读
CREATE POLICY "Public read cases" ON cases FOR SELECT USING (true);
CREATE POLICY "Public read case_images" ON case_images FOR SELECT USING (true);
CREATE POLICY "Public read smart_cases" ON smart_cases FOR SELECT USING (true);

-- Service role 可以写
CREATE POLICY "Service role write cases" ON cases FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write case_images" ON case_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write smart_cases" ON smart_cases FOR ALL USING (auth.role() = 'service_role');
