const XLSX = require('xlsx');
const fs = require('fs');

// 案例信息文件路径（主数据源）
const CASES_CSV_PATH = 'C:/Users/zyq15/Desktop/案例.csv';
// 图片信息文件路径（图片文件名映射）
const IMAGES_CSV_PATH = 'C:/Users/zyq15/Desktop/案例图片\name.csv';

console.log('📊 开始读取案例数据...');
console.log('案例信息文件:', CASES_CSV_PATH);
console.log('图片信息文件:', IMAGES_CSV_PATH);

try {
  // 读取案例信息
  if (!fs.existsSync(CASES_CSV_PATH)) {
    console.error('❌ 案例信息文件不存在:', CASES_CSV_PATH);
    process.exit(1);
  }

  const casesContent = fs.readFileSync(CASES_CSV_PATH, 'utf-8');
  const casesLines = casesContent.split(/\r?\n/).filter(line => line.trim() !== '');
  console.log('✅ 案例信息文件读取完成');
  console.log(`📊 总行数: ${casesLines.length}`);

  // 读取图片信息
  let imagesMap = {};
  if (fs.existsSync(IMAGES_CSV_PATH)) {
    const imagesContent = fs.readFileSync(IMAGES_CSV_PATH, 'utf-8');
    const imagesLines = imagesContent.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // 解析图片映射（案例编号 → 图片文件名列表）
    for (let i = 1; i < imagesLines.length; i++) {
      const line = imagesLines[i];
      const parts = line.split(',');
      if (parts.length >= 2) {
        const caseId = parts[0].trim();
        const imageFile = parts[1].trim();
        
        if (!imagesMap[caseId]) {
          imagesMap[caseId] = [];
        }
        imagesMap[caseId].push(imageFile);
      }
    }
    console.log(`✅ 图片信息文件读取完成`);
    console.log(`📊 映射的案例数: ${Object.keys(imagesMap).length}`);
  } else {
    console.warn('⚠️ 图片信息文件不存在，将不包含图片数据');
  }

  // 解析案例数据（从第2行开始，因为第1行可能是表头）
  const data = [];
  let headers = [];
  
  if (casesLines.length > 0) {
    headers = casesLines[0].split(',').map(h => h.trim());
  }

  console.log('📋 案例信息表头:');
  console.log('表头列数:', headers.length);
  console.log('');
  console.log('📊 开始解析案例数据...');

  for (let i = 1; i < casesLines.length; i++) {
    const line = casesLines[i];
    const values = line.split(',').map(v => v.trim());

    // 跳过空行
    if (values.length < 2) continue;

    // 创建案例对象
    const caseData = {
      id: `case_${String(i).padStart(3, '0')}`,
      title: values[0] || '',
      description: values[1] || '',
      architect: values[2] || '',
      location: values[3] || '',
      tags: values[4] ? values[4].split(';').map(tag => tag.trim()) : [],
      project_scale: values[5] || '',
      total_investment: values[6] || '',
      start_date: values[7] || '',
      award_status: values[8] || '',
      case_type: values[9] || '',
      sustainable_goals: values[10] || '',
      significance: values[11] || '',
      project_introduction: values[12] || '',
      construction_stage: values[13] || '',
      project_award: values[14] || '',
      project_action: values[15] || '',
      information_source: values[16] || '',
      likes_count: 0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
      images: imagesMap[`case_${String(i).padStart(3, '0')}`] || [],
    };

    // 验证必填字段（标题）
    if (!caseData.title) {
      console.warn(`⚠️ 第 ${i} 行缺少标题，已跳过`);
      continue;
    }

    data.push(caseData);

    // 每100行输出一次进度
    if (i % 100 === 0) {
      console.log(`📊 已解析 ${i} 行数据...`);
    }
  }

  console.log('✅ 数据解析完成！');
  console.log(`📊 总共解析 ${data.length} 条案例数据`);
  console.log('');
  console.log('📋 数据摘要:');
  console.log(`  - 总案例数: ${data.length}`);
  console.log(`  - 有标题的案例: ${data.filter(c => c.title).length}`);
  console.log(`  - 有图片映射的案例: ${Object.keys(imagesMap).length}`);
  console.log(`  - 平均图片数/案例: ${Object.keys(imagesMap).length > 0 ? Math.ceil(data.length / Object.keys(imagesMap).length) : 0}`);
  console.log('');
  console.log('💾 写入数据到 data/cases.json...');
  fs.writeFileSync('data/cases.json', JSON.stringify(data, null, 2), 'utf-8');
  console.log('✅ 数据写入完成！');

} catch (error) {
  console.error('❌ 读取文件失败:', error.message);
  process.exit(1);
}
