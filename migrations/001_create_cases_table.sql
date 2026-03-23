-- 创建 cases 表
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  architect VARCHAR(100),
  location VARCHAR(255),
  year INTEGER,
  area FLOAT,
  height FLOAT,
  style VARCHAR(100),
  image_url VARCHAR(500),
  is_published BOOLEAN DEFAULT true
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX IF NOT EXISTS idx_cases_is_published ON cases(is_published);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);

-- 创建存储桶（用于图片上传）
CREATE STORAGE IF NOT EXISTS cases_images;

-- 启用存储桶的权限
GRANT USAGE ON STORAGE cases_images TO authenticated;
GRANT READ ON STORAGE cases_images TO authenticated;
GRANT INSERT ON STORAGE cases_images TO authenticated;
GRANT UPDATE ON STORAGE cases_images TO authenticated;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
