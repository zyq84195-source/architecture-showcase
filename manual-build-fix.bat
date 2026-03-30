@echo off
chcp 65001 >nul

echo ============================================================
echo   Manual Build Fix
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/4] Backup next.config.js...
copy next.config.js next.config.js.bak
echo Backup completed
echo.

echo [2/4] Edit next.config.js...
echo Find this line:
echo   transpilePackages: ['architecture-search-framework'],
echo.
echo And change it to:
echo   // transpilePackages: ['architecture-search-framework'], // Disabled to fix module resolution
echo.
echo Press Enter to continue...
pause >nul
echo.

echo [3/4] Run build...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    echo.
    echo Restoring backup...
    copy next.config.js.bak next.config.js
    echo Restored.
    echo.
    echo Please try:
    echo 1. Manually edit next.config.js and disable transpilePackages
    echo 2. Or run the alternative solution
    pause
    exit /b 1
)
echo Build successful!
echo.

echo [4/4] Clean up...
del next.config.js.bak
echo Backup removed
echo.

echo ============================================================
echo   SUCCESS
echo ============================================================
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Visit: http://localhost:3000/search
echo.
pause
