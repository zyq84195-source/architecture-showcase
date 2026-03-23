@echo off
chcp 65001 >nul

echo ============================================================
echo   Commit Architecture Search Framework Integration
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/4] Adding files to Git...
git add .
if %ERRORLEVEL% neq 0 (
    echo ERROR: Git add failed
    pause
    exit /b 1
)
echo Files added successfully.
echo.

echo [2/4] Committing changes...
git commit -m "feat: integrate Architecture Search Framework - Add web search API - Add comparison API - Update search page with mode switch - Keep original internal search functionality - Update environment variables"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Git commit failed
    pause
    exit /b 1
)
echo Commit successful.
echo.

echo [3/4] Pushing to GitHub...
git push
if %ERRORLEVEL% neq 0 (
    echo WARNING: Git push failed
    echo Please check your network or authentication.
    echo You can manually run: git push
    pause
    exit /b 1
)
echo Push successful.
echo.

echo ============================================================
echo   SUCCESS: Code pushed to GitHub!
echo ============================================================
echo.
echo Next steps:
echo 1. Visit Vercel project settings
echo 2. Add these environment variables:
echo    ZAI_API_KEY=9546abcd96dd456bbd880ae3bb1ac917.li0XljgB4bTXhinx
echo    TAVILY_API_KEY=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
echo 3. Wait for Vercel auto-deployment
echo 4. Visit production site to verify functionality
echo.
pause
