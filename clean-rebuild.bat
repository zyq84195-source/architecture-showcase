@echo off
chcp 65001 >nul

echo ============================================================
echo   Clean and Rebuild
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/5] Clean Next.js cache...
if exist ".next" (
    rmdir /s /q ".next"
    echo .next cache removed
) else (
    echo .next cache not found
)
echo.

echo [2/5] Clean node_modules...
if exist "node_modules\.next" (
    rmdir /s /q "node_modules\.next"
    echo node_modules\.next removed
)
echo.

echo [3/5] Verify supabase.ts...
type src\lib\supabase.ts
echo.
echo Press Enter to continue...
pause >nul
echo.

echo [4/5] Rebuild...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    echo.
    echo Try manual steps:
    echo 1. Verify next.config.js
    echo 2. Run: npm run build --verbose
    echo 3. Check: npm run dev
    pause
    exit /b 1
)
echo Build successful!
echo.

echo [5/5] Test dev server...
echo.
echo Starting dev server in 5 seconds...
timeout /t 5 >nul
call npm run dev
