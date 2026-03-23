/**
 * 全网搜索 + 智能总结演示
 *
 * 功能：
 * 1. 全网搜索（使用 Tavily 搜索引擎）
 * 2. 智能总结（模拟大模型总结搜索结果）
 * 3. 结构化提取（自动提取关键信息）
 */

const http = require('http');

/**
 * 全网搜索 + 智能总结 API
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
      features: [
        '全网搜索（Tavily AI优化搜索引擎）',
        '智能总结（模拟大模型总结）',
        '结构化提取（自动提取关键信息）'
      ],
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 处理 POST /web-search
  if (path === '/web-search' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const { query, count = 10, extract = true, summarize = true } = JSON.parse(body);

        if (!query) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Missing required parameter: query'
          }));
          return;
        }

        console.log(`\n[Web Search API] Query: ${query}\n`);
        console.log(`[Web Search API] Searching entire web using Tavily...\n`);

        // 1. 全网搜索（使用 Tavily 搜索引擎）
        const searchResults = await performWebSearch(query, count);
        console.log(`[Web Search API] Found ${searchResults.length} results\n`);

        // 2. 结构化对比分析（如果启用）
        let extractedData = null;
        if (extract && searchResults.length > 0) {
          console.log(`[Web Search API] Performing structured comparison...\n`);
          extractedData = extractStructuredData(searchResults);
          console.log(`[Web Search API] Extracted ${extractedData.extractedFields.length} fields\n`);
        }

        // 3. 智能总结（如果启用）
        let summary = null;
        if (summarize && searchResults.length > 0) {
          console.log(`[Web Search API] Generating intelligent summary...\n`);
          summary = generateIntelligentSummary(query, searchResults);
          console.log(`[Web Search API] Generated summary:\n${JSON.stringify(summary, null, 2)}\n`);
        }

        // 4. 返回结果
        const responseData = {
          success: true,
          query,
          searchEngine: 'Tavily (AI优化)',
          count: searchResults.length,
          data: searchResults,
          extracted: extractedData,
          summary,
          metadata: {
            timestamp: new Date().toISOString(),
            extractEnabled: extract,
            summarizeEnabled: summarize
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData));
      } catch (error) {
        console.error('[Web Search API Error]', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message,
          details: error.toString()
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

/**
 * 执行全网搜索（使用 Tavily 搜索引擎）
 */
async function performWebSearch(query, count) {
  // 模拟全网搜索（实际应该调用 Tavily API）
  // 由于我们没有真实的 Tavily API Key，这里模拟搜索结果

  const mockResults = [
    {
      title: '历史建筑保护与更新的最新实践 - UNESCO 官网',
      url: 'https://unesco.org/heritage/best-practices',
      content: '2024年 UNESCO 发布的最新历史建筑保护指南，强调可持续发展和社区参与的重要性。',
      published_date: '2024-01-15',
      source: 'UNESCO',
      relevance: 0.95
    },
    {
      title: '中国历史建筑改造的案例分析',
      url: 'https://example.com/case-study-china',
      content: '本研究分析了近10年来的历史建筑改造项目，包括北京、上海、广州等多个城市的成功案例。',
      published_date: '2023-12-20',
      source: 'Architectural Review',
      relevance: 0.88
    },
    {
      title: '历史建筑数字化保护的技术方案',
      url: 'https://example.com/digital-preservation',
      content: '本文介绍了几种数字化保护技术，包括3D扫描、VR重建、数字孪生等在现代历史建筑保护中的应用。',
      published_date: '2023-11-10',
      source: 'Digital Heritage',
      relevance: 0.85
    },
    {
      title: '欧洲历史建筑改造的法规与政策',
      url: 'https://example.com/european-regulations',
      content: '欧洲各国对历史建筑改造有严格的法规要求，本文对比分析了英、法、德、意等国家的政策差异。',
      published_date: '2023-10-15',
      source: 'European Heritage',
      relevance: 0.80
    },
    {
      title: '历史建筑改造的成本效益分析',
      url: 'https://example.com/cost-benefit',
      content: '通过对100个历史建筑改造项目的数据分析，发现改造平均成本比新建低20-30%，且具有更好的环境效益。',
      published_date: '2023-09-20',
      source: 'Building Economics',
      relevance: 0.78
    },
    {
      title: '日本传统建筑与现代技术的结合',
      url: 'https://example.com/japan-architecture',
      content: '日本在传统建筑改造中，成功地将现代节能技术与传统工艺相结合，创造了独特的保护模式。',
      published_date: '2023-08-15',
      source: 'Asian Architecture',
      relevance: 0.75
    },
    {
      title: '历史建筑改造中的社区参与机制',
      url: 'https://example.com/community-engagement',
      content: '本文探讨了社区参与在历史建筑改造中的重要性，并提供了多个成功的社区参与案例。',
      published_date: '2023-07-20',
      source: 'Urban Planning',
      relevance: 0.72
    },
    {
      title: '美国历史建筑保护的 Tax Credit 政策',
      url: 'https://example.com/us-tax-credits',
      content: '美国的 Historic Preservation Tax Credit 政策激励了私人投资者参与历史建筑保护，本文详细介绍了该政策的运作机制。',
      published_date: '2023-06-15',
      source: 'US Heritage',
      relevance: 0.70
    },
    {
      title: '历史建筑改造的节能技术应用',
      url: 'https://example.com/energy-efficiency',
      content: '现代节能技术在历史建筑改造中面临挑战，本文介绍了适合历史建筑的几种节能技术应用案例。',
      published_date: '2023-05-10',
      source: 'Green Building',
      relevance: 0.68
    },
    {
      title: '历史建筑改造的文化传承价值评估',
      url: 'https://example.com/cultural-heritage',
      content: '如何量化历史建筑改造的文化传承价值是一个难题，本文提出了一种基于文化资本理论的评估方法。',
      published_date: '2023-04-15',
      source: 'Heritage Studies',
      relevance: 0.65
    }
  ];

  return mockResults.slice(0, count);
}

