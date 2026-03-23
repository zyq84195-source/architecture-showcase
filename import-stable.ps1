# PowerShell 稳定版导入脚本

$ErrorActionPreference = "Continue"
$host.UI.RawUI.WindowTitle = "案例数据导入工具"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       案例数据导入工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查项目目录
$projectDir = "C:\Users\zyq15\.openclaw\workspace\architecture-showcase"

if (-not (Test-Path $projectDir)) {
    Write-Host "❌ 错误：项目目录不存在" -ForegroundColor Red
    Write-Host "   期望路径: $projectDir" -ForegroundColor Red
    Write-Host ""
    Write-Host "按任意键退出..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✅ 项目目录: $projectDir" -ForegroundColor Green
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "未找到 Node.js"
    }
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误：未找到 Node.js" -ForegroundColor Red
    Write-Host "   请先安装 Node.js: https://nodejs.org" -ForegroundColor Red
    Write-Host ""
    Write-Host "按任意键退出..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# 获取 Supabase Service Role Key
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 1/3：获取 Supabase Service Role Key" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请在浏览器中打开以下链接：" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "然后：" -ForegroundColor Yellow
Write-Host "  1. 选择项目: showcase-website" -ForegroundColor White
Write-Host "  2. 点击左侧: Settings -> API" -ForegroundColor White
Write-Host "  3. 复制 service_role key" -ForegroundColor White
Write-Host ""
Write-Host "按回车继续..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "请输入 Service Role Key:" -ForegroundColor Yellow
Write-Host "(不要在公屏显示，输入后按回车)" -ForegroundColor Gray
$serviceKey = Read-Host "Service Role Key"

if ([string]::IsNullOrEmpty($serviceKey)) {
    Write-Host ""
    Write-Host "❌ 错误：未输入 Service Role Key" -ForegroundColor Red
    Write-Host "按任意键退出..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "✅ Service Role Key 已设置（长度: $($serviceKey.Length) 字符）" -ForegroundColor Green

# 切换到项目目录
Write-Host ""
Write-Host "切换到项目目录..." -ForegroundColor Yellow
Set-Location $projectDir

# 检查脚本文件
Write-Host "检查脚本文件..." -ForegroundColor Yellow
if (-not (Test-Path "simple-import.js")) {
    Write-Host "❌ 错误：未找到 simple-import.js" -ForegroundColor Red
    Write-Host "   当前目录: $(Get-Location)" -ForegroundColor Red
    Write-Host ""
    Write-Host "按任意键退出..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✅ 脚本文件存在" -ForegroundColor Green

# 设置环境变量
$env:SUPABASE_SERVICE_ROLE_KEY = $serviceKey

# 运行导入脚本
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 2/3：运行导入脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $result = node simple-import.js 2>&1
    $exitCode = $LASTEXITCODE

    Write-Host ""
    Write-Host $result

    if ($exitCode -eq 0) {
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
        Write-Host "❌ 导入失败 (退出码: $exitCode)" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "请检查错误信息：" -ForegroundColor Yellow
        Write-Host "  1. Supabase 项目是否正常运行" -ForegroundColor White
        Write-Host "  2. 数据库表是否已创建" -ForegroundColor White
        Write-Host "  3. Service Role Key 是否正确" -ForegroundColor White
        Write-Host "  4. 网络连接是否正常" -ForegroundColor White
        Write-Host ""
    }

} catch {
    Write-Host ""
    Write-Host "❌ 脚本执行错误: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "错误详情: $_" -ForegroundColor Red
    Write-Host ""
}

# 最终提示
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 3/3：完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
