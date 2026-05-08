const fs = require('fs');

// 图片信息文件路径
const IMAGES_CSV_PATH = 'C:/Users/zyq15/Desktop/案例图片/name.csv';

console.log('📊 开始读取图片信息文件...');
console.log('文件路径:', IMAGES_CSV_PATH);

try {
  // 检查文件是否存在
  if (!fs.existsSync(IMAGES_CSV_PATH)) {
    console.error('❌ 图片信息文件不存在:', IMAGES_CSV_PATH);
    console.log('💡 提示：请检查文件路径是否正确');
    process.exit(1);
  }

  console.log('✅ 文件存在');

  // 读取 CSV 文件
  console.log('📖 读取 CSV 文件...');
  const csvContent = fs.readFileSync(IMAGES_CSV_PATH, 'utf-8');
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');

  console.log('✅ 文件读取完成');
  console.log(`📊 总行数: ${lines.length}`);

  // 解析 CSV 数据
  const data = [];

  // 尝试解析不同的格式
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 尝试按逗号分割
    const values = line.split(',').map(v => v.trim());

    if (values.length > 1) {
      // 格式：案例编号, 图片文件名
      const caseId = values[0] || '';
      const imageName = values[1] || '';

      if (caseId && imageName) {
        data.push({
          caseId,
          imageName
        });
      }
    }
  }

  console.log('✅ 数据解析完成！');
  console.log(`📊 总共解析 ${data.length} 条图片映射`);

  // 输出前 10 条
  console.log('');
  console.log('📋 图片映射示例（前 5 条）：');
  data.slice(0, 5).forEach((item, index) => {
    console.log(`${index + 1}. 案例编号: ${item.caseId}, 图片: ${item.imageName}`);
  });

  console.log('');
  console.log('💡 下一步：');
  console.log('1. 创建更新脚本来关联图片信息到案例数据');
  console.log('2. 更新 data/cases.json 文件');
  console.log('3. 提交到 GitHub');

} catch (error) {
  console.error('❌ 读取文件失败:', error.message);
  process.exit(1);
}
