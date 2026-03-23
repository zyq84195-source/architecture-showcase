/**
 * Supabase 连接测试脚本
 *
 * 用途：测试 Supabase 连接和数据库状态
 * 使用方法：node check-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');

// 配置（请修改为你的实际配置）
const supabaseUrl = 'https://showcase-website.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_key_here';

console.log('='.repeat(60));
console.log('🔍 Supabase 连接测试工具');
console.log('='.repeat(60));
console.log();

console.log('配置信息：');
console.log(`  URL: ${supabaseUrl}`);
console.log(`  Key: ${supabaseKey.substring(0, 20)}...`);
console.log();

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 测试 1: 基本连接
async function testBasicConnection() {
  console.log('测试 1: 基本连接...');
  console.log('-'.repeat(60));

  try {
    const { data, error } = await supabase
      .from('cases')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ 失败');
      console.log('错误代码：', error.code);
      console.log('错误信息：', error.message);
      console.log('错误详情：', JSON.stringify(error.details, null, 2));
      console.log('建议：');
      console.log('  1. 确认 Supabase 项目已启动');
      console.log('  2. 确认数据库表 "cases" 已创建');
      console.log('  3. 检查网络连接');
      return false;
    }

    console.log('✅ 成功');
    console.log('返回数据：', data);
    return true;

  } catch (error) {
    console.log('❌ 异常：', error.message);
    console.log('错误详情：', error);
    console.log();
    console.log('常见原因：');
    console.log('  1. Supabase 项目未启动');
    console.log('  2. 项目 URL 配置错误');
    console.log('  3. 网络连接问题');
    console.log('  4. 网络防火墙或代理阻止');
    console.log('  5. API Key 错误');
    return false;
  }
}

// 测试 2: 创建表（如果不存在）
async function createTableIfNotExists() {
  console.log();
  console.log('测试 2: 检查并创建数据库表...');
  console.log('-'.repeat(60));

  const createTableSQL = `
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

    CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
    CREATE INDEX IF NOT EXISTS idx_cases_is_published ON cases(is_published);
  `;

  try {
    // 注意：需要使用 SQL Editor 执行这个 SQL
    console.log('⚠️  无法通过 API 创建表');
    console.log();
    console.log('请按以下步骤手动创建表：');
    console.log();
    console.log('1. 打开 Supabase Dashboard');
    console.log('2. 进入项目 showcase-website');
    console.log('3. 点击左侧菜单 "SQL Editor"');
    console.log('4. 点击 "New Query"');
    console.log('5. 粘贴以下 SQL 语句：');
    console.log();
    console.log(createTableSQL.replace(/\n/g, '\n    '));
    console.log();
    console.log('6. 点击 "Run" 执行');
    console.log();

    return false;

  } catch (error) {
    console.log('❌ 错误：', error.message);
    return false;
  }
}

// 测试 3: 测试不同场景
async function testScenarios() {
  console.log();
  console.log('测试 3: 不同连接场景...');
  console.log('-'.repeat(60));

  console.log();
  console.log('场景 1: 使用 service_role key');
  try {
    const { error } = await supabase
      .from('cases')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ 失败：', error.message);
    } else {
      console.log('✅ 成功');
    }
  } catch (error) {
    console.log('❌ 异常：', error.message);
  }

  console.log();
  console.log('场景 2: 检查网络连接...');
  try {
    const response = await fetch(supabaseUrl);
    console.log(`✅ HTTP ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log('❌ 无法连接到 Supabase URL');
    console.log('错误：', error.message);
  }
}

// 主函数
async function main() {
  console.log();

  // 检查 key
  if (supabaseKey === 'your_key_here' || supabaseKey === '') {
    console.log('❌ 错误：未配置 Supabase API Key');
    console.log();
    console.log('设置方法：');
    console.log('  set SUPABASE_SERVICE_ROLE_KEY=your_actual_key');
    console.log();
    process.exit(1);
  }

  // 运行测试
  const connected = await testBasicConnection();
  await createTableIfNotExists();
  await testScenarios();

  console.log();
  console.log('='.repeat(60));
  console.log('总结');
  console.log('='.repeat(60));
  console.log();

  if (!connected) {
    console.log('⚠️  连接失败，请检查：');
    console.log();
    console.log('1️⃣  Supabase 项目状态：');
    console.log('   访问 https://supabase.com/dashboard');
    console.log('   确认 showcase-website 项目显示 "Active" 或 "Running"');
    console.log();
    console.log('2️⃣  项目 URL：');
    console.log('   Settings -^> API');
    console.log('   复制 "Project URL" 并确认脚本中使用的是正确的 URL');
    console.log();
    console.log('3️⃣  API Key：');
    console.log('   Settings -^> API');
    console.log('   确认使用的是 "service_role" key（不是 anon key）');
    console.log();
    console.log('4️⃣  网络连接：');
    console.log('   运行: curl -I https://showcase-website.supabase.co');
    console.log('   确保能连接到 Supabase');
    console.log();
    console.log('5️⃣  数据库表：');
    console.log('   手动创建 cases 表（参考上面的 SQL 语句）');
    console.log();
  }

  console.log('按回车键退出...');
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.once('data', () => process.exit(connected ? 0 : 1));
}

main().catch(err => {
  console.error('💥 测试失败：', err);
  process.exit(1);
});
