const xlsx = require('xlsx');
const fs = require('fs');

// 读取Excel数据
const workbook = xlsx.readFile('C:/Users/zyq15/Desktop/案例.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = xlsx.utils.sheet_to_json(worksheet);

console.log('读取Excel完成，共', rawData.length, '个案例');

// 打印每个案例的所在区位数据
console.log('\n=== 案例所在区位数据 ===');
rawData.forEach((item, index) => {
  console.log(`案例 ${index + 1}: ${item['案例编号']}`);
  console.log(`所在区位: ${item['所在区位']}`);
});

// 读取图片文字说明
const imageCaptions = {};
const workbook2 = xlsx.readFile('C:/Users/zyq15/Desktop/案例图片/name.xlsx');
const worksheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
const imageData = xlsx.utils.sheet_to_json(worksheet2);

imageData.forEach(item => {
  imageCaptions[item['图片编号']] = item['图片文字介绍'];
});

console.log('\n读取图片文字说明完成，共', Object.keys(imageCaptions).length, '条');

// 目标图片目录
const sourceDir = 'C:/Users/zyq15/Desktop/案例图片';

// 列出所有图片文件夹
const files = fs.readdirSync(sourceDir);
console.log('\n=== 图片文件夹内容 ===');
console.log('所有文件:', files.length, '个');

// 检查C010的图片
const c010Images = files.filter(f => f.startsWith('C010'));
console.log('\nC010案例图片:', c010Images.length, '个');
c010Images.forEach(img => {
  console.log('  -', img);
});
