# 快速部署脚本
# 使用方法：./deploy.ps1 [mode]
# mode: dev | test | build

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "test", "build")]
    [string]$Mode = "dev"
)

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 检查依赖
function Test-Dependencies {
    Write-ColorOutput "`n🔍 检查依赖..." Yellow

    if (-not (Test-Path "node_modules")) {
        Write-ColorOutput "❌ node_modules 不存在" Red
        Write-ColorOutput "📦 正在安装依赖..." Yellow
        npm install

        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ 依赖安装失败" Red
            return $false
        }

        Write-ColorOutput "✅ 依赖安装成功" Green
    } else {
        Write-ColorOutput "✅ 依赖已安装" Green
    }

    return $true
}

# 检查环境变量
function Test-EnvironmentVariables {
    Write-ColorOutput "`n🔍 检查环境变量..." Yellow

    $envFile = ".env.local"

    if (-not (Test-Path $envFile)) {
        Write-ColorOutput "⚠️  $envFile 不存在" Yellow
        Write-ColorOutput "📝 正在创建环境变量文件..." Yellow

        # 创建基本的环境变量文件
        $envContent = @"
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key
SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Architecture Search Framework 配置
ZAI_API_KEY=your_zai_api_key
TAVILY_API_KEY=your_tavily_api_key

# 禁用 Turbopack（Windows 兼容性问题）
NEXT_PRIVATE_DISABLE_TURBO=1
"@

        $envContent | Out-File -FilePath $envFile -Encoding UTF8
        Write-ColorOutput "✅ 环境变量文件已创建" Green
        Write-ColorOutput "⚠️  请配置 TAVILY_API_KEY 和 ZAI_API_KEY" Yellow
    } else {
        Write-ColorOutput "✅ 环境变量文件存在" Green

        # 检查关键环境变量
        $envContent = Get-Content $envFile
        if (-not $envContent -match "TAVILY_API_KEY=" -or -not $envContent -match "ZAI_API_KEY=") {
            Write-ColorOutput "⚠️  请检查 TAVILY_API_KEY 和 ZAI_API_KEY 配置" Yellow
        }
    }

    return $true
}

# 开发模式部署
function Invoke-DevDeploy {
    Write-ColorOutput "`n🚀 开发模式部署" Cyan
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" DarkGray

    # 检查依赖
    if (-not (Test-Dependencies)) {
        return
    }

    # 检查环境变量
    if (-not (Test-EnvironmentVariables)) {
        return
    }

    # 检查端口占用
    Write-ColorOutput "`n🔍 检查端口占用..." Yellow

    $port3000InUse = netstat -ano | Select-String ":3000.*LISTENING"
    $port3002InUse = netstat -ano | Select-String ":3002.*LISTENING"

    if ($port3000InUse) {
        Write-ColorOutput "⚠️  端口 3000 已被占用" Yellow
        $killProcess = Read-Host "是否终止占用端口的进程？(y/n)"
        if ($killProcess -eq "y" -or $killProcess -eq "Y") {
            $pid = ($port3000InUse | Select-Object -First 1) -split '\s+' | Select-Object -Last 1
            Stop-Process -Id $pid -Force
            Write-ColorOutput "✅ 已终止进程 PID：$pid" Green
        }
    }

    if ($port3002InUse) {
        Write-ColorOutput "⚠️  端口 3002 已被占用" Yellow
        $killProcess = Read-Host "是否终止占用端口的进程？(y/n)"
        if ($killProcess -eq "y" -or $killProcess -eq "Y") {
            $pid = ($port3002InUse | Select-Object -First 1) -split '\s+' | Select-Object -Last 1
            Stop-Process -Id $pid -Force
            Write-ColorOutput "✅ 已终止进程 PID：$pid" Green
        }
    }

    # 启动开发服务器
    Write-ColorOutput "`n🚀 启动开发服务器..." Yellow

    Write-ColorOutput "`n📦 Next.js 开发服务器：" Cyan
    Write-ColorOutput "  地址：http://localhost:3000" White
    Write-ColorOutput "  命令：npm run dev" White

    npm run dev

    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "`n❌ 开发服务器启动失败" Red
        return
    }
}

