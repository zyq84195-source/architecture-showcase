/**
 * 完整的案例数据导入脚本
 *
 * 用途：导入案例数据和图片到 Supabase 数据库
 * 使用方法：
 *   1. 设置环境变量：set SUPABASE_SERVICE_ROLE_KEY=your_key
 *   2. 运行脚本：node scripts/full-import.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://showcase-website.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ 错误：请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  console.error('使用方法：set SUPABASE_SERVICE_ROLE_KEY=your_key && node scripts/full-import.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 读取案例数据
const casesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/cases.json'), 'utf8')
);

console.log('='.repeat(60));
console.log('📋 案例数据导入工具');
console.log('='.repeat(60));
console.log(`📊 读取到 ${casesData.length} 个案例`);
console.log(`🔗 Supabase 项目: ${supabaseUrl}`);
console.log('='.repeat(60));
console.log();

// 提取分类和标签
function getCategoryFromTags(tags) {
  const tagMap = {
    '宜居': '住宅',
    '商业': '商业',
    '公共建筑': '公共建筑',
    '文化建筑': '文化建筑',
    '工业建筑': '工业建筑',
    '教育': '教育建筑',
    '医疗': '医疗建筑',
    '办公': '办公建筑'
  };

  for (const tag of tags) {
    if (tagMap[tag]) {
      return tagMap[tag];
    }
  }
  return '其他';
}

// 转换数据格式
function transformCaseData(caseData) {
  const tags = caseData.tags || [];
  const location = caseData.location && Array.isArray(caseData.location)
    ? caseData.location.join(', ')
    : (caseData._raw?.所在区位 || '');

  return {
    title: caseData.title,
    description: caseData.description || '',
    category: getCategoryFromTags(tags),
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
}

// 导入案例数据
async function importCases() {
  console.log('🚀 开始导入案例数据...\n');

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  for (let i = 0; i < casesData.length; i++) {
    const caseData = casesData[i];
    const caseNumber = String(i + 1).padStart(3, '0');

    console.log(`\n[${caseNumber}/${casesData.length}] ${caseData.title.substring(0, 60)}...`);

    try {
      const dbData = transformCaseData(caseData);

      // 检查是否已存在（根据标题）
      const { data: existing } = await supabase
        .from('cases')
        .select('id')
        .eq('title', dbData.title)
        .single();

      if (existing) {
        console.log(`   ⏭️  已存在，跳过导入`);
        results.skipped++;
        continue;
      }

      // 插入数据库
      const { data, error } = await supabase
        .from('cases')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`   ✅ 导入成功 (ID: ${data.id})`);
      console.log(`      分类: ${dbData.category}`);
      console.log(`      地点: ${dbData.location.substring(0, 30)}...`);
      console.log(`      面积: ${dbData.area ? dbData.area.toLocaleString() : 'N/A'}㎡`);
      console.log(`      年份: ${dbData.year || 'N/A'}`);
      console.log(`      图片: ${dbData.image_url ? '有' : '无'}`);

      results.success++;
      results.importedIds.push(data.id);

    } catch (error) {
      console.error(`   ❌ 导入失败: ${error.message}`);
      results.failed++;
      results.errors.push({
        title: caseData.title,
        error: error.message
      });
    }

    // 添加延迟
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return results;
}

// 导入图片
async function importImages(importedIds) {
  console.log('\n🖼️  开始导入图片...\n');

  if (!importedIds || importedIds.length === 0) {
    console.log('⚠️  没有需要导入图片的案例');
    return;
  }

  // 读取数据以获取图片信息
  const casesWithImages = casesData.map((caseData, index) => ({
    index,
    title: caseData.title,
    images: caseData.images || [],
    id: importedIds[index]
  })).filter(c => c.images.length > 0);

  console.log(`📊 需要导入 ${casesWithImages.length} 个案例的图片（共 ${casesWithImages.reduce((sum, c) => sum + c.images.length, 0)} 张）\n`);

  let success = 0;
  let failed = 0;

  for (const caseItem of casesWithImages) {
    console.log(`[${caseItem.index + 1}] ${caseItem.title.substring(0, 50)}...`);

    for (let imgIndex = 0; imgIndex < caseItem.images.length; imgIndex++) {
      const image = caseItem.images[imgIndex];
      const localPath = path.join(__dirname, '..', image.url);

      if (!fs.existsSync(localPath)) {
        console.log(`   [${imgIndex + 1}/${caseItem.images.length}] ⚠️  图片文件不存在: ${image.url}`);
        continue;
      }

      try {
        const ext = path.extname(localPath);
        const fileName = `${caseItem.index + 1}-${imgIndex + 1}${ext}`;

        const { data, error } = await supabase
          .storage
          .from('cases_images')
          .upload(`cases/${caseItem.id}/${fileName}`, fs.readFileSync(localPath), {
            contentType: getMimeType(localPath),
            upsert: false
          });

        if (error) {
          throw error;
        }

        // 更新数据库中的 image_url
        const { error: updateError } = await supabase
          .from('cases')
          .update({ image_url: data.path })
          .eq('id', caseItem.id);

        if (!updateError) {
          console.log(`   [${imgIndex + 1}/${caseItem.images.length}] ✅ 图片上传成功: ${fileName}`);
        }

      } catch (error) {
        console.error(`   [${imgIndex + 1}/${caseItem.images.length}] ❌ 上传失败: ${error.message}`);
        failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return { success, failed };
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// 主函数
async function main() {
  let importedIds = [];

  try {
    // 步骤 1: 导入案例数据
    const caseResults = await importCases();
    importedIds = caseResults.importedIds || [];

    // 步骤 2: 导入图片
    const imageResults = await importImages(importedIds);

    // 步骤 3: 显示总结
    console.log('\n' + '='.repeat(60));
    console.log('📊 导入总结');
    console.log('='.repeat(60));
    console.log(`✅ 成功导入: ${caseResults.success} 个案例`);
    console.log(`⏭️  跳过已存在: ${caseResults.skipped} 个案例`);
    console.log(`❌ 导入失败: ${caseResults.failed} 个案例`);
    if (imageResults) {
      console.log(`🖼️  图片上传: ${imageResults.success} 张成功, ${imageResults.failed} 张失败`);
    }
    console.log('='.repeat(60));

    if (caseResults.failed > 0) {
      console.log('\n⚠️  部分案例导入失败，请查看上面的错误信息');
      console.log('\n失败的案例:');
      caseResults.errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.title}`);
        console.log(`     错误: ${err.error}`);
      });
    }

  } catch (error) {
    console.error('\n💥 导入过程中发生严重错误:', error);
    process.exit(1);
  }
}

// 执行
main();
