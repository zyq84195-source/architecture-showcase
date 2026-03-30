@echo off
echo ============================================================
echo   Quick Build Fix
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/4] Build architecture-search-framework...
cd ..\architecture-search-framework
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo Build successful
cd ..\architecture-showcase
echo.

echo [2/4] Clean old dependencies...
if exist "node_modules\architecture-search-framework" (
    rmdir /s /q "node_modules\architecture-search-framework"
    echo Old dependencies removed
)
echo.

echo [3/4] Install dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Install failed
    pause
    exit /b 1
)
echo Dependencies installed
echo.

echo [4/4] Run build...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    echo.
    echo Try these solutions:
    echo 1. Run: npm run build --verbose
    echo 2. Check: BUILD_ERROR_SOLUTION.md
    echo 3. Clean: rmdir /s /q node_modules && npm install
    pause
    exit /b 1
)
echo Build successful!
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
