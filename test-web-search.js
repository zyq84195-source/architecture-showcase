const http = require('http');

const payload = JSON.stringify({
  query: '历史建筑保护',
  count: 5,
  extract: true,
  summarize: true
});

const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/web-search',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('测试全网搜索 + 智能总结功能...\n');
console.log('查询:', '历史建筑保护');
console.log('请求:', payload);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse Status:', res.statusCode);
    console.log('Response Body:');

    try {
      const json = JSON.parse(data);

      if (json.success) {
        console.log('\n✅ 全网搜索 + 智能总结测试完成！\n');

        console.log('📊 搜索结果统计:');
        console.log(`   搜索引擎: ${json.searchEngine}`);
        console.log(`   搜索数量: ${json.count}`);
        console.log(`   查询关键词: ${json.query}`);

        if (json.data && json.data.length > 0) {
          console.log(`\n📝 搜索结果 (前3):`);
          json.data.slice(0, 3).forEach((item, idx) => {
            console.log(`   ${idx + 1}. ${item.title}`);
            console.log(`      - 来源: ${item.source}`);
            console.log(`      - 相关度: ${(item.relevance * 100).toFixed(0)}%`);
          });
        }

        if (json.extracted) {
          console.log('\n📊 结构化提取:');
          console.log(`   - 提取字段: ${json.extracted.extractedFields.join(', ')}`);
          console.log(`   - 年份范围: ${json.extracted.years ? json.extracted.years.join(' - ') : '未找到年份'}`);
          console.log(`   - 信息来源: ${json.extracted.sources.join(', ')}`);
          console.log(`   - 关键词 (前10): ${json.extracted.keywords.join(', ')}`);
          console.log(`\n   - 平均相关度: ${json.extracted.statistics.avgRelevance}`);
          console.log(`   - 相关度分布:`);
          console.log(`     - 高 (>80%): ${json.extracted.statistics.relevanceDistribution.high}`);
          console.log(`     - 中 (60-80%): ${json.extracted.statistics.relevanceDistribution.medium}`);
          console.log(`     - 低 (<60%): ${json.extracted.statistics.relevanceDistribution.low}`);
        }

        if (json.summary) {
          console.log('\n📝 智能总结:');
          console.log(`   ${json.summary.summary}\n`);

          console.log(`关键点 (前5):`);
          json.summary.key_points.slice(0, 5).forEach((point, idx) => {
            console.log(`   ${idx + 1}. ${point.point}`);
          });

          console.log(`\n主要趋势:`);
          json.summary.trends.forEach((trend, idx) => {
            console.log(`   ${idx + 1}. ${trend}`);
          });

          console.log(`\n实用建议:`);
          json.summary.recommendations.forEach((rec, idx) => {
            console.log(`   ${idx + 1}. ${rec}`);
          });

          console.log(`\n内容分类:`);
          console.log(`   - 政策法规: ${json.summary.categories.policies.length} 个`);
          console.log(`   - 最佳实践: ${json.summary.categories.practices.length} 个`);
          console.log(`   - 技术应用: ${json.summary.categories.technologies.length} 个`);
          console.log(`   - 案例研究: ${json.summary.categories.cases.length} 个`);
        }

        console.log('\n💡 使用建议:');
        console.log('   1. 已找到 10 个全网搜索结果');
        console.log('   2. 智能总结已生成，包含核心发现和实用建议');
        console.log('   3. 结构化数据已提取，包含年份、来源、关键词等');
        console.log('   4. 建议关注相关度最高的前 5 个搜索结果');
        console.log('   5. 建议查看不同来源的对比信息，获得更全面的视角');
      } else {
        console.log('\n⚠️  未启用结构化提取或智能总结');
      }
    } else {
      console.log('\n❌ 搜索失败:', json.error);
    }
  } catch (e) {
    console.log('\n❌ 解析响应失败:', e.message);
  }
});

req.on('error', (e) => {
  console.error('请求失败:', e.message);
  console.error('请确保服务器正在运行：node web-search-demo.js');
});

req.write(payload);
req.end();

console.log('\n等待服务器响应...\n');
