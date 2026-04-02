# 自动备份脚本
# 使用方法：./backup.ps1 [description]

param(
    [Parameter(Mandatory=$false)]
    [string]$Description
)

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 获取当前时间戳
function Get-Timestamp {
    return Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
}

# 创建备份
function Invoke-CreateBackup {
    param([string]$Description)

    $timestamp = Get-Timestamp
    $backupName = "backup-$timestamp"
    $backupPath = Join-Path "." $backupName

    Write-ColorOutput "`n🔄 Architecture Showcase 自动备份工具" Cyan
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" DarkGray

    # 检查是否已有同名备份
    if (Test-Path $backupPath) {
        Write-ColorOutput "❌ 备份已存在：$backupName" Red
        $confirm = Read-Host "是否覆盖现有备份？(y/n)"
        if ($confirm -ne "y" -and $confirm -ne "Y") {
            Write-ColorOutput "❌ 取消备份" Red
            return
        }
        Remove-Item -Path $backupPath -Recurse -Force
    }

    # 创建备份目录
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    Write-ColorOutput "📦 创建备份：$backupName" Green

    # 要备份的文件和目录
    $itemsToBackup = @(
        @{Path="app"; Description="应用代码"},
        @{Path="src"; Description="源代码"},
        @{Path="public"; Description="静态资源"},
        @{Path=".env.local"; Description="环境变量"},
        @{Path="package.json"; Description="依赖配置"},
        @{Path="package-lock.json"; Description="依赖锁定"},
        @{Path="next.config.js"; Description="Next.js 配置"},
        @{Path="tsconfig.json"; Description="TypeScript 配置"},
        @{Path="tailwind.config.ts"; Description="Tailwind 配置"}
    )

    # 复制文件到备份目录
    Write-ColorOutput "`n📁 正在备份文件..." Yellow
    $backupLog = @()

    foreach ($item in $itemsToBackup) {
        $sourcePath = Join-Path "." $item.Path
        $destPath = Join-Path $backupPath $item.Path

        if (Test-Path $sourcePath) {
            try {
                Copy-Item -Path $sourcePath -Destination $destPath -Force -Recurse
                Write-ColorOutput "  ✅ $($item.Description) ($($item.Path))" Green
                $backupLog += "✅ $($item.Description)"
            } catch {
                Write-ColorOutput "  ❌ $($item.Description) ($($item.Path)) - $($_.Exception.Message)" Red
                $backupLog += "❌ $($item.Description): $($_.Exception.Message)"
            }
        } else {
            Write-ColorOutput "  ⚠️  $($item.Description) ($($item.Path)) - 不存在" Yellow
            $backupLog += "⚠️  $($item.Description): 文件不存在"
        }
    }

    # 创建备份信息文件
    $backupInfo = @{
        Timestamp = $timestamp
        DateTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Description = if ($Description) { $Description } else { "手动备份" }
        BackedUpItems = $backupLog
        GitCommit = (git rev-parse HEAD 2>$null)
        GitBranch = (git rev-parse --abbrev-ref HEAD 2>$null)
    } | ConvertTo-Json -Depth 3

    $infoFilePath = Join-Path $backupPath "BACKUP_INFO.json"
    $backupInfo | Out-File -FilePath $infoFilePath -Encoding UTF8

    # 显示备份摘要
    Write-ColorOutput "`n✅ 备份完成！" Green
    Write-ColorOutput "`n📋 备份信息：" Cyan
    Write-ColorOutput "  📦 备份名称：$backupName" White
    Write-ColorOutput "  🕐 备份时间：$($backupInfo.DateTime)" White
    Write-ColorOutput "  📝 备份描述：$($backupInfo.Description)" White
    Write-ColorOutput "  📂 备份路径：$backupPath" White

    if ($backupInfo.GitCommit) {
        Write-ColorOutput "  🌿 Git 提交：$($backupInfo.GitCommit.Substring(0, 7))" White
    }

    if ($backupInfo.GitBranch) {
        Write-ColorOutput "  🌿 Git 分支：$($backupInfo.GitBranch)" White
    }

    # 创建 Git 提交（可选）
    $createCommit = Read-Host "`n是否创建 Git 提交？(y/n)"
    if ($createCommit -eq "y" -or $createCommit -eq "Y") {
        Write-ColorOutput "`n🌿 创建 Git 提交..." Yellow

        $commitMessage = if ($Description) { "backup: $Description" } else { "backup: 自动备份" }

        git add $backupPath
        git commit -m $commitMessage

        Write-ColorOutput "  ✅ Git 提交成功" Green
    }

    Write-ColorOutput "`n💡 提示：使用 ./rollback.ps1 可以快速回滚" Yellow
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" DarkGray
}

# 清理旧备份
function Invoke-CleanOldBackups {
    Write-ColorOutput "`n🧹 清理旧备份..." Yellow

    $backups = Get-ChildItem -Path "." -Directory | Where-Object {$_.Name -like "backup-*"} | Sort-Object CreationTime -Descending

    if ($backups.Count -le 5) {
        Write-ColorOutput "  ✅ 备份数量正常（$($backups.Count) 个），无需清理" Green
        return
    }

    Write-ColorOutput "`n⚠️  发现 $($backups.Count) 个备份，保留最近的 5 个" Yellow

    $backupsToRemove = $backups | Select-Object -Skip 5

    foreach ($backup in $backupsToRemove) {
        Write-ColorOutput "  🗑️  删除：$($backup.Name)" Yellow
        Remove-Item -Path $backup.FullName -Recurse -Force
    }

    Write-ColorOutput "  ✅ 已删除 $($backupsToRemove.Count) 个旧备份" Green
}

# 主函数
function Main {
    # 获取描述
    if (-not $Description) {
        $Description = Read-Host "请输入备份描述（可选，按 Enter 跳过）"
    }

    # 创建备份
    Invoke-CreateBackup -Description $Description

    # 询问是否清理旧备份
    $cleanBackups = Read-Host "`n是否清理旧备份？(保留最近 5 个) (y/n)"
    if ($cleanBackups -eq "y" -or $cleanBackups -eq "Y") {
        Invoke-CleanOldBackups
    }
}

# 执行主函数
Main
