# Architecture Search Framework Integration - Git Commit Script
# Usage: powershell -ExecutionPolicy Bypass -File commit-framework-integration.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================"
Write-Host "  Commit Architecture Search Framework Integration"
Write-Host "============================================================"
Write-Host ""

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Step 1: Git Status
Write-Host "[1/4] Checking Git status..."
Set-Location $projectDir
$gitStatus = git status --short

if ([string]::IsNullOrEmpty($gitStatus)) {
    Write-Host "No changes to commit."
    Write-Host ""
    exit 0
}

Write-Host "Changes detected:"
Write-Host $gitStatus
Write-Host ""

# Step 2: Git Add
Write-Host "[2/4] Adding files to Git..."
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git add failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Files added successfully."
Write-Host ""

# Step 3: Git Commit
Write-Host "[3/4] Committing changes..."
$commitMessage = @"
feat: integrate Architecture Search Framework

- Add web search API (/api/web-search)
- Add comparison API (/api/web-compare)
- Update search page with mode switch (internal / web)
- Keep original internal search functionality
- Update environment variables (ZAI_API_KEY, TAVILY_API_KEY)
- Add integration documentation
"@

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git commit failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Commit successful."
Write-Host ""

# Step 4: Git Push
Write-Host "[4/4] Pushing to GitHub..."
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Git push failed" -ForegroundColor Yellow
    Write-Host "Please check your network or authentication."
    Write-Host "You can manually run: git push"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Push successful."
Write-Host ""

Write-Host "============================================================"
Write-Host "  SUCCESS: Code pushed to GitHub!"
Write-Host "============================================================"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Visit Vercel project settings: https://vercel.com/your-project/settings/environment-variables"
Write-Host "2. Add these environment variables:"
Write-Host "   - ZAI_API_KEY=9546abcd96dd456bbd880ae3bb1ac917.li0XljgB4bTXhinx"
Write-Host "   - TAVILY_API_KEY=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"
Write-Host "3. Wait for Vercel auto-deployment"
Write-Host "4. Visit production site to verify functionality"
Write-Host ""
Read-Host "Press Enter to exit"
