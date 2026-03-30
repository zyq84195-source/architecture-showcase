import { supabaseAdmin } from '../src/lib/supabase';

// 读取 cases.json 文件
const fs = require('fs');
const path = require('path');

const casesData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../src/data/cases.json'),
    'utf-8'
  )
);

// 转换数据格式
const convertedCases = casesData.map((caseItem: any) => {
  const mainImage = caseItem.images?.find((img: any) => img.isMain) || caseItem.images?.[0];

  return {
    id: caseItem.id,
    title: caseItem.title,
    description: caseItem.description,
    category: caseItem.case_type?.split('；')[0] || '',
    architect: caseItem.architect?.split('\n')[0] || '',
    location: caseItem.location?.[1] || '',
    year: new Date(caseItem.created_at).getFullYear(),
    area: caseItem.scale?.match(/(\d+(\.\d+)?)/)?.[0] || '',
    height: null,
    style: caseItem.tags?.join(', ') || '',
    image_url: mainImage?.url || '',
    is_published: true
  };
});

// 导入数据到数据库
async function importCases() {
  if (!supabaseAdmin) {
    console.error('❌ Supabase Admin 未配置');
    console.error('请在 .env.local 中设置以下环境变量：');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log(`开始导入 ${convertedCases.length} 个案例...\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < convertedCases.length; i++) {
    const caseItem = convertedCases[i];

    try {
      const { data, error } = await supabaseAdmin
        .from('cases')
        .insert(caseItem)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ [${i + 1}/${convertedCases.length}] 成功导入: ${caseItem.title}`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ [${i + 1}/${convertedCases.length}] 导入失败: ${caseItem.title}`);
      console.error(`   错误: ${error.message}`);
      errors.push(`${caseItem.title}: ${error.message}`);
      errorCount++;
    }

    // 添加延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('导入完成！');
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${errorCount}`);
  console.log(`📊 总计: ${convertedCases.length}`);
  console.log('='.repeat(50));

  if (errors.length > 0) {
    console.log('\n错误详情:');
    errors.forEach((err, idx) => {
      console.log(`\n${idx + 1}. ${err}`);
    });
  }
}

// 运行导入
importCases().catch(console.error);
