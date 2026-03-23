@echo off
chcp 65001 > nul

echo ================================================
echo       案例数据导入工具
echo ================================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误：未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
echo.

REM 检查脚本文件
if not exist "simple-import.js" (
    echo ❌ 错误：未找到 simple-import.js
    echo 当前目录: %CD%
    echo.
    pause
    exit /b 1
)

echo ✅ 脚本文件存在
echo.

echo ================================================
echo       步骤 1/3：获取 Service Role Key
echo ================================================
echo.
echo 请在浏览器中打开：
echo https://supabase.com/dashboard
echo.
echo 然后执行：
echo   1. 选择项目: showcase-website
echo   2. Settings -^> API
echo   3. 复制 service_role key
echo.
echo ================================================
echo.

set /p SERVICE_KEY=请输入 Service Role Key:

if "%SERVICE_KEY%"=="" (
    echo.
    echo ❌ 错误：未输入 Service Role Key
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Service Role Key 已设置
echo.

REM 设置环境变量
set "SUPABASE_SERVICE_ROLE_KEY=%SERVICE_KEY%"

echo ================================================
echo       步骤 2/3：运行导入脚本
echo ================================================
echo.
echo 开始导入...
echo.

REM 运行导入
node simple-import.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo ✅ 导入完成！
    echo ================================================
    echo.
    echo 后续步骤：
    echo   1. 访问 http://localhost:3000/admin
    echo   2. 使用管理员账号登录
    echo   3. 查看案例列表
    echo.
) else (
    echo.
    echo ================================================
    echo ❌ 导入失败！
    echo ================================================
    echo.
    echo 请检查：
    echo   1. Supabase 项目是否正常运行
    echo   2. 数据库表是否已创建
    echo   3. Service Role Key 是否正确
    echo   4. 网络连接是否正常
    echo.
)

echo ================================================
echo       步骤 3/3：完成
echo ================================================
echo.

pause
