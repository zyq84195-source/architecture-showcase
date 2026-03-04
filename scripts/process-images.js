const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// 读取图片文字说明
const imageCaptions = {};
const workbook = xlsx.readFile('C:/Users/zyq15/Desktop/案例图片/name.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const imageData = xlsx.utils.sheet_to_json(worksheet);

imageData.forEach(item => {
  imageCaptions[item['图片编号']] = item['图片文字介绍'];
});

console.log('读取图片文字说明完成，共', Object.keys(imageCaptions).length, '条');

// 读取现有的案例数据
const casesData = JSON.parse(fs.readFileSync('public/data/cases.json', 'utf8'));

// 目标图片目录
const targetImageDir = 'public/images/cases';
if (!fs.existsSync(targetImageDir)) {
  fs.mkdirSync(targetImageDir, { recursive: true });
}

// 处理每个案例的图片
casesData.forEach((caseItem) => {
  const caseId = caseItem.id.replace('excel_', '');

  // 查找该案例的所有图片
  const sourceDir = 'C:/Users/zyq15/Desktop/案例图片';
  const files = fs.readdirSync(sourceDir);

  const caseImages = files
    .filter(file => file.startsWith(caseId + '_') && file.endsWith('.png'))
    .map(file => {
      const fileBase = file.replace('.png', '');
      const imageKey = caseId + '_' + fileBase.split('_').slice(1).join('_');

      return {
        id: imageKey,
        filename: file,
        url: `/images/cases/${file}`,
        caption: imageCaptions[imageKey] || '',
        isMain: file.includes('_main'),
        order: 0
      };
    })
    .sort((a, b) => {
      // main图片排第一，然后按数字顺序
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      const aNum = parseInt(a.filename.split('_')[1]) || 999;
      const bNum = parseInt(b.filename.split('_')[1]) || 999;
      return aNum - bNum;
    })
    .map((img, index) => ({ ...img, order: index + 1 }));

  // 复制图片到项目目录
  caseImages.forEach(img => {
    const sourcePath = path.join(sourceDir, img.filename);
    const targetPath = path.join(targetImageDir, img.filename);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✓ 复制: ${img.filename}`);
    }
  });

  // 更新案例数据
  caseItem.images = caseImages;

  console.log(`\n案例 ${caseId} (${caseItem.title}):`);
  console.log(`  主图片: ${caseImages.find(i => i.isMain)?.filename || '无'}`);
  console.log(`  总图片: ${caseImages.length}张`);
});

// 保存更新后的案例数据
fs.writeFileSync('public/data/cases.json', JSON.stringify(casesData, null, 2));
fs.writeFileSync('src/data/cases.json', JSON.stringify(casesData, null, 2));

console.log('\n✅ 图片处理完成！');
console.log(`✓ 共处理 ${casesData.length} 个案例`);
console.log(`✓ 共复制 ${casesData.reduce((sum, c) => sum + c.images.length, 0)} 张图片`);
console.log('✓ 数据已保存到 public/data/cases.json 和 src/data/cases.json');
