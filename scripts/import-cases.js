/**
 * 案例数据导入脚本
 *
 * 用途：将 cases.json 中的案例数据导入到 Supabase 数据库
 * 使用方法：node scripts/import-cases.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 配置（从环境变量读取）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://showcase-website.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ 错误：请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  console.error('使用方法：set SUPABASE_SERVICE_ROLE_KEY=your_key && node scripts/import-cases.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 读取案例数据
const casesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/cases.json'), 'utf8')
);

console.log(`📊 共读取到 ${casesData.length} 个案例\n`);

// 导入数据
async function importCases() {
  console.log('🚀 开始导入案例数据...\n');

  for (let i = 0; i < casesData.length; i++) {
    const caseData = casesData[i];
    const caseNumber = String(i + 1).padStart(3, '0');

    console.log(`\n📦 处理案例 [${caseNumber}/${casesData.length}]: ${caseData.title.substring(0, 50)}...`);

    try {
      // 提取关键信息
      const tags = caseData.tags || [];
      const location = caseData.location && Array.isArray(caseData.location)
        ? caseData.location.join(', ')
        : (caseData._raw?.所在区位 || '');

      // 转换数据格式以匹配数据库表结构
      const dbData = {
        title: caseData.title,
        description: caseData.description || '',
        category: tags.includes('宜居') ? '住宅'
          : tags.includes('商业') ? '商业'
          : tags.includes('公共建筑') ? '公共建筑'
          : tags.includes('文化建筑') ? '文化建筑'
          : tags.includes('工业建筑') ? '工业建筑'
          : '其他',
        architect: caseData.participants || caseData._raw?.参与主体 || '',
        location: location,
        year: caseData._raw?.起止时间
          ? parseInt(caseData._raw.起止时间.split('年')[0]) || null
          : null,
        area: caseData.scale
          ? parseFloat(caseData.scale.replace(/[^\d.]/g, '')) || null
          : null,
        height: null,
        style: tags.includes('现代简约') ? '现代简约'
          : tags.includes('传统') ? '传统'
          : tags.includes('科技') ? '科技'
          : tags.includes('生态') ? '生态'
          : tags.includes('绿色') ? '绿色'
          : '其他',
        image_url: caseData.images && caseData.images.length > 0
          ? caseData.images[0].url
          : null,
        is_published: true
      };

      console.log(`   ├─ 分类: ${dbData.category}`);
      console.log(`   ├─ 地点: ${dbData.location.substring(0, 30)}...`);
      console.log(`   ├─ 面积: ${dbData.area ? dbData.area.toLocaleString() : 'N/A'} 平方米`);
      console.log(`   ├─ 年份: ${dbData.year || 'N/A'}`);

      // 插入到数据库
      const { data, error } = await supabase
        .from('cases')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error(`   ❌ 插入失败: ${error.message}`);
        console.error(`   错误详情:`, error);
        continue;
      }

      console.log(`   ✅ 成功导入，ID: ${data.id}`);

      // 处理图片上传（可选）
      if (caseData.images && caseData.images.length > 0) {
        console.log(`   ├─ 图片数: ${caseData.images.length}`);
        // 可以在这里添加图片上传逻辑
      }

    } catch (error) {
      console.error(`   ❌ 处理失败: ${error.message}`);
    }

    // 添加延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✨ 导入完成！');
  console.log('\n📊 统计信息:');
  console.log(`   - 总案例数: ${casesData.length}`);
}

// 执行导入
importCases().catch(error => {
  console.error('💥 导入过程中发生错误:', error);
  process.exit(1);
});
