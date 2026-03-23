/**
 * 测试对比分析 API
 */

const http = require('http');

// 模拟搜索结果
const results = [
  {
    title: '历史建筑改造案例 1',
    snippet: '2021年，北京，500万元，2000平方米',
    case_number: '001',
    location: '北京',
    project_scale: '2000平方米',
    total_investment: '500万元',
    case_type: '历史保护'
  },
  {
    title: '历史建筑改造案例 2',
    snippet: '2022年，上海，800万元，2500平方米',
    case_number: '002',
    location: '上海',
    project_scale: '2500平方米',
    total_investment: '800万元',
    case_type: '历史保护'
  }
];

const payload = JSON.stringify({
  results,
  enableSemantic: false
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/compare',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:');
    console.log(data);

    try {
      const json = JSON.parse(data);
      if (json.success) {
        console.log('\n✅ 对比分析成功！');
        console.log('提取的字段:', json.extractedFields);
        console.log('统计信息:', json.statistics);
      } else {
        console.log('\n❌ 对比分析失败:', json.error);
      }
    } catch (e) {
      console.log('\n解析响应失败:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('请求失败:', e.message);
});

req.write(payload);
req.end();
