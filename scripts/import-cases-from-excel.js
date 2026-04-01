const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Excel文件路径
const EXCEL_PATH = 'C:/Users/zyq15/Desktop/案例.xlsx';
// 案例图片文件夹路径
const IMAGES_FOLDER = 'C:/Users/zyq15/Desktop/案例图片';

console.log('📊 开始读取Excel文件...');
console.log('Excel路径:', EXCEL_PATH);
console.log('图片文件夹:', IMAGES_FOLDER);

try {
  // 检查Excel文件是否存在
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('❌ Excel文件不存在:', EXCEL_PATH);
    process.exit(1);
  }

  // 检查图片文件夹是否存在
  if (!fs.existsSync(IMAGES_FOLDER)) {
    console.warn('⚠️ 图片文件夹不存在:', IMAGES_FOLDER);
    console.log('提示: 请先创建图片文件夹');
  }

  // 读取Excel文件
  console.log('📖 读取Excel文件...');
  const workbook = XLSX.readFile(EXCEL_PATH);

  if (!workbook.Sheets || workbook.Sheets.length === 0) {
    console.error('❌ Excel文件为空或没有工作表');
    process.exit(1);
  }

  const worksheet = workbook.Sheets[0];
  console.log('✅ 工作表名称:', worksheet.name);
  console.log('📊 数据行数:', worksheet.rowCount);

  // 解析数据
  const data = [];
  const headerRow = worksheet.getRow(1);

  console.log('📋 表头信息:');
  console.log('  表头数组长度:', headerRow.length);
  console.log('  表头内容:', headerRow);

  // 读取数据（从第2行开始）
  for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    if (!row || row.every(cell => cell === null || cell === undefined)) {
      continue; // 跳过空行
    }

    // 尝试解析案例数据
    const caseData = {
      id: `excel_${String(rowIndex).padStart(3, '0')}`,
      title: row.getCell(0)?.value || '',
      description: row.getCell(1)?.value || '',
      architect: row.getCell(2)?.value || '',
      location: row.getCell(3)?.value || '',
      tags: row.getCell(4)?.value ? row.getCell(4).value.split(',').map(tag => tag.trim()) : [],
      likes_count: 0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
    };

    // 验证必要字段
    if (!caseData.title) {
      console.warn(`⚠️ 第 ${rowIndex} 行缺少标题，已跳过`);
      continue;
    }

    data.push(caseData);

    // 每解析100行输出一次进度
    if (rowIndex % 100 === 0) {
      console.log(`📊 已解析 ${rowIndex} 行数据...`);
    }
  }

  console.log('✅ 数据解析完成！');
  console.log(`📊 总共解析 ${data.length} 条案例数据`);
  console.log('');
  console.log('📋 数据示例（前3条）:');
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
  console.error('❌ 读取Excel文件失败:', error.message);
  process.exit(1);
}