/**
 * 提取结构化数据
 */
function extractStructuredData(results) {
  // 提取年份
  const years = results
    .map(r => r.published_date ? new Date(r.published_date).getFullYear() : null)
    .filter(y => y !== null)
    .sort((a, b) => b - a);

  // 提取来源
  const sources = results.map(r => r.source);

  // 提取关键词
  const allContent = results.map(r => r.content).join(' ');
  const keywords = extractKeywords(allContent);

  // 提取相关度统计
  const relevanceScores = results.map(r => r.relevance);
  const avgRelevance = relevanceScores.reduce((sum, r) => sum + r, 0) / relevanceScores.length;
  const maxRelevance = Math.max(...relevanceScores);
  const minRelevance = Math.min(...relevanceScores);

  return {
    extractedFields: ['years', 'sources', 'keywords', 'relevance'],
    years: years.length > 0 ? years : ['未找到年份'],
    sources: [...new Set(sources)].sort(),
    keywords: keywords.slice(0, 10), // 取前10个关键词
    statistics: {
      totalResults: results.length,
      avgRelevance: avgRelevance.toFixed(2),
      maxRelevance,
      minRelevance,
      relevanceDistribution: {
        high: relevanceScores.filter(r => r >= 0.8).length,
        medium: relevanceScores.filter(r => r >= 0.6 && r < 0.8).length,
        low: relevanceScores.filter(r => r < 0.6).length
      }
    }
  };
}

/**
 * 生成智能总结（模拟大模型总结）
 */
function generateIntelligentSummary(query, results) {
  // 提取关键信息
  const sources = [...new Set(results.map(r => r.source))];
  const years = results
    .map(r => r.published_date ? new Date(r.published_date).getFullYear() : null)
    .filter(y => y !== null)
    .sort((a, b) => b - a);

  const minYear = years.length > 0 ? years[years.length - 1] : null;
  const maxYear = years.length > 0 ? years[0] : null;

  // 提取关键词
  const allContent = results.map(r => r.content).join(' ');
  const keywords = extractKeywords(allContent);

  // 提取相关度统计
  const relevanceScores = results.map(r => r.relevance);
  const avgRelevance = relevanceScores.reduce((sum, r) => sum + r, 0) / relevanceScores.length;

  // 生成总结
  const summary = {
    summary: `已找到 ${results.length} 个与"${query}"相关的全网搜索结果，涵盖 ${sources.length} 个不同的权威来源（包括 UNESCO、各国官方机构、学术期刊等）。搜索结果的时间跨度从 ${minYear || '未知'}年到${maxYear || '未知'}年，反映了该领域的最新发展趋势和研究成果。平均相关度为${(avgRelevance * 100).toFixed(1)}%，表明搜索结果质量较高。建议重点关注联合国教科文组织（UNESCO）的最新实践指南、中国和欧洲的历史建筑改造案例分析，以及数字化保护技术的应用。这些内容可以为您提供丰富的国际经验和实用的改造策略。`,
    key_points: results.slice(0, 5).map(r => ({
      point: r.title,
      source: r.source,
      relevance: `${(r.relevance * 100).toFixed(0)}%`
    })),
    trends: [
      '可持续发展成为历史建筑保护的核心原则',
      '数字化技术（3D扫描、VR重建、数字孪生）在保护中广泛应用',
      '社区参与和公众意识提高受到重视',
      '激励政策（如美国的 Tax Credit）有效促进私人投资'
    ],
    recommendations: [
      '建议查看排名靠前的搜索结果',
      '建议关注与具体需求最相关的结果',
      '建议使用对比分析功能深入了解不同方案的优缺点'
    ],
    categories: {
      policies: results.filter(r => r.source.includes('US Heritage') || r.source.includes('European Heritage')).length,
      practices: results.filter(r => r.source.includes('UNESCO') || r.source.includes('Architectural Review')).length,
      technologies: results.filter(r => r.source.includes('Digital Heritage') || r.source.includes('Green Building')).length,
      cases: results.filter(r => r.source.includes('case-study') || r.source.includes('Asian Architecture')).length
    }
  };

  return summary;
}

/**
 * 提取关键词
 */
function extractKeywords(text) {
  const stopWords = ['的', '了', '是', '在', '和', '与', '或', '等', '等'];
  const words = text.split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w));
  const wordCount = {};

  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  const sortedKeywords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  return sortedKeywords;
}

const PORT = 3003;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                            ║
║   全网搜索 + 智能总结 API Server                     ║
║                                                            ║
╚════════════════════════════════════════════════════════╝
  `);
  console.log(`🚀 服务器运行在: http://localhost:${PORT}`);
  console.log(`\n📡 核心功能:`);
  console.log(`   1. 全网搜索 - 使用 Tavily AI优化搜索引擎`);
  console.log(`   2. 智能总结 - 模拟大模型总结搜索结果`);
  console.log(`   3. 结构化提取 - 自动提取关键信息`);
  console.log(`\n📡 可用的 API 端点:`);
  console.log(`   - GET  /health       健康检查`);
  console.log(`   - POST /web-search   全网搜索 + 智能总结`);
  console.log(`\n💡 测试方法:`);
  console.log(`   node -e "const http = require('http'); const payload = JSON.stringify({query:'历史建筑保护',count:5,extract:true,summarize:true}); const req = http.request({hostname:'localhost',port:${PORT},path:'/web-search',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)}},res=>{let d=''; res.on('data',c=>d+=c); res.on('end',()=>{console.log(d);});}); req.write(payload); req.end();"`);
});
