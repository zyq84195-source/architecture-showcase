# Fix Dynamic Require in architecture-search-framework
# Usage: powershell -ExecutionPolicy Bypass -File fix-dynamic-require.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================"
Write-Host "  Fix Dynamic Require in architecture-search-framework"
Write-Host "============================================================"
Write-Host ""

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frameworkSrcDir = Join-Path $projectDir "..\architecture-search-framework\src\models"

# Step 1: Backup source files
Write-Host "[1/6] Backup source files..."

$filesToBackup = @(
    "anthropic.ts",
    "openai.ts",
    "google.ts",
    "zai.ts",
    "model-manager.ts"
)

foreach ($file in $filesToBackup) {
    $filePath = Join-Path $frameworkSrcDir $file
    if (Test-Path $filePath) {
        Copy-Item $filePath "$filePath.bak"
        Write-Host "  Backed up: $file"
    }
}

Write-Host "Backup completed."
Write-Host ""

# Step 2: Fix anthropic.ts
Write-Host "[2/6] Fix anthropic.ts..."
$anthropicPath = Join-Path $frameworkSrcDir "anthropic.ts"
$anthropicContent = Get-Content $anthropicPath -Raw
$anthropicContent = $anthropicContent -replace "this\.client = require\('anthropic'\)\.default;", "import anthropic from 'anthropic';`r`n  this.client = anthropic;"
Set-Content $anthropicPath $anthropicContent -NoNewline
Write-Host "  anthropic.ts fixed"
Write-Host ""

# Step 3: Fix openai.ts
Write-Host "[3/6] Fix openai.ts..."
$openaiPath = Join-Path $frameworkSrcDir "openai.ts"
$openaiContent = Get-Content $openaiPath -Raw
$openaiContent = $openaiContent -replace "this\.client = require\('openai'\)\.default;", "import openai from 'openai';`r`n  this.client = openai;"
Set-Content $openaiPath $openaiContent -NoNewline
Write-Host "  openai.ts fixed"
Write-Host ""

# Step 4: Fix google.ts
Write-Host "[4/6] Fix google.ts..."
$googlePath = Join-Path $frameworkSrcDir "google.ts"
$googleContent = Get-Content $googlePath -Raw
$googleContent = $googleContent -replace "this\.client = require\('@google/generative-ai'\);", "import { GoogleGenerativeAI } from '@google/generative-ai';`r`n  this.client = GoogleGenerativeAI;"
Set-Content $googlePath $googleContent -NoNewline
Write-Host "  google.ts fixed"
Write-Host ""

# Step 5: Rebuild architecture-search-framework
Write-Host "[5/6] Rebuild architecture-search-framework..."
$frameworkDir = Join-Path $projectDir "..\architecture-search-framework"
Set-Location $frameworkDir
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    Set-Location $projectDir
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Build successful."
Write-Host ""

# Step 6: Restore backups
Write-Host "[6/6] Restore backups..."
Set-Location $frameworkSrcDir

foreach ($file in $filesToBackup) {
    $backupPath = Join-Path $frameworkSrcDir "$file.bak"
    if (Test-Path $backupPath) {
        Remove-Item $backupPath
        Write-Host "  Removed: $file.bak"
    }
}

Write-Host "Backups removed."
Write-Host ""

Set-Location $projectDir

Write-Host "============================================================"
Write-Host "  SUCCESS: Dynamic requires fixed!"
Write-Host "============================================================"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Run: npm install"
Write-Host "2. Run: npm run build"
Write-Host "3. Test: npm run dev"
Write-Host ""
Read-Host "Press Enter to exit"
