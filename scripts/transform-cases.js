const fs = require('fs');

// 读取原始Excel数据
const rawData = JSON.parse(fs.readFileSync('public/data/cases-from-excel.json', 'utf8'));

// 转换为网站需要的格式
const cases = rawData.map((item, index) => {
  // 解析区位
  const locationMatch = item['所在区位'].match(/(\w+省)?[\s,，]*(\w+市)?[\s,，]*(\w+区|县|市)?/);
  const country = '中国';
  const city = locationMatch?.[2]?.replace(/市/g, '') || '未知';
  const district = locationMatch?.[3]?.replace(/区|县|市/g, '') || '';

  // 解析可持续目标
  const tags = item['可持续目标'].split(/[;；\s]+/).filter(t => t.trim());

  // 解析建筑师/参与主体
  const designerMatch = item['参与主体'].match(/设计[方员]：?\s*([^ \n]+)/);
  const architect = designerMatch ? designerMatch[1] : item['参与主体'].split('\n')[0];

  return {
    id: `excel_${item['案例编号']}`,
    title: item['案例名称'],
    description: item['项目介绍'].substring(0, 200) + '...',
    images: [
      {
        url: '/images/placeholder.svg',
        caption: item['案例名称'],
        order: 1
      }
    ],
    architect: architect,
    location: [country, city, district].filter(Boolean),
    tags: [...new Set([...tags, item['案例类型'].split(/[;；\s]+/)[0]])],
    scale: item['项目规模'],
    investment: item['总投资额'],
    participants: item['参与主体'],
    start_date: item['起止时间'],
    awards: item['获奖情况'],
    case_type: item['案例类型'],
    sustainable_goal: item['可持续目标'],
    demo_significance: item['示范意义'],
    likes_count: Math.floor(Math.random() * 100) + 20,
    reviews_count: Math.floor(Math.random() * 30) + 5,
    created_at: new Date().toISOString(),
    // 原始数据保留用于详情页
    _raw: item
  };
});

// 保存转换后的数据
fs.writeFileSync('public/data/cases.json', JSON.stringify(cases, null, 2));
console.log(`成功转换 ${cases.length} 个案例！`);
console.log('已保存到: public/data/cases.json');

// 输出第一个案例的预览
console.log('\n第一个案例预览:');
console.log(JSON.stringify(cases[0], null, 2).substring(0, 500));
