@echo off
chcp 65001 >nul

echo ============================================================
echo   Fix Dynamic Require in architecture-search-framework
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/6] Backup source files...
cd ..\architecture-search-framework\src\models
copy /Y anthropic.ts anthropic.ts.bak
copy /Y openai.ts openai.ts.bak
copy /Y google.ts google.ts.bak
copy /Y zai.ts zai.ts.bak
copy /Y model-manager.ts model-manager.ts.bak
echo Backup completed
echo.

echo [2/6] Fix anthropic.ts...
powershell -Command "(Get-Content anthropic.ts) -replace 'this.client = require\('\'anthropic'\''\)''\.default;', 'import anthropic from '\''anthropic'\''; this.client = anthropic;' | Set-Content anthropic.ts"
echo anthropic.ts fixed
echo.

echo [3/6] Fix openai.ts...
powershell -Command "(Get-Content openai.ts) -replace 'this.client = require\('\'openai'\''\)''\.default;', 'import openai from '\''openai'\''; this.client = openai;' | Set-Content openai.ts"
echo openai.ts fixed
echo.

echo [4/6] Fix google.ts...
powershell -Command "(Get-Content google.ts) -replace 'this.client = require\('\'@google/generative-ai'\''\);', 'import { GoogleGenerativeAI } from '\''@google/generative-ai'\''; this.client = GoogleGenerativeAI;' | Set-Content google.ts"
echo google.ts fixed
echo.

echo [5/6] Rebuild architecture-search-framework...
cd ..\..
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo Build successful
echo.

echo [6/6] Restore backups...
cd ..\architecture-search-framework\src\models
del /Q anthropic.ts.bak
del /Q openai.ts.bak
del /Q google.ts.bak
del /Q zai.ts.bak
del /Q model-manager.ts.bak
echo Backups removed
echo.

cd ..\..\architecture-showcase

echo ============================================================
echo   SUCCESS: Dynamic requires fixed!
echo ============================================================
echo.
echo Next steps:
echo 1. Run: npm install
echo 2. Run: npm run build
echo 3. Test: npm run dev
echo.
pause
