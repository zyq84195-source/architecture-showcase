const XLSX = require('xlsx');
const fs = require('fs');

// CSV文件路径
const CSV_PATH = 'C:/Users/zyq15/Desktop/案例(1).csv';
// 图片文件夹路径
const IMAGES_FOLDER = 'C:/Users/zyq15/Desktop/案例图片';

console.log('📊 开始导入案例数据到数据库...');
console.log('CSV路径:', CSV_PATH);
console.log('图片文件夹:', IMAGES_FOLDER);

try {
  // 检查CSV文件是否存在
  if (!fs.existsSync(CSV_PATH)) {
    console.error('❌ CSV文件不存在:', CSV_PATH);
    console.log('📝 请确认文件路径是否正确');
    console.log('💡 提示：文件路径可能需要调整为 C:/Users/zyq15/Desktop/案例.csv');
    process.exit(1);
  }

  // 读取CSV文件
  console.log('📖 读取CSV文件...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');

  console.log('✅ CSV文件读取完成');
  console.log(`📊 总行数: ${lines.length}`);

  // 解析CSV数据
  const data = [];
  const headers = lines[0].split(',').map(h => h.trim());

  console.log('📋 CSV表头:');
  console.log(`  列数: ${headers.length}`);
  headers.forEach((h, index) => {
    console.log(`  ${index + 1}. ${h}`);
  });

  // 从第2行开始解析数据
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());

    // 提取案例编号
    const caseId = values[0] || '';

    // 创建案例对象
    const caseData = {
      id: `csv_${caseId}`,
      title: values[1] || '',
      description: values[2] || '',
      architect: values[3] || '',
      location: values[4] || '',
      tags: values[5] ? values[5].split(';').map(tag => tag.trim()) : [],
      likes_count: 0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
      images: [], // 图片稍后添加
    };

    // 验证必填字段（标题）
    if (!caseData.title) {
      console.warn(`⚠️  第 ${i} 行缺少标题，已跳过`);
      continue;
    }

    data.push(caseData);

    // 每100行输出一次进度
    if (i % 100 === 0) {
      console.log(`📊 已导入 ${i} 行数据... (${Math.floor((i - 1) / lines.length * 100)}%)`);
    }
  }

  console.log('✅ 数据解析完成！');
  console.log(`📊 总共解析 ${data.length} 条案例数据`);

  // 输出数据摘要
  console.log('');
  console.log('📋 数据摘要:');
  console.log(`  - 总案例数: ${data.length}`);
  console.log(`  - 有标题的案例: ${data.filter(c => c.title).length}`);
  console.log(`  - 标题为空的案例: ${data.filter(c => !c.title).length}`);
  console.log('');

  console.log('💡 下一步:');
  console.log('  1. 写入数据到 data/cases.json 文件');
  console.log('  2. 提交到 GitHub');
  console.log('  3. 推送到 Vercel 自动部署');
  console.log('');
  console.log('⏱️ 注意: 图片文件尚未关联');
  console.log('  - CSV 数据中不包含图片文件名');
  console.log('  - 图片数据将在后续手动添加');

} catch (error) {
  console.error('❌ 导入失败:', error.message);
  process.exit(1);
}
