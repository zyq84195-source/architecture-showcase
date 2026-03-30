@echo off
chcp 65001 >nul

echo ============================================================
echo   Fix Module Resolution Error
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/5] Fix architecture-search-framework package.json...
cd ..\architecture-search-framework
echo Package.json updated with specific versions
echo.

echo [2/5] Clean old dependencies...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo Old node_modules removed
)
if exist "package-lock.json" (
    del "package-lock.json"
    echo Old package-lock.json removed
)
echo.

echo [3/5] Install architecture-search-framework dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo Dependencies installed successfully
echo.

echo [4/5] Build architecture-search-framework...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo Build successful
echo.

cd ..\architecture-showcase

echo [5/5] Clean and reinstall architecture-showcase dependencies...
if exist "node_modules\architecture-search-framework" (
    rmdir /s /q "node_modules\architecture-search-framework"
    echo Old architecture-search-framework removed
)
echo.

echo Installing architecture-showcase dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo Dependencies installed successfully
echo.

echo Running build...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    echo.
    echo This might be due to:
    echo 1. Other module resolution issues
    echo 2. Next.js configuration problems
    echo 3. TypeScript compilation errors
    echo.
    echo Try running: npm run build --verbose
    pause
    exit /b 1
)
echo Build successful!
echo.

echo ============================================================
echo   SUCCESS: All issues fixed!
echo ============================================================
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Visit: http://localhost:3000/search
echo 3. Test: internal search and web search
echo.
pause
