# 快速回滚脚本
# 使用方法：./rollback.ps1 [backup-timestamp]

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupTimestamp
)

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 检查 Git 是否可用
function Test-Git {
    try {
        git --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

# 获取当前备份列表
function Get-BackupList {
    Write-ColorOutput "`n📦 可用备份列表：" "Yellow

    $backups = Get-ChildItem -Path "." -Directory | Where-Object {$_.Name -like "backup-*"} | Sort-Object CreationTime -Descending

    if ($backups.Count -eq 0) {
        Write-ColorOutput "❌ 没有找到备份文件夹" Red
        return @()
    }

    $backups | ForEach-Object {
        $uptime = (Get-Date) - $_.CreationTime
        Write-ColorOutput "  • $($_.Name) ($($_.CreationTime.ToString('yyyy-MM-dd HH:mm:ss')), 运行时间: $uptime)" Cyan
    }

    return $backups
}

# Git 回滚
function Invoke-GitRollback {
    Write-ColorOutput "`n🔄 Git 回滚操作..." Yellow

    # 获取最近 5 次提交
    Write-ColorOutput "`n📋 最近 5 次提交：" Cyan
    git log --oneline -5

    # 询问回滚到哪个提交
    $choice = Read-Host "`n请选择回滚目标（输入 commit hash 或 'HEAD~n' 回滚 n 次提交，默认 'HEAD~1'）"
    if (-not $choice) {
        $choice = "HEAD~1"
    }

    # 执行回滚
    Write-ColorOutput "`n⚠️  回滚到：$choice" Yellow
    $confirm = Read-Host "确认回滚？(y/n)"

    if ($confirm -eq "y" -or $confirm -eq "Y") {
        git reset --hard $choice
        Write-ColorOutput "✅ Git 回滚成功！" Green

        # 提示重启服务器
        Write-ColorOutput "`n💡 请重启服务器：" Yellow
        Write-ColorOutput "  1. 停止服务器（Ctrl + C）" White
        Write-ColorOutput "  2. 运行：npm run dev" White
    } else {
        Write-ColorOutput "❌ 取消回滚" Red
    }
}

# 备份文件回滚
function Invoke-BackupRollback {
    param([string]$BackupTimestamp)

    Write-ColorOutput "`n🔄 备份文件回滚操作..." Yellow

    # 获取备份列表
    $backups = Get-BackupList

    if ($backups.Count -eq 0) {
        return
    }

    # 选择备份
    if (-not $BackupTimestamp) {
        Write-ColorOutput "`n📦 可用备份列表：" Cyan
        $backups | ForEach-Object {
            Write-ColorOutput "  [$($backups.IndexOf($_) + 1)] $($_.Name)" White
        }

        $choice = Read-Host "`n请选择要回滚的备份（输入序号）"
        if (-not $choice -or $choice -lt 1 -or $choice -gt $backups.Count) {
            Write-ColorOutput "❌ 无效的选择" Red
            return
        }

        $BackupTimestamp = $backups[$choice - 1].Name
    } else {
        if (-not (Test-Path $BackupTimestamp)) {
            Write-ColorOutput "❌ 备份不存在：$BackupTimestamp" Red
            return
        }
    }

    # 确认回滚
    Write-ColorOutput "`n⚠️  回滚到：$BackupTimestamp" Yellow
    $confirm = Read-Host "确认回滚？(y/n)"

    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-ColorOutput "❌ 取消回滚" Red
        return
    }

    # 停止服务器提示
    Write-ColorOutput "`n⚠️  请先停止服务器（Ctrl + C）" Yellow
    $stopped = Read-Host "服务器已停止？(y/n)"
    if ($stopped -ne "y" -and $stopped -ne "Y") {
        Write-ColorOutput "❌ 请先停止服务器" Red
        return
    }

    # 回滚文件
    Write-ColorOutput "`n📁 正在回滚文件..." Yellow

    $backupPath = Join-Path "." $BackupTimestamp
    $filesToRestore = @("app", "src", ".env.local", "package.json", "next.config.js")

    foreach ($file in $filesToRestore) {
        $source = Join-Path $backupPath $file
        if (Test-Path $source) {
            Copy-Item -Path $source -Destination "." -Force -Recurse
            Write-ColorOutput "  ✅ $file" Green
        } else {
            Write-ColorOutput "  ⚠️  $file (不存在)" Yellow
        }
    }

    Write-ColorOutput "`n✅ 备份回滚成功！" Green

    # 提示后续操作
    Write-ColorOutput "`n💡 后续操作：" Yellow
    Write-ColorOutput "  1. 运行：npm install (如果修改了依赖)" White
    Write-ColorOutput "  2. 运行：npm run dev (重启服务器)" White
    Write-ColorOutput "  3. 测试：访问 http://localhost:3000" White
}

# 主函数
function Main {
    Write-ColorOutput "`n🔄 Architecture Showcase 快速回滚工具" Cyan
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" DarkGray

    # 检查 Git
    $hasGit = Test-Git
    if ($hasGit) {
        Write-ColorOutput "✅ Git 可用" Green
    } else {
        Write-ColorOutput "⚠️  Git 不可用" Yellow
    }

    # 显示选项
    Write-ColorOutput "`n📋 请选择回滚方式：" Yellow
    Write-ColorOutput "  [1] Git 回滚 (推荐)" White
    Write-ColorOutput "  [2] 备份文件回滚" White
    Write-ColorOutput "  [3] 查看备份列表" White
    Write-ColorOutput "  [4] 退出" White

    $choice = Read-Host "`n请选择（1-4）"

    switch ($choice) {
        "1" {
            if (-not $hasGit) {
                Write-ColorOutput "❌ Git 不可用，无法执行 Git 回滚" Red
                return
            }
            Invoke-GitRollback
        }
        "2" {
            Invoke-BackupRollback -BackupTimestamp $BackupTimestamp
        }
        "3" {
            Get-BackupList
        }
        "4" {
            Write-ColorOutput "👋 退出" Cyan
        }
        default {
            Write-ColorOutput "❌ 无效的选择" Red
        }
    }
}

# 执行主函数
Main
