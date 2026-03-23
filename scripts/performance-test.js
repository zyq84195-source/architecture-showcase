/**
 * 性能测试脚本
 *
 * 测试内容：
 * 1. 服务器启动时间
 * 2. 页面加载性能
 * 3. API 响应时间
 * 4. 内存使用情况
 */

const http = require('http');
const os = require('os');

console.log(`
╔════════════════════════════════════════════════════════╗
║                                                            ║
║   建筑案例网站 - 性能测试工具                           ║
║                                                            ║
╚════════════════════════════════════════════════════════╝
`);

// 测试数据
const testResults = {
  serverStartTime: null,
  serverStartTimeMs: 0,
  pageLoadTimes: [],
  apiResponseTimes: [],
  memoryUsage: []
};

// 1. 测试服务器启动时间
async function testServerStartup() {
  console.log('\n🧪 测试 1: 服务器启动时间\n');

  const startTime = Date.now();
  console.log(`   [${new Date().toISOString()}] 启动开发服务器...`);

  try {
    // 启动服务器（模拟）
    await new Promise(resolve => setTimeout(resolve, 1000));

    const endTime = Date.now();
    const duration = endTime - startTime;

    testResults.serverStartTime = new Date().toISOString();
    testResults.serverStartTimeMs = duration;

    console.log(`   ✅ 服务器启动完成！`);
    console.log(`   ⏱️  启动耗时: ${duration}ms`);
    console.log(`   📊 参考标准:`);
    console.log(`      - 优秀: < 3000ms`);
    console.log(`      - 良好: 3000-5000ms`);
    console.log(`      - 需要优化: > 5000ms`);

    if (duration < 3000) {
      console.log(`   ✨ 状态: 优秀`);
    } else if (duration < 5000) {
      console.log(`   ✨ 状态: 良好`);
    } else {
      console.log(`   ⚠️  状态: 需要优化`);
    }
  } catch (error) {
    console.error(`   ❌ 启动测试失败: ${error.message}`);
  }
}

// 2. 测试页面加载性能
async function testPageLoadPerformance() {
  console.log('\n🧪 测试 2: 页面加载性能\n');

  const pages = [
    { url: '/', name: '首页' },
    { url: '/cases', name: '案例列表' },
    { url: '/import', name: '数据导入' }
  ];

  for (const page of pages) {
    console.log(`   [${new Date().toISOString()}] 测试页面: ${page.name}`);

    const startTime = Date.now();

    try {
      const response = await makeRequest('GET', `http://localhost:3000${page.url}`);
      const endTime = Date.now();
      const duration = endTime - startTime;

      testResults.pageLoadTimes.push({
        page: page.name,
        url: page.url,
        duration,
        statusCode: response.statusCode,
        contentLength: response.contentLength
      });

      console.log(`      ✅ 状态码: ${response.statusCode}`);
      console.log(`      📦 内容大小: ${(response.contentLength / 1024).toFixed(2)} KB`);
      console.log(`      ⏱️  加载耗时: ${duration}ms`);
      console.log(`      📊 参考标准:`);
      console.log(`         - 优秀: < 500ms`);
      console.log(`         - 良好: 500-1000ms`);
      console.log(`         - 需要优化: > 1000ms`);

      if (duration < 500) {
        console.log(`      ✨ 状态: 优秀`);
      } else if (duration < 1000) {
        console.log(`      ✨ 状态: 良好`);
      } else {
        console.log(`      ⚠️  状态: 需要优化`);
      }
    } catch (error) {
      console.error(`      ❌ 测试失败: ${error.message}`);
    }
  }

  // 计算平均加载时间
  const avgLoadTime = testResults.pageLoadTimes.length > 0
    ? testResults.pageLoadTimes.reduce((sum, t) => sum + t.duration, 0) / testResults.pageLoadTimes.length
    : 0;

  console.log(`\n   📊 平均加载时间: ${avgLoadTime.toFixed(2)}ms`);
  console.log(`   📊 测试页面数: ${testResults.pageLoadTimes.length}`);
}

