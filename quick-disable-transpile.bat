@echo off
chcp 65001 >nul

echo ============================================================
echo   Quick Fix - Disable Transpile Packages
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/2] Backup next.config.js...
if exist next.config.js.bak del next.config.js.bak
copy next.config.js next.config.js.bak
echo Backup completed
echo.

echo [2/2] Disable transpilePackages...
powershell -Command "(Get-Content next.config.js) -replace \"transpilePackages: \['architecture-search-framework'\],\", \"// transpilePackages: ['architecture-search-framework'], // Disabled to fix module resolution\" | Set-Content next.config.js"
echo TranspilePackages disabled
echo.

echo ============================================================
echo   SUCCESS
echo ============================================================
echo.
echo Next steps:
echo 1. Run: npm run build
echo 2. If success, run: npm run dev
echo 3. Visit: http://localhost:3000/search
echo.
echo If build fails:
echo   Restore backup: copy next.config.js.bak next.config.js
echo.
pause
