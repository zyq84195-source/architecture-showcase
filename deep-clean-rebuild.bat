@echo off
chcp 65001 >nul

echo ============================================================
echo   Deep Clean and Rebuild
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/7] Stop all Node.js processes...
taskkill /F /IM node.exe 2>nul
echo Processes stopped
echo.

echo [2/7] Clean .next cache...
if exist ".next" (
    rmdir /s /q ".next"
    echo .next cache removed
) else (
    echo .next cache not found
)
echo.

echo [3/7] Clean node_modules...
if exist "node_modules\.next" (
    rmdir /s /q "node_modules\.next"
    echo node_modules\.next removed
) else (
    echo node_modules\.next not found
)
echo.

echo [4/7] Clean package files...
if exist "package-lock.json" (
    del "package-lock.json"
    echo package-lock.json removed
) else (
    echo package-lock.json not found
)
if exist "yarn.lock" (
    del "yarn.lock"
    echo yarn.lock removed
)
echo.

echo [5/7] Verify supabase.ts content...
echo Current content:
type src\lib\supabase.ts
echo.
echo Press Enter to continue...
pause >nul
echo.

echo [6/7] Reinstall dependencies...
echo.
echo This may take a few minutes...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo Dependencies installed successfully
echo.

echo [7/7] Rebuild...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    echo.
    echo Troubleshooting:
    echo 1. Check supabase.ts content (shown above)
    echo 2. Check next.config.js transpilePackages
    echo 3. Run: npm run build --verbose
    pause
    exit /b 1
)
echo.
echo ============================================================
echo   SUCCESS: Rebuild completed!
echo ============================================================
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Visit: http://localhost:3000/search
echo 3. Test: internal search and web search
echo.
pause