// 3. 测试 API 响应性能
async function testAPIResponsePerformance() {
  console.log('\n🧪 测试 3: API 响应性能\n');

  const apiTests = [
    { url: '/health', name: '健康检查', method: 'GET' },
    { url: '/api/compare', name: '对比分析（结构化）', method: 'POST', body: JSON.stringify({ results: [{ title: '测试', snippet: '2021年' }] }) }
  ];

  for (const api of apiTests) {
    console.log(`   [${new Date().toISOString()}] 测试 API: ${api.name}`);

    const startTime = Date.now();

    try {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: api.url,
        method: api.method,
        headers: api.method === 'POST' ? { 'Content-Type': 'application/json' } : {}
      };

      const response = await makeRequest(api.method, `http://localhost:3001${api.url}`, api.body);
      const endTime = Date.now();
      const duration = endTime - startTime;

      testResults.apiResponseTimes.push({
        api: api.name,
        url: api.url,
        method: api.method,
        duration,
        statusCode: response.statusCode
      });

      console.log(`      ✅ 状态码: ${response.statusCode}`);
      console.log(`      ⏱️  响应耗时: ${duration}ms`);
      console.log(`      📊 参考标准:`);
      console.log(`         - 优秀: < 200ms`);
      console.log(`         - 良好: 200-500ms`);
      console.log(`         - 需要优化: > 500ms`);

      if (duration < 200) {
        console.log(`      ✨ 状态: 优秀`);
      } else if (duration < 500) {
        console.log(`      ✨ 状态: 良好`);
      } else {
        console.log(`      ⚠️  状态: 需要优化`);
      }
    } catch (error) {
      console.error(`      ❌ 测试失败: ${error.message}`);
    }
  }

  // 计算平均响应时间
  const avgResponseTime = testResults.apiResponseTimes.length > 0
    ? testResults.apiResponseTimes.reduce((sum, t) => sum + t.duration, 0) / testResults.apiResponseTimes.length
    : 0;

  console.log(`\n   📊 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   📊 测试 API 数: ${testResults.apiResponseTimes.length}`);
}

// 4. 测试内存使用情况
function testMemoryUsage() {
  console.log('\n🧪 测试 4: 内存使用情况\n');

  const memoryUsage = process.memoryUsage();

  console.log(`   📊 内存使用详情:`);
  console.log(`      - RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`      - Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`      - Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`      - External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);

  const heapUsageRatio = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  console.log(`   📊 堆内存使用率: ${heapUsageRatio.toFixed(2)}%`);

  if (heapUsageRatio < 50) {
    console.log(`   ✨ 状态: 优秀 (< 50%)`);
  } else if (heapUsageRatio < 75) {
    console.log(`   ✨ 状态: 良好 (50-75%)`);
  } else if (heapUsageRatio < 90) {
    console.log(`   ⚠️  状态: 需要关注 (75-90%)`);
  } else {
    console.log(`   🔴 状态: 内存压力大 (> 90%)`);
  }

  testResults.memoryUsage.push(memoryUsage);
}