# 测试模式部署
function Invoke-TestDeploy {
    Write-ColorOutput "`n🧪 测试模式部署" Cyan
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" DarkGray

    # 检查依赖
    if (-not (Test-Dependencies)) {
        return
    }

    # 检查环境变量
    if (-not (Test-EnvironmentVariables)) {
        return
    }

    # 运行测试
    Write-ColorOutput "`n🧪 运行测试..." Yellow

    # 测试 1：首页访问
    Write-ColorOutput "`n📝 测试 1：首页访问" Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        Write-ColorOutput "  ✅ 首页可访问（状态码：$($response.StatusCode)）" Green
    } catch {
        Write-ColorOutput "  ❌ 首页无法访问（$($_.Exception.Message)）" Red
    }

    # 测试 2：搜索功能
    Write-ColorOutput "`n📝 测试 2：搜索功能" Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/search-service?q=test" -UseBasicParsing -TimeoutSec 10
        $data = $response.Content | ConvertFrom-Json

        if ($data.success) {
            Write-ColorOutput "  ✅ 搜索功能正常（结果数：$($data.count)）" Green
        } else {
            Write-ColorOutput "  ❌ 搜索功能异常（$($data.error)）" Red
        }
    } catch {
        Write-ColorOutput "  ❌ 搜索功能异常（$($_.Exception.Message)）" Red
    }

    # 测试 3：环境变量
    Write-ColorOutput "`n📝 测试 3：环境变量" Yellow

    $envFile = ".env.local"
    if (Test-Path $envFile) {
        Write-ColorOutput "  ✅ 环境变量文件存在" Green

        $envContent = Get-Content $envFile
        if ($envContent -match "TAVILY_API_KEY=") {
            Write-ColorOutput "  ✅ TAVILY_API_KEY 已配置" Green
        } else {
            Write-ColorOutput "  ⚠️  TAVILY_API_KEY 未配置" Yellow
        }
    } else {
        Write-ColorOutput "  ❌ 环境变量文件不存在" Red
    }

    Write-ColorOutput "`n✅ 测试完成！" Green
}

# 生产构建
function Invoke-ProductionBuild {
    Write-ColorOutput "`n🏗️  生产构建" Cyan
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" DarkGray

    # 检查依赖
    if (-not (Test-Dependencies)) {
        return
    }

    # 检查环境变量
    if (-not (Test-EnvironmentVariables)) {
        return
    }

    # 创建备份
    Write-ColorOutput "`n📦 创建备份..." Yellow
    & .\backup.ps1

    # 清理构建缓存
    Write-ColorOutput "`n🧹 清理构建缓存..." Yellow
    if (Test-Path ".next") {
        Remove-Item -Path ".next" -Recurse -Force
        Write-ColorOutput "  ✅ .next 目录已清理" Green
    }

    # 执行构建
    Write-ColorOutput "`n🏗️  正在构建..." Yellow
    npm run build

    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "`n❌ 构建失败" Red
        Write-ColorOutput "💡 提示：运行 ./rollback.ps1 可以回滚到备份" Yellow
        return
    }

    Write-ColorOutput "`n✅ 构建成功！" Green
    Write-ColorOutput "`n📋 构建输出：" Cyan
    Write-ColorOutput "  📁 .next/ - 构建输出" White
    Write-ColorOutput "  📁 .next/static/ - 静态资源" White
    Write-ColorOutput "  📁 .next/server/ - 服务器代码" White

    # 询问是否启动生产服务器
    $startServer = Read-Host "`n是否启动生产服务器？(y/n)"
    if ($startServer -eq "y" -or $startServer -eq "Y") {
        Write-ColorOutput "`n🚀 启动生产服务器..." Yellow
        npm run start
    }
}

# 主函数
function Main {
    Write-ColorOutput "`n🚀 Architecture Showcase 快速部署工具" Cyan
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" DarkGray

    switch ($Mode) {
        "dev" {
            Invoke-DevDeploy
        }
        "test" {
            Invoke-TestDeploy
        }
        "build" {
            Invoke-ProductionBuild
        }
        default {
            Write-ColorOutput "❌ 无效的模式" Red
        }
    }
}

# 执行主函数
Main
