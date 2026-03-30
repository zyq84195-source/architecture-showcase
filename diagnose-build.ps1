# Build Diagnostic Script for architecture-showcase
# Usage: powershell -ExecutionPolicy Bypass -File diagnose-build.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================"
Write-Host "  Build Diagnostic Tool"
Write-Host "============================================================"
Write-Host ""

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Step 1: Check Node.js version
Write-Host "[1/6] Checking Node.js version..."
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion"

if ([int]($nodeVersion -replace '\D', '') -lt 18) {
    Write-Host "WARNING: Node.js version should be 18 or higher" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Check npm version
Write-Host "[2/6] Checking npm version..."
$npmVersion = npm --version
Write-Host "npm version: $npmVersion"
Write-Host ""

# Step 3: Check dependencies
Write-Host "[3/6] Checking dependencies..."
Set-Location $projectDir

if (-not (Test-Path "node_modules")) {
    Write-Host "ERROR: node_modules not found" -ForegroundColor Red
    Write-Host "Running: npm install"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm install failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "node_modules found"
}

if (-not (Test-Path "node_modules\architecture-search-framework")) {
    Write-Host "ERROR: architecture-search-framework not found in node_modules" -ForegroundColor Red
    Write-Host "Running: npm install"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm install failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "architecture-search-framework found"
}
Write-Host ""

# Step 4: Check TypeScript config
Write-Host "[4/6] Checking TypeScript config..."
if (-not (Test-Path "tsconfig.json")) {
    Write-Host "WARNING: tsconfig.json not found" -ForegroundColor Yellow
} else {
    Write-Host "tsconfig.json found"
}

if (-not (Test-Path "next.config.js")) {
    Write-Host "WARNING: next.config.js not found" -ForegroundColor Yellow
} else {
    Write-Host "next.config.js found"
}
Write-Host ""

# Step 5: Check architecture-search-framework
Write-Host "[5/6] Checking architecture-search-framework..."
$frameworkDir = "..\architecture-search-framework"

if (-not (Test-Path $frameworkDir)) {
    Write-Host "ERROR: architecture-search-framework directory not found at $frameworkDir" -ForegroundColor Red
    Write-Host "Expected path: C:\Users\zyq15\.openclaw\workspace\architecture-search-framework"
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "$frameworkDir\package.json")) {
    Write-Host "ERROR: architecture-search-framework\package.json not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "$frameworkDir\dist\index.js")) {
    Write-Host "ERROR: architecture-search-framework\dist\index.js not found" -ForegroundColor Red
    Write-Host "Running: npm run build in architecture-search-framework"
    Set-Location $frameworkDir
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: architecture-search-framework build failed" -ForegroundColor Red
        Set-Location $projectDir
        Read-Host "Press Enter to exit"
        exit 1
    }
    Set-Location $projectDir
} else {
    Write-Host "architecture-search-framework\dist\index.js found"
}
Write-Host ""

# Step 6: Run build
Write-Host "[6/6] Running build..."
Write-Host "Command: npm run build"
Write-Host ""

npm run build
$buildExitCode = $LASTEXITCODE

Write-Host ""
Write-Host "============================================================"
Write-Host "  Build Status"
Write-Host "============================================================"

if ($buildExitCode -eq 0) {
    Write-Host "SUCCESS: Build completed successfully!" -ForegroundColor Green
} else {
    Write-Host "FAILED: Build failed with exit code $buildExitCode" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:"
    Write-Host "1. TypeScript compilation errors"
    Write-Host "2. Missing dependencies"
    Write-Host "3. Next.js configuration issues"
    Write-Host "4. architecture-search-framework not built"
    Write-Host ""
    Write-Host "Solutions:"
    Write-Host "1. Run: npm install"
    Write-Host "2. Check: npm run build --verbose"
    Write-Host "3. Clean: Remove-Item node_modules -Recurse; npm install"
}

Write-Host ""
Read-Host "Press Enter to exit"
