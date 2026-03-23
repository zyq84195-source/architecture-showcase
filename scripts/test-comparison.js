/**
 * 测试对比分析功能（不需要 AI 模型）
 *
 * 使用方法：
 * node scripts/test-comparison.js
 */

const { ComparisonEngine } = require('architecture-search-framework/comparison');

// 模拟搜索结果（符合 SearchTaskResult 格式）
const mockResults = [
  {
    title: '历史建筑改造案例 1',
    url: 'https://example.com/case1',
    snippet: '2021年进行的历史建筑改造项目，投资500万元，位于北京，改造面积2000平方米，获得国家文物保护奖。',
    content: '2021年进行的历史建筑改造项目，投资500万元，位于北京，改造面积2000平方米，获得国家文物保护奖。',
    case_number: '001',
    location: '北京',
    project_scale: '2000平方米',
    total_investment: '500万元',
    case_type: '历史保护'
  },
  {
    title: '历史建筑改造案例 2',
    url: 'https://example.com/case2',
    snippet: '2022年进行的历史建筑改造项目，投资800万元，位于上海，改造面积2500平方米，采用现代技术手段。',
    content: '2022年进行的历史建筑改造项目，投资800万元，位于上海，改造面积2500平方米，采用现代技术手段。',
    case_number: '002',
    location: '上海',
    project_scale: '2500平方米',
    total_investment: '800万元',
    case_type: '历史保护'
  },
  {
    title: '历史建筑改造案例 3',
    url: 'https://example.com/case3',
    snippet: '2023年进行的历史建筑改造项目，投资1200万元，位于深圳，改造面积3000平方米，注重可持续发展。',
    content: '2023年进行的历史建筑改造项目，投资1200万元，位于深圳，改造面积3000平方米，注重可持续发展。',
    case_number: '003',
    location: '深圳',
    project_scale: '3000平方米',
    total_investment: '1200万元',
    case_type: '历史保护'
  }
];

async function testComparison() {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                            ║
║   对比分析功能测试                                         ║
║                                                            ║
╚════════════════════════════════════════════════════════╝
`);

  try {
    console.log('\n🔍 开始结构化对比...\n');

    const engine = new ComparisonEngine();
    const result = await engine.compareStructured(mockResults);

    console.log('✅ 结构化对比完成！\n');
    console.log('📊 提取的字段：');
    console.log(JSON.stringify(result.extractedFields, null, 2));

    console.log('\n📊 统计信息：');
    console.log(JSON.stringify(result.statistics, null, 2));

    console.log('\n📊 对比表格（Markdown）：\n');
    const comparisonMd = engine.exportComparison({
      structuredComparison: result,
      semanticComparison: null,
      metadata: result.statistics
    }, 'markdown');

    console.log(comparisonMd);

    console.log('\n✅ 测试完成！');
    console.log(`\n💡 提示：`);
    console.log(`   1. 结构化对比不需要 AI 模型`);
    console.log(`   2. 可以立即用于生产环境`);
    console.log(`   3. 语义对比需要配置有效的 API Key`);

  } catch (error) {
    console.error('\n❌ 测试失败：', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testComparison();