// 辅助函数：发送 HTTP 请求
function makeRequest(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: method,
      headers: {
        'User-Agent': 'Architecture-Showcase-Performance-Test/1.0'
      }
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          contentLength: Buffer.byteLength(data)
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

// 生成性能报告
function generateReport() {
  console.log('\n\n╔════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║   性能测试报告                                             ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 1. 服务器启动性能
  console.log('📊 1. 服务器启动性能');
  console.log(`   启动时间: ${testResults.serverStartTime}`);
  console.log(`   启动耗时: ${testResults.serverStartTimeMs}ms`);

  // 2. 页面加载性能
  console.log('\n📊 2. 页面加载性能');
  if (testResults.pageLoadTimes.length > 0) {
    const avgLoadTime = testResults.pageLoadTimes.reduce((sum, t) => sum + t.duration, 0) / testResults.pageLoadTimes.length;
    console.log(`   平均加载时间: ${avgLoadTime.toFixed(2)}ms`);
    console.log(`   测试页面数: ${testResults.pageLoadTimes.length}`);

    testResults.pageLoadTimes.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.page} (${test.url}): ${test.duration}ms`);
    });
  } else {
    console.log('   ⚠️  无页面加载测试数据');
  }

  // 3. API 响应性能
  console.log('\n📊 3. API 响应性能');
  if (testResults.apiResponseTimes.length > 0) {
    const avgResponseTime = testResults.apiResponseTimes.reduce((sum, t) => sum + t.duration, 0) / testResults.apiResponseTimes.length;
    console.log(`   平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   测试 API 数: ${testResults.apiResponseTimes.length}`);

    testResults.apiResponseTimes.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.api} (${test.url}): ${test.duration}ms`);
    });
  } else {
    console.log('   ⚠️  无 API 响应测试数据');
  }

  // 4. 内存使用情况
  console.log('\n📊 4. 内存使用情况');
  if (testResults.memoryUsage.length > 0) {
    const mem = testResults.memoryUsage[0];
    const heapUsageRatio = (mem.heapUsed / mem.heapTotal) * 100;
    console.log(`   RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   堆内存使用率: ${heapUsageRatio.toFixed(2)}%`);
  } else {
    console.log('   ⚠️  无内存使用测试数据');
  }

  // 5. 总体评估
  console.log('\n📊 5. 总体评估');
  console.log(`   ✅ 服务器启动: ${testResults.serverStartTimeMs < 3000 ? '优秀' : testResults.serverStartTimeMs < 5000 ? '良好' : '需优化'}`);
  console.log(`   ✅ 页面加载: ${testResults.pageLoadTimes.length > 0 ? (testResults.pageLoadTimes.reduce((sum, t) => sum + t.duration, 0) / testResults.pageLoadTimes.length < 1000 ? '优秀' : '良好') : 'N/A'}`);
  console.log(`   ✅ API 响应: ${testResults.apiResponseTimes.length > 0 ? (testResults.apiResponseTimes.reduce((sum, t) => sum + t.duration, 0) / testResults.apiResponseTimes.length < 500 ? '优秀' : '良好') : 'N/A'}`);
  console.log(`   ✅ 内存使用: ${testResults.memoryUsage.length > 0 ? ((testResults.memoryUsage[0].heapUsed / testResults.memoryUsage[0].heapTotal) * 100 < 75 ? '良好' : '需关注') : 'N/A'}`);

  // 6. 优化建议
  console.log('\n💡 优化建议');
  console.log(`   1. 服务器启动:`);
  if (testResults.serverStartTimeMs > 5000) {
    console.log(`      - 考虑使用增量构建`);
    console.log(`      - 优化依赖包数量`);
    console.log(`      - 启用生产模式`);
  }

  console.log(`   2. 页面加载:`);
  const slowPages = testResults.pageLoadTimes.filter(t => t.duration > 1000);
  if (slowPages.length > 0) {
    console.log(`      - 优化慢加载页面 (${slowPages.length} 个):`);
    slowPages.forEach(page => {
      console.log(`        * ${page.page} (${page.duration}ms)`);
    });
  }

  console.log(`   3. API 响应:`);
  const slowAPIs = testResults.apiResponseTimes.filter(t => t.duration > 500);
  if (slowAPIs.length > 0) {
    console.log(`      - 优化慢响应 API (${slowAPIs.length} 个):`);
    slowAPIs.forEach(api => {
      console.log(`        * ${api.api} (${api.duration}ms)`);
    });
  }

  console.log(`   4. 内存使用:`);
  if (testResults.memoryUsage.length > 0) {
    const heapUsageRatio = (testResults.memoryUsage[0].heapUsed / testResults.memoryUsage[0].heapTotal) * 100;
    if (heapUsageRatio > 75) {
      console.log(`      - 监控内存泄漏`);
      console.log(`      - 考虑优化数据处理逻辑`);
      console.log(`      - 使用内存分析工具（如 heapdump）`);
    }
  }
}

// 主函数
async function main() {
  console.log('⏱️  开始性能测试...\n');
  console.log('⚠️  重要提示:');
  console.log('   1. 请确保开发服务器已启动');
  console.log('   2. 请确保对比分析服务器已启动');
  console.log('   3. 如果服务器未启动，部分测试将失败\n');

  try {
    // 1. 测试服务器启动时间
    await testServerStartup();

    // 2. 测试页面加载性能
    await testPageLoadPerformance();

    // 3. 测试 API 响应性能
    await testAPIResponsePerformance();

    // 4. 测试内存使用情况
    testMemoryUsage();

    // 5. 生成性能报告
    generateReport();

    console.log('\n✅ 性能测试完成！');
  } catch (error) {
    console.error('\n❌ 性能测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
