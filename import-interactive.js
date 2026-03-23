/**
 * 交互式导入脚本
 *
 * 用途：交互式输入 Supabase 配置信息
 * 使用方法：node import-interactive.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 读取案例数据
const casesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src/data/cases.json'), 'utf8')
);

console.log('='.repeat(60));
console.log('📋 案例数据导入工具（交互式）');
console.log('='.repeat(60));
console.log();

// 交互式获取配置
const supabaseUrl = 'https://showcase-website.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseKey) {
  console.error('❌ 错误：请设置环境变量 SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('使用方法：');
  console.error('  方法 1: set SUPABASE_SERVICE_ROLE_KEY=your_key && node import-interactive.js');
  console.error('  方法 2: export SUPABASE_SERVICE_ROLE_KEY=your_key && node import-interactive.js');
  console.error('  方法 3: 在代码中直接修改 supabaseKey 变量');
  console.error('');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('='.repeat(60));
console.log('项目配置：');
console.log('='.repeat(60));
console.log(`项目 URL: ${supabaseUrl}`);
console.log(`项目名称: showcase-website`);
console.log(`案例数量: ${casesData.length}`);
console.log('='.repeat(60));
console.log();

// 转换数据
function transformData(item) {
  const tags = item.tags || [];
  const location = Array.isArray(item.location) ? item.location.join(', ') : item._raw?.所在区位 || '';

  return {
    title: item.title,
    description: item.description || '',
    category: tags.includes('宜居') ? '住宅'
      : tags.includes('商业') ? '商业'
      : tags.includes('公共建筑') ? 'public'
      : tags.includes('文化建筑') ? 'cultural'
      : tags.includes('工业建筑') ? 'industrial'
      : '其他',
    architect: item.participants || item._raw?.参与主体 || '',
    location: location,
    year: item._raw?.起止时间 ? parseInt(item._raw.起止时间.split('年')[0]) : null,
    area: item.scale ? parseFloat(item.scale.replace(/[^\d.]/g, '')) : null,
    height: null,
    style: '其他',
    image_url: item.images && item.images.length > 0 ? item.images[0].url : null,
    is_published: true
  };
}

// 测试连接
async function testConnection() {
  console.log('='.repeat(60));
  console.log('测试 Supabase 连接...');
  console.log('='.repeat(60));
  console.log();

  try {
    const { data, error } = await supabase
      .from('cases')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ 错误：数据库表 "cases" 不存在');
        console.log();
        console.log('解决方法：');
        console.log('  1. 在 Supabase Dashboard 中打开 SQL Editor');
        console.log('  2. 运行 migrations/001_create_cases_table.sql 中的 SQL 语句');
        console.log('  3. 或者手动创建 cases 表');
        console.log();
      } else {
        console.log('❌ 连接失败：', error.message);
        console.log('错误代码：', error.code);
        console.log();
        console.log('可能的原因：');
        console.log('  1. Supabase 项目未启动');
        console.log('  2. 项目 URL 配置错误');
        console.log('  3. 网络连接问题');
        console.log('  4. 网络防火墙或代理阻止');
        console.log();
      }
      return false;
    }

    console.log('✅ 连接成功！');
    console.log();
    return true;

  } catch (error) {
    console.log('❌ 连接失败：', error.message);
    console.log();
    console.log('错误详情：', error);
    console.log();
    console.log('可能的原因：');
    console.log('  1. Supabase 项目未启动');
    console.log('  2. 项目 URL 配置错误');
    console.log('  3. 网络连接问题');
    console.log('  4. 网络防火墙或代理阻止');
    console.log();
    return false;
  }
}

// 导入数据
async function importData() {
  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < casesData.length; i++) {
    const item = casesData[i];
    const caseNum = String(i + 1).padStart(3, '0');

    console.log(`[${caseNum}/${casesData.length}] ${item.title.substring(0, 50)}...`);

    try {
      const dbData = transformData(item);

      // 检查是否已存在
      const { data: existing } = await supabase
        .from('cases')
        .select('id')
        .eq('title', dbData.title)
        .single();

      if (existing) {
        console.log('   ⏭️  已存在，跳过');
        skipped++;
        continue;
      }

      // 插入数据库
      const { error } = await supabase
        .from('cases')
        .insert([dbData]);

      if (error) throw error;

      console.log('   ✅ 导入成功');
      console.log(`      分类: ${dbData.category}`);
      console.log(`      面积: ${dbData.area ? dbData.area.toLocaleString() : 'N/A'}㎡`);
      console.log(`      图片: ${dbData.image_url ? '有' : '无'}`);

      success++;

    } catch (error) {
      console.error(`   ❌ 失败: ${error.message}`);
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return { success, skipped, failed };
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('案例数据导入工具');
  console.log('='.repeat(60));
  console.log();

  // 测试连接
  const connected = await testConnection();
  if (!connected) {
    console.log();
    console.log('按任意键退出...');
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', () => process.exit(1));
    return;
  }

  // 导入数据
  console.log();
  console.log('开始导入数据...');
  console.log('='.repeat(60));
  console.log();

  const results = await importData();

  console.log();
  console.log('='.repeat(60));
  console.log('📊 导入统计');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${results.success}`);
  console.log(`⏭️  跳过: ${results.skipped}`);
  console.log(`❌ 失败: ${results.failed}`);
  console.log('='.repeat(60));

  if (results.failed > 0) {
    console.log();
    console.log('⚠️  部分导入失败，请查看上面的错误信息');
    process.exit(1);
  }

  console.log();
  console.log('✨ 所有案例导入成功！');
  console.log();
  console.log('后续步骤：');
  console.log('  1. 访问 http://localhost:3000/admin');
  console.log('  2. 使用管理员账号登录');
  console.log('  3. 查看案例列表');
}

main().catch(err => {
  console.error('\n💥 导入失败:', err);
  process.exit(1);
});
