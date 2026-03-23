/**
 * 简化版案例数据导入脚本
 *
 * 用途：快速导入案例数据到 Supabase
 * 使用方法：node simple-import.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 配置
const supabaseUrl = 'https://showcase-website.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key_here';

if (supabaseKey === 'your_service_role_key_here') {
  console.error('❌ 错误：请设置环境变量 SUPABASE_SERVICE_ROLE_KEY');
  console.error('使用方法：');
  console.error('  set SUPABASE_SERVICE_ROLE_KEY=your_actual_key');
  console.error('  node simple-import.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('='.repeat(60));
console.log('📋 案例数据导入');
console.log('='.repeat(60));
console.log(`项目：showcase-website`);
console.log('='.repeat(60));
console.log();

// 读取数据
const casesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src/data/cases.json'), 'utf8')
);

console.log(`📊 读取到 ${casesData.length} 个案例\n`);

// 转换数据
function transformData(item) {
  const tags = item.tags || [];
  const location = Array.isArray(item.location) ? item.location.join(', ') : item._raw?.所在区位 || '';

  return {
    title: item.title,
    description: item.description || '',
    category: tags.includes('宜居') ? '住宅'
      : tags.includes('商业') ? '商业'
      : tags.includes('公共建筑') ? '公共建筑'
      : tags.includes('文化建筑') ? '文化建筑'
      : tags.includes('工业建筑') ? '工业建筑'
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

  console.log('\n' + '='.repeat(60));
  console.log('📊 导入统计');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${success}`);
  console.log(`⏭️  跳过: ${skipped}`);
  console.log(`❌ 失败: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  部分导入失败，请检查错误信息');
    process.exit(1);
  }

  console.log('\n✨ 所有案例导入成功！');
}

importData().catch(err => {
  console.error('\n💥 导入失败:', err);
  process.exit(1);
});
