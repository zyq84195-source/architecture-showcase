/**
 * 调试版导入脚本
 *
 * 用途：诊断导入问题
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://showcase-website.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('='.repeat(60));
console.log('🔍 导入诊断工具');
console.log('='.repeat(60));
console.log();

// 检查环境变量
console.log('1️⃣  检查环境变量');
console.log('-'.repeat(60));

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY 未设置！');
  console.error();
  console.log('📝 解决方法：');
  console.log('   在命令行中运行：');
  console.log('     set SUPABASE_SERVICE_ROLE_KEY=your_actual_key');
  console.log('   或运行 run-import.bat，它会提示你输入');
  console.log();
  process.exit(1);
}

console.log('✅ SUPABASE_SERVICE_ROLE_KEY: 已设置');
console.log('✅ 项目 URL:', supabaseUrl);
console.log();

// 创建 Supabase 客户端
console.log('2️⃣  连接 Supabase');
console.log('-'.repeat(60));

try {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 测试连接
  const { data, error } = await supabase
    .from('cases')
    .select('count', { count: 'exact', head: true });

  if (error) {
    if (error.message.includes('does not exist')) {
      console.error('❌ 数据库表 "cases" 不存在！');
      console.error();
      console.log('📝 解决方法：');
      console.log('   1. 登录 Supabase Dashboard');
      console.log('   2. 进入 SQL Editor');
      console.log('   3. 执行 migrations/001_create_cases_table.sql 中的 SQL');
      console.log();
    } else {
      console.error('❌ 连接失败:', error.message);
      console.error();
      console.log('📝 解决方法：');
      console.log('   1. 检查项目 URL 是否正确');
      console.log('   2. 检查 Service Role Key 是否正确');
      console.log('   3. 检查 Supabase 项目是否已启动');
      console.log();
    }
    process.exit(1);
  }

  console.log('✅ 数据库连接成功！');
  console.log();

  // 检查是否有数据
  const { count } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true });

  console.log('3️⃣  检查数据');
  console.log('-'.repeat(60));

  if (count === 0) {
    console.log('ℹ️  数据库为空，可以开始导入');
  } else {
    console.log(`ℹ️  数据库已有 ${count} 条记录`);
    console.log();
    console.log('📝 如需重新导入，请先清空数据库：');
    console.log('   在 Supabase SQL Editor 中运行：');
    console.log('     TRUNCATE TABLE cases CASCADE;');
    console.log();
  }

  console.log();

  // 读取数据文件
  console.log('4️⃣  读取数据文件');
  console.log('-'.repeat(60));

  const casesPath = path.join(__dirname, 'src/data/cases.json');
  if (!fs.existsSync(casesPath)) {
    console.error('❌ 数据文件不存在:', casesPath);
    process.exit(1);
  }

  const casesData = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
  console.log(`✅ 成功读取 ${casesData.length} 个案例`);
  console.log();

  // 测试插入第一条数据
  console.log('5️⃣  测试插入第一条数据');
  console.log('-'.repeat(60));

  const testItem = casesData[0];
  const tags = testItem.tags || [];
  const location = Array.isArray(testItem.location) ? testItem.location.join(', ') : testItem._raw?.所在区位 || '';

  const testDbData = {
    title: testItem.title,
    description: testItem.description || '',
    category: tags.includes('宜居') ? '住宅'
      : tags.includes('商业') ? '商业'
      : tags.includes('公共建筑') ? '公共建筑'
      : tags.includes('文化建筑') ? '文化建筑'
      : tags.includes('工业建筑') ? '工业建筑'
      : '其他',
    architect: testItem.participants || testItem._raw?.参与主体 || '',
    location: location,
    year: testItem._raw?.起止时间 ? parseInt(testItem._raw.起止时间.split('年')[0]) : null,
    area: testItem.scale ? parseFloat(testItem.scale.replace(/[^\d.]/g, '')) : null,
    height: null,
    style: '其他',
    image_url: testItem.images && testItem.images.length > 0 ? testItem.images[0].url : null,
    is_published: true
  };

  console.log('测试数据：');
  console.log(`  标题: ${testDbData.title.substring(0, 50)}...`);
  console.log(`  分类: ${testDbData.category}`);
  console.log(`  地点: ${testDbData.location.substring(0, 30)}...`);
  console.log(`  面积: ${testDbData.area ? testDbData.area.toLocaleString() : 'N/A'}㎡`);
  console.log();

  const { error: insertError } = await supabase
    .from('cases')
    .insert([testDbData]);

  if (insertError) {
    console.error('❌ 插入测试数据失败:', insertError.message);
    console.error();
    console.log('📝 解决方法：');
    console.log('   1. 检查表结构是否正确');
    console.log('   2. 检查字段类型是否匹配');
    console.log('   3. 检查 RLS 策略是否正确');
    console.log();
    process.exit(1);
  }

  console.log('✅ 插入测试数据成功！');
  console.log();

  // 清理测试数据
  const { error: deleteError } = await supabase
    .from('cases')
    .delete()
    .eq('title', testDbData.title);

  if (deleteError) {
    console.warn('⚠️  无法清理测试数据，请手动删除');
  } else {
    console.log('✅ 测试数据已清理');
  }

  console.log();

  console.log('='.repeat(60));
  console.log('✅ 诊断完成！');
  console.log('='.repeat(60));
  console.log();
  console.log('📝 现在可以运行正常导入脚本了：');
  console.log('   node simple-import.js');
  console.log();

} catch (error) {
  console.error('❌ 发生错误:', error.message);
  console.error();
  process.exit(1);
}
