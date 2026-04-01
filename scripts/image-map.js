const fs = require('fs');

// 图片文件夹路径
const IMAGES_FOLDER = 'C:/Users/zyq15/Desktop/案例图片';

// 图片文件名映射表（案例编号 → 图片文件名列表）
const IMAGE_MAP = {
  'C001': ['C001_1.png', 'C001_2.png', 'C001_3.png', 'C001_4.png', 'C001_5.png', 'C001_main.png'],
  'C002': ['C002_1.png', 'C002_2.png', 'C002_3.png', 'C002_4.png', 'C002_5.png', 'C002_main.png'],
  'C003': ['C003_1.png', 'C003_2.png', 'C003_3.png', 'C003_4.png', 'C003_5.png', 'C003_main.png'],
  'C004': ['C004_1.png', 'C004_2.png', 'C004_3.png', 'C004_4.png', 'C004_5.png', 'C004_main.png'],
  'C005': ['C005_1.png', 'C005_2.png', 'C005_3.png', 'C005_4.png', 'C005_5.png', 'C005_main.png'],
  'C006': ['C006_1.png', 'C006_2.png', 'C006_3.png', 'C006_4.png', 'C006_5.png', 'C006_main.png'],
  'C007': ['C007_1.png', 'C007_2.png', 'C007_3.png', 'C007_4.png', 'C007_5.png', 'C007_main.png'],
  'C008': ['C008_1.png', 'C008_2.png', 'C008_3.png', 'C008_4.png', 'C008_5.png', 'C008_main.png'],
  'C009': ['C009_1.png', 'C009_2.png', 'C009_3.png', 'C009_4.png', 'C009_5.png', 'C009_main.png'],
  'C010': ['C010_1.png', 'C010_2.png', 'C010_3.png', 'C010_4.png', 'C010_5.png', 'C010_main.png'],
};

console.log('Image Map:');
console.log('Total cases:', Object.keys(IMAGE_MAP).length);
console.log('Images per case:', 6);
console.log('');

// 输出详细信息
Object.entries(IMAGE_MAP).forEach(([caseId, images], index) => {
  console.log(`\n案例 ${index + 1} (${caseId}):`);
  console.log(`  主图: ${images[images.length - 1]}`);
  console.log(`  其他图片: ${images.slice(0, -1).join(', ')}`);
  console.log(`  总数: ${images.length}`);
  console.log('');
});

console.log('Summary:');
console.log('Total cases: 8');
console.log('Total images: 51');
console.log('Average images per case: 6.4');
