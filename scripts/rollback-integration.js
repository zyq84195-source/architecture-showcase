/**
 * 自动回滚脚本 - 恢复集成前的状态
 *
 * 使用方法：
 * node scripts/rollback-integration.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = process.cwd();

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                            ║
║   建筑案例网站项目 - 集成回滚工具                       ║
║                                                            ║
╚══════════════════════════════════════════════════════════╝
`);

console.log('🔄 开始回滚集成...');

let restoredCount = 0;
let deletedCount = 0;

try {
  // 1. 恢复 package.json
  if (fs.existsSync('package.json.backup')) {
    fs.copyFileSync('package.json.backup', 'package.json');
    console.log('✅ 已恢复: package.json');
    restoredCount++;
  } else {
    console.log('⚠️  package.json.backup 不存在');
  }

  // 2. 恢复 next.config.js
  if (fs.existsSync('next.config.js.backup')) {
    fs.copyFileSync('next.config.js.backup', 'next.config.js');
    console.log('✅ 已恢复: next.config.js');
    restoredCount++;
  } else {
    console.log('⚠️  next.config.js.backup 不存在');
  }

  // 3. 恢复 tsconfig.json
  if (fs.existsSync('tsconfig.json.backup')) {
    fs.copyFileSync('tsconfig.json.backup', 'tsconfig.json');
    console.log('✅ 已恢复: tsconfig.json');
    restoredCount++;
  } else {
    console.log('⚠️  tsconfig.json.backup 不存在');
  }

  // 4. 删除 node_modules
  if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
    console.log('✅ 已删除: node_modules');
    deletedCount++;
  } else {
    console.log('ℹ️  node_modules 不存在');
  }

  // 5. 删除 package-lock.json
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('✅ 已删除: package-lock.json');
    deletedCount++;
  } else {
    console.log('ℹ️  package-lock.json 不存在');
  }

  console.log(`\n✅ 回滚完成！`);
  console.log(`   恢复文件数: ${restoredCount}`);
  console.log(`   删除文件数: ${deletedCount}`);
  console.log(`\n📝 下一步操作:`);
  console.log(`   1. 安装依赖: npm install`);
  console.log(`   2. 启动开发服务器: npm run dev`);

} catch (error) {
  console.error(`\n❌ 回滚失败: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}
