const xlsx = require('xlsx');
const fs = require('fs');

// 读取Excel数据
const workbook = xlsx.readFile('C:/Users/zyq15/Desktop/案例.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = xlsx.utils.sheet_to_json(worksheet);

console.log('读取Excel完成，共', rawData.length, '个案例');

// 读取图片文字说明
const imageCaptions = {};
const workbook2 = xlsx.readFile('C:/Users/zyq15/Desktop/案例图片/name.xlsx');
const worksheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
const imageData = xlsx.utils.sheet_to_json(worksheet2);

imageData.forEach(item => {
  imageCaptions[item['图片编号']] = item['图片文字介绍'];
});

console.log('读取图片文字说明完成，共', Object.keys(imageCaptions).length, '条');

// 目标图片目录
const sourceDir = 'C:/Users/zyq15/Desktop/案例图片';

// 处理每个案例
const cases = rawData.map((item, index) => {
  const caseId = item['案例编号'];
  const id = `excel_${caseId}`;

  // 解析区位
  const locationText = item['所在区位'] || '';
  const locationMatch = locationText.match(/(\w+省)?[\s,，]*(\w+市)?[\s,，]*(\w+区|县|市)?/);
  const location = [
    '中国',
    locationMatch?.[2]?.replace(/市/g, '') || '未知',
    locationMatch?.[3]?.replace(/区|县|市/g, '') || '未知'
  ];

  // 查找该案例的所有图片
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
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      const aNum = parseInt(a.filename.split('_')[1]) || 999;
      const bNum = parseInt(b.filename.split('_')[1]) || 999;
      return aNum - bNum;
    })
    .map((img, index) => ({ ...img, order: index + 1 }));

  // 复制图片到项目目录
  const targetImageDir = 'public/images/cases';
  if (!fs.existsSync(targetImageDir)) {
    fs.mkdirSync(targetImageDir, { recursive: true });
  }

  caseImages.forEach(img => {
    const sourcePath = `${sourceDir}/${img.filename}`;
    const targetPath = `${targetImageDir}/${img.filename}`;

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });

  // 解析可持续目标
  const tags = (item['可持续目标'] || '')
    .split(/[;；\s]+/)
    .filter(t => t.trim());

  // 添加案例类型到tags
  if (item['案例类型']) {
    const caseTypes = item['案例类型'].split(/[;；\s]+/).filter(t => t.trim());
    caseTypes.forEach(ct => {
      if (ct && !tags.includes(ct)) {
        tags.push(ct);
      }
    });
  }

  return {
    id: id,
    title: item['案例名称'] || '',
    description: (item['项目介绍'] || '').substring(0, 500) + '...',
    images: caseImages,
    architect: item['参与主体'] || '',
    location: location,
    tags: [...new Set(tags)],
    scale: item['项目规模'] || '',
    investment: item['总投资额'] || '',
    participants: item['参与主体'] || '',
    start_date: item['起止时间'] || '',
    awards: item['获奖情况'] || '',
    case_type: item['案例类型'] || '',
    sustainable_goal: item['可持续目标'] || '',
    demo_significance: item['示范意义'] || '',
    likes_count: Math.floor(Math.random() * 100) + 20,
    reviews_count: 0,
    ratings: {
      total: 0,
      count: 0,
      average: 0
    },
    created_at: new Date().toISOString(),
    // 保留所有原始数据
    _raw: {
      '案例编号': item['案例编号'],
      '案例名称': item['案例名称'],
      '所在区位': item['所在区位'],
      '项目规模': item['项目规模'],
      '总投资额': item['总投资额'],
      '参与主体': item['参与主体'],
      '起止时间': item['起止时间'],
      '获奖情况': item['获奖情况'],
      '案例类型': item['案例类型'],
      '可持续目标': item['可持续目标'],
      '示范意义': item['示范意义'],
      '项目介绍': item['项目介绍'],
      '建设阶段': item['建设阶段'],
      '项目获奖评价': item['项目获奖评价'],
      '项目举措': item['项目举措'],
      '信息来源': item['信息来源']
    }
  };
});

// 保存更新后的案例数据
fs.writeFileSync('public/data/cases.json', JSON.stringify(cases, null, 2));
fs.writeFileSync('src/data/cases.json', JSON.stringify(cases, null, 2));

console.log('\n✅ 数据处理完成！');
console.log(`✓ 共处理 ${cases.length} 个案例`);
console.log(`✓ 共复制 ${cases.reduce((sum, c) => sum + c.images.length, 0)} 张图片`);
console.log('✓ 所有16个字段已完整映射');
console.log('✓ 数据已保存到 public/data/cases.json 和 src/data/cases.json');
