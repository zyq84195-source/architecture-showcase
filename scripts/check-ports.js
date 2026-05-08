const { exec } = require('child_process');

console.log('🔍 检查端口占用情况...');
console.log('');

// 端口列表
const ports = [3000, 3001, 3002, 3003, 3004, 3005];

// 检查每个端口
ports.forEach(port => {
  exec(`netstat -ano | findstr :${port} | findstr "LISTENING"`, (error, stdout) => {
    if (error) {
      console.error(`  ❌ 检查端口 ${port} 失败`, error.message);
    } else if (stdout.includes('LISTENING')) {
      const lines = stdout.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length > 0) {
        const pidMatch = lines[0].match(/(\d+)/);
        if (pidMatch) {
          const pid = pidMatch[1];
          console.log(`\n📊 端口 ${port}:`);
          console.log(`  PID: ${pid}`);
          console.log(`  状态: 占用`);

          // 尝试获取进程名称
          exec(`tasklist | findstr ${pid} /FI "IMAGENAME ONLY"`, (error2, stdout2) => {
            if (!error2 && stdout2) {
              const imageName = stdout2.trim();
              console.log(`  进程名: ${imageName}`);
            }
          });
        } else {
          console.log(`  ✅ 端口 ${port} 未被占用`);
        }
      }
    }
  });
});

console.log('');
console.log('💡 使用方法：');
console.log('1. 查看上面的端口占用情况');
console.log('2. 如果某个端口被占用，记录下 PID');
console.log('3. 使用以下命令关闭特定进程（不要关闭 openclaw）：');
console.log('   taskkill /PID <PID> /F');
console.log('');
console.log('⚠️  注意事项：');
console.log('- openclaw 控制台需要 Node.js 进程，请不要关闭');
console.log('- 只关闭占用端口的"无用进程"');
