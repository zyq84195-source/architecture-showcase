/**
 * 独立的对比分析 API（不依赖框架的其他部分）
 */

const http = require('http');

/**
 * 简化的结构化对比（不需要 AI）
 */
function simpleStructuredComparison(results) {
  console.log(`\n📊 对比分析 - ${results.length} 个项目\n`);

  // 1. 提取字段
  const extractedData = results.map((result, index) => {
    const data = {
      序号: index + 1,
      标题: result.title,
      URL: result.url
    };

    // 提取年份
    const yearMatches = result.snippet?.match(/\b(19|20)\d{2}\b/g) || [];
    if (yearMatches.length > 0) {
      data.年份 = yearMatches.join(', ');
    }

    // 提取数字
    const numberMatches = result.snippet?.match(/\d+(?:\.\d+)?\s*(?:m|m²|km|kg|t|万元|千元|百|万)/g) || [];
    if (numberMatches.length > 0) {
      data.数字 = numberMatches.join(', ');
    }

    // 提取关键词
    const keywords = extractKeywords(result.snippet || '');
    if (keywords.length > 0) {
      data.关键词 = keywords.join(', ');
    }

    return data;
  });

  // 2. 生成对比表格
  const table = generateTable(extractedData);

  // 3. 统计信息
  const statistics = {
    总项目数: results.length,
    提取字段数: extractedData.filter(d => d.年份 || d.数字 || d.关键词).length
  };

  return {
    success: true,
    data: extractedData,
    table,
    statistics
  };
}

/**
 * 提取关键词
 */
function extractKeywords(text) {
  const keywords = [
    '历史建筑', '保护', '改造', '现代化', '可持续发展',
    '投资', '预算', '面积', '规模', '获奖', '奖项',
    '北京', '上海', '深圳', '南京', '城市', '地点'
  ];

  const found = keywords.filter(keyword => text.includes(keyword));
  return found;
}

/**
 * 生成 Markdown 对比表格
 */
function generateTable(data) {
  let table = '| 序号 | 标题 | 年份 | 数字 | 关键词 |\n';
  table += '|------|------|------|------|--------|\n';

  data.forEach(item => {
    table += `| ${item.序号} | ${item.标题.substring(0, 20)}... | ${item.年份 || '-'} | ${item.数字 || '-'} | ${item.关键词 || '-'} |\n`;
  });

  return table;
}

/**
 * 创建 HTTP 服务器
 */
const server = http.createServer(async (req, res) => {
  // 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // 处理 GET /health
  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 处理 POST /compare
  if (path === '/compare' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const { results } = JSON.parse(body);

        if (!results || !Array.isArray(results)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Missing or invalid parameter: results'
          }));
          return;
        }

        console.log(`\n[Compare API] 收到 ${results.length} 个项目\n`);

        const result = simpleStructuredComparison(results);

        console.log(`✅ 对比分析完成\n`);
        console.log(`📊 提取字段: ${JSON.stringify(result.statistics, null, 2)}\n`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('[Compare API Error]', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    });
    return;
  }

  // 其他路径返回 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    error: 'Not Found',
    path
  }));
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                            ║
║   独立对比分析 API Server                             ║
║                                                            ║
╚════════════════════════════════════════════════════════╝
  `);
  console.log(`🚀 服务器运行在: http://localhost:${PORT}`);
  console.log(`\n📡 可用的 API 端点:`);
  console.log(`   - GET  /health       健康检查`);
  console.log(`   - POST /compare      对比分析 API`);
  console.log(`\n💡 测试方法:`);
  console.log(`   node test-standalone-compare.js`);

  // 测试数据
  const testResults = [
    {
      title: '历史建筑改造案例 1',
      url: 'https://example.com/case1',
      snippet: '2021年进行的历史建筑改造项目，投资500万元，位于北京，改造面积2000平方米，获得国家文物保护奖。'
    },
    {
      title: '历史建筑改造案例 2',
      url: 'https://example.com/case2',
      snippet: '2022年进行的历史建筑改造项目，投资800万元，位于上海，改造面积2500平方米，采用现代技术手段。'
    }
  ];

  console.log(`\n🧪 测试中对比分析功能...\n`);

  const testResult = simpleStructuredComparison(testResults);

  console.log(`✅ 测试完成！\n`);
});
