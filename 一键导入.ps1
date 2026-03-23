# PowerShell 导入脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       案例数据导入工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查项目目录
$projectDir = "C:\Users\zyq15\.openclaw\workspace\architecture-showcase"

if (-not (Test-Path $projectDir)) {
    Write-Host "❌ 错误：项目目录不存在: $projectDir" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 项目目录: $projectDir" -ForegroundColor Green
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误：未找到 Node.js" -ForegroundColor Red
    exit 1
}

# 获取 Supabase Service Role Key
Write-Host ""
Write-Host "请输入 Supabase Service Role Key:" -ForegroundColor Yellow
Write-Host "(在 Supabase Dashboard 中复制 service_role key)" -ForegroundColor Gray
$serviceKey = Read-Host "Service Role Key" -AsSecureString

if ([string]::IsNullOrEmpty($serviceKey)) {
    Write-Host "❌ 错误：未输入 Service Role Key" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 设置环境变量
$env:SUPABASE_SERVICE_ROLE_KEY = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($serviceKey)
)

Write-Host "✅ Service Role Key 已设置" -ForegroundColor Green
Write-Host ""

# 切换到项目目录
Set-Location $projectDir

# 运行导入脚本
Write-Host "开始导入..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

node simple-import.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ 导入完成！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "后续步骤：" -ForegroundColor Yellow
    Write-Host "  1. 访问 http://localhost:3000/admin" -ForegroundColor White
    Write-Host "  2. 使用管理员账号登录" -ForegroundColor White
    Write-Host "  3. 查看案例列表" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ 导入失败！" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查：" -ForegroundColor Yellow
    Write-Host "  1. Supabase 项目是否正常运行" -ForegroundColor White
    Write-Host "  2. 数据库表是否已创建" -ForegroundColor White
    Write-Host "  3. 网络连接是否正常" -ForegroundColor White
    Write-Host "  4. Service Role Key 是否正确" -ForegroundColor White
    Write-Host ""
}

Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
