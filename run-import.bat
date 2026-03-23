@echo off
chcp 65001 > nul
color 0A
title 案例数据导入工具

echo.
echo ================================================
echo      案例数据导入工具
echo ================================================
echo.

REM 检查 Supabase Service Role Key
if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
    echo.
    echo [信息] 正在检测 Supabase Service Role Key...
    echo.
    echo ⚠️  未找到环境变量 SUPABASE_SERVICE_ROLE_KEY
    echo.
    echo 📝 使用方法：
    echo.
    echo 方法 1：使用批处理文件设置环境变量
    echo   1. 在 Supabase Dashboard 中复制 service_role key
    echo   2. 双击运行此文件，会提示你输入 key
    echo.
    echo 方法 2：先设置环境变量，再运行此文件
    echo   set SUPABASE_SERVICE_ROLE_KEY=your_key
    echo   run-import.bat
    echo.
    echo 注意：service_role key 具有完全访问权限，请妥善保管
    echo.
    echo ================================================
    echo.

    set /p SERVICE_KEY=请输入 SUPABASE_SERVICE_ROLE_KEY:
    set "SUPABASE_SERVICE_ROLE_KEY=%SERVICE_KEY%"

    if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
        echo.
        echo ❌ 错误：未输入 Service Role Key
        echo.
        pause
        exit /b 1
    )

    echo.
    echo ✅ Service Role Key 已设置
    echo.
)

echo ✅ Service Role Key 已设置
echo 📊 项目：showcase-website
echo 📁 数据文件：src/data/cases.json
echo 🚀 开始导入...
echo ================================================
echo.
echo.

REM 先运行调试脚本
echo [1/2] 运行诊断检查...
echo ================================================
echo.

node debug-import.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 诊断失败！请查看上面的错误信息
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo ✅ 诊断通过！开始导入数据...
echo ================================================
echo.
echo.

REM 运行实际导入脚本
node simple-import.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo ✅ 导入完成！
    echo ================================================
    echo.
    echo 📋 后续步骤：
    echo   1. 访问 http://localhost:3000/admin
    echo   2. 使用管理员账号登录
    echo   3. 查看案例列表
    echo.
    echo 📖 详细文档：
    echo   - IMPORT_GUIDE.md （导入指南）
    echo   - ADMIN_GUIDE.md （管理后台）
    echo.
    echo ================================================
) else (
    echo.
    echo ================================================
    echo ❌ 导入失败！
    echo ================================================
    echo.
    echo 请检查：
    echo   1. Supabase 项目是否正常运行
    echo   2. 数据库表是否已创建
    echo   3. 网络连接是否正常
    echo   4. Service Role Key 是否正确
    echo.
    echo 详细的错误信息请查看脚本输出
    echo.
)

echo.
echo 按任意键退出...
pause > nul
