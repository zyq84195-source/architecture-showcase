# Simple Fix - Disable Transpilation
# Usage: powershell -ExecutionPolicy Bypass -File simple-build-fix-v2.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================"
Write-Host "  Simple Build Fix v2"
Write-Host "============================================================"
Write-Host ""

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nextConfigPath = Join-Path $projectDir "next.config.js"

# Step 1: Backup next.config.js
Write-Host "[1/3] Backup next.config.js..."
Copy-Item $nextConfigPath "$nextConfigPath.bak"
Write-Host "  Backed up: next.config.js"
Write-Host ""

# Step 2: Modify next.config.js to disable transpilation
Write-Host "[2/3] Modify next.config.js..."
$configContent = Get-Content $nextConfigPath -Raw

# Remove transpilePackages
$configContent = $configContent -replace "transpilePackages: \['architecture-search-framework'\],", "// transpilePackages: ['architecture-search-framework'], // Disabled to fix module resolution"

Set-Content $nextConfigPath $configContent -NoNewline
Write-Host "  Disabled transpilePackages"
Write-Host ""

# Step 3: Run build
Write-Host "[3/3] Run build..."
Set-Location $projectDir
npm run build
$exitCode = $LASTEXITCODE

if ($exitCode -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Restoring next.config.js..."
    Copy-Item "$nextConfigPath.bak" $nextConfigPath
    Write-Host "Restored."
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Build successful!"
Write-Host ""

Write-Host "============================================================"
Write-Host "  SUCCESS: Build completed!"
Write-Host "============================================================"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Run: npm run dev"
Write-Host "2. Visit: http://localhost:3000/search"
Write-Host "3. Test: internal search and web search"
Write-Host ""
Read-Host "Press Enter to exit"
