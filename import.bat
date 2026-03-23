@echo off
chcp 65001 > nul
echo ================================================
echo      案例数据导入工具
echo ================================================
echo.

REM 检查 Supabase Service Role Key
if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
    echo ❌ 错误：未找到 SUPABASE_SERVICE_ROLE_KEY 环境变量
    echo.
    echo 使用方法：
    echo   1. 在 Supabase Dashboard 中复制 service_role_key
    echo   2. 运行命令：
    echo      set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    echo      node scripts/full-import.js
    echo.
    echo 或者：
    echo   1. 设置环境变量
    echo   2. 运行本脚本
    echo.
    echo 注意：service_role_key 具有完全访问权限，请妥善保管
    echo.
    pause
    exit /b 1
)

echo ✅ Service Role Key 已设置
echo 📊 项目：showcase-website
echo 📁 数据文件：src/data/cases.json
echo.
echo 开始导入...
echo ================================================
echo.

REM 运行导入脚本
node scripts/full-import.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo ✅ 导入完成！
    echo ================================================
) else (
    echo.
    echo ================================================
    echo ❌ 导入失败！
    echo ================================================
)

echo.
pause
