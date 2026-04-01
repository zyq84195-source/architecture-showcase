const fs = require('fs');
const path = require('path');

// CSV文件路径
const CSV_PATH = 'C:/Users/zyq15/Desktop/案例.csv';
// 图片文件夹路径
const IMAGES_FOLDER = 'C:/Users/zyq15/Desktop/案例图片';

console.log('📊 开始读取CSV文件...');
console.log('CSV路径:', CSV_PATH);
console.log('图片文件夹:', IMAGES_FOLDER);

try {
  // 检查CSV文件是否存在
  if (!fs.existsSync(CSV_PATH)) {
    console.error('❌ CSV文件不存在:', CSV_PATH);
    process.exit(1);
  }

  console.log('✅ CSV文件存在');

  // 读取CSV文件（使用UTF-8编码）
  console.log('📖 读取CSV文件...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');

  console.log('✅ 文件读取完成');
  console.log(`📊 总行数: ${lines.length}`);

  // 解析CSV数据
  const data = [];
  let headers = [];

  // 读取表头（第一行）
  if (lines.length > 0) {
    headers = lines[0].split(',').map(h => h.trim());
    console.log('📋 CSV表头:');
    console.log('  列数:', headers.length);
    headers.forEach((h, index) => {
      console.log(`  ${index + 1}. ${h}`);
    });
  }

  // 从第二行开始解析数据
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());

    // 根据列数创建案例对象
    const caseData = {
      id: `csv_${String(i).padStart(3, '0')}`,
      title: values[0] || '',
      description: values[1] || '',
      architect: values[2] || '',
      location: values[3] || '',
      tags: values[4] ? values[4].split(';').map(tag => tag.trim()) : [],
      likes_count: 0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
    };

    // 验证必填字段（标题）
    if (!caseData.title) {
      console.warn(`⚠️  第 ${i} 行缺少标题，已跳过`);
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
  console.log('📋 数据示例（前3条）：');
  data.slice(0, 3).forEach((item, index) => {
    console.log(`\n案例 ${index + 1}:`);
    console.log(`  ID: ${item.id}`);
    console.log(`  标题: ${item.title}`);
    console.log(`  描述: ${item.description.substring(0, 50)}...`);
    console.log(`  所在区位: ${item.location}`);
    console.log(`  参与主体: ${item.architect}`);
    console.log(`  标签: ${item.tags.join(', ')}`);
    console.log('');
  });

} catch (error) {
  console.error('❌ 读取CSV文件失败:', error.message);
  process.exit(1);
}
