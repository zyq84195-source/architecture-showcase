@echo off
chcp 65001 >nul

echo ============================================================
echo   Fix Build Issues
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking architecture-search-framework build...
cd ..\architecture-search-framework
if not exist "dist\index.js" (
    echo Building architecture-search-framework...
    call npm run build
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to build architecture-search-framework
        pause
        exit /b 1
    )
) else (
    echo architecture-search-framework already built
)
cd ..\architecture-showcase
echo.

echo [2/4] Reinstalling dependencies...
if exist "node_modules\architecture-search-framework" (
    echo Removing old architecture-search-framework...
    rmdir /s /q "node_modules\architecture-search-framework"
)
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo Dependencies installed successfully
echo.

echo [3/4] Running build...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    echo.
    echo Possible causes:
    echo 1. TypeScript compilation errors
    echo 2. Missing dependencies
    echo 3. Next.js configuration issues
    echo.
    echo Solutions:
    echo 1. Check build output above for specific errors
    echo 2. Run: npm run build --verbose
    echo 3. Check: next.config.js and tsconfig.json
    pause
    exit /b 1
)
echo Build successful!
echo.

echo [4/4] Cleaning up...
echo.
echo ============================================================
echo   SUCCESS: Build completed!
echo ============================================================
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Visit: http://localhost:3000/search
echo 3. Test: internal search and web search
echo.
pause
