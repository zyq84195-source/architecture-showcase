/**
 * 导入 cases.json → Supabase 的脚本
 * 用法: node scripts/import-to-supabase.js
 * 需要先配置 .env.local 中的 Supabase 真实凭证
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 加载环境变量
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
  return env;
}

async function main() {
  const env = loadEnv();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    console.error('❌ Supabase URL not configured. Please set NEXT_PUBLIC_SUPABASE_URL in .env.local');
    process.exit(1);
  }
  if (!supabaseKey || supabaseKey.includes('placeholder')) {
    console.error('❌ Supabase Service Role Key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 读取 cases.json
  const casesPath = path.join(__dirname, '..', 'src', 'data', 'cases.json');
  console.log(`📂 Reading cases from: ${casesPath}`);
  const casesData = JSON.parse(fs.readFileSync(casesPath, 'utf-8'));
  console.log(`📊 Found ${casesData.length} cases`);

  // 导入案例
  let imported = 0;
  let errors = 0;

  for (const caseItem of casesData) {
    try {
      // 1. 插入案例主数据
      const { error: caseError } = await supabase
        .from('cases')
        .upsert({
          id: caseItem.id,
          title: caseItem.title,
          description: caseItem.description || '',
          architect: caseItem.architect || '',
          location: caseItem.location || [],
          tags: caseItem.tags || [],
          scale: caseItem.scale || '',
          investment: caseItem.investment || '',
          participants: caseItem.participants || '',
          start_date: caseItem.start_date || '',
          awards: caseItem.awards || '',
          case_type: caseItem.case_type || '',
          sustainable_goal: caseItem.sustainable_goal || '',
          demo_significance: caseItem.demo_significance || '',
          likes_count: caseItem.likes_count || 0,
          reviews_count: caseItem.reviews_count || 0,
          ratings: caseItem.ratings || { total: 0, count: 0, average: 0 },
          created_at: caseItem.created_at || new Date().toISOString(),
        });

      if (caseError) {
        console.error(`❌ Error importing case ${caseItem.id}:`, caseError.message);
        errors++;
        continue;
      }

      // 2. 插入图片
      if (caseItem.images && caseItem.images.length > 0) {
        const imageData = caseItem.images.map(img => ({
          id: img.id,
          case_id: caseItem.id,
          filename: img.filename || '',
          url: img.url || '',
          caption: img.caption || '',
          is_main: img.isMain || false,
          sort_order: img.order || 0,
        }));

        const { error: imgError } = await supabase
          .from('case_images')
          .upsert(imageData);

        if (imgError) {
          console.error(`⚠️ Error importing images for ${caseItem.id}:`, imgError.message);
        }
      }

      imported++;
      console.log(`✅ [${imported}/${casesData.length}] ${caseItem.id}: ${caseItem.title.substring(0, 40)}...`);
    } catch (err) {
      console.error(`❌ Error processing case ${caseItem.id}:`, err.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📦 Total: ${casesData.length}`);
  console.log('='.repeat(50));

  if (imported === casesData.length) {
    console.log('\n🎉 All cases imported successfully!');
  } else {
    console.log(`\n⚠️ ${errors} cases failed to import.`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
