/**
 * 自动备份脚本 - 在集成前备份关键文件
 *
 * 使用方法：
 * node scripts/backup-before-integration.js
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupDir = path.join(projectDir, `backup-${timestamp}`);

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                            ║
║   建筑案例网站项目 - 集成前备份工具                   ║
║                                                            ║
╚══════════════════════════════════════════════════════════╝
`);

console.log(`📦 创建备份目录: ${backupDir}`);

try {
  // 创建备份目录
  fs.mkdirSync(backupDir, { recursive: true });

  // 备份关键文件
  const filesToBackup = [
    'package.json',
    'package-lock.json',
    'next.config.js',
    'tsconfig.json',
    '.env.local'
  ];

  let backedUpCount = 0;

  filesToBackup.forEach(file => {
    const src = path.join(projectDir, file);
    const dst = path.join(backupDir, file);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      console.log(`✅ 已备份: ${file}`);
      backedUpCount++;
    } else {
      console.log(`⚠️  文件不存在: ${file}`);
    }
  });

  // 创建备份信息文件
  const backupInfo = {
    timestamp: new Date().toISOString(),
    projectDir,
    backupDir,
    backedUpFiles: filesToBackup.filter(file => fs.existsSync(path.join(projectDir, file))),
    backedUpCount,
    gitBranch: getGitBranch(),
    gitStatus: getGitStatus()
  };

  fs.writeFileSync(
    path.join(backupDir, 'backup-info.json'),
    JSON.stringify(backupInfo, null, 2)
  );

  console.log(`\n✅ 备份完成！`);
  console.log(`   备份目录: ${backupDir}`);
  console.log(`   备份文件数: ${backedUpCount}`);
  console.log(`   当前分支: ${backupInfo.gitBranch}`);
  console.log(`   备份信息: ${path.join(backupDir, 'backup-info.json')}`);

} catch (error) {
  console.error(`\n❌ 备份失败: ${error.message}`);
  process.exit(1);
}

// 获取 Git 分支
function getGitBranch() {
  try {
    return require('child_process')
      .execSync('git branch --show-current', { encoding: 'utf-8' })
      .trim();
  } catch (error) {
    return 'unknown';
  }
}

// 获取 Git 状态
function getGitStatus() {
  try {
    const status = require('child_process')
      .execSync('git status --short', { encoding: 'utf-8' })
      .trim();
    return status ? 'dirty' : 'clean';
  } catch (error) {
    return 'unknown';
  }
}
