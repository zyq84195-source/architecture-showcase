@echo off
chcp 65001 >nul

echo ╔════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   提交 Architecture Search Framework 集成到 GitHub    ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/4] 添加所有文件到 Git...
git add .
if %ERRORLEVEL% neq 0 (
    echo ❌ Git add 失败
    pause
    exit /b 1
)
echo ✅ 文件已添加
echo.

echo [2/4] 提交更改...
git commit -m "feat: 集成 Architecture Search Framework

- 添加全网搜索 API (/api/web-search)
- 添加对比分析 API (/api/web-compare)
- 更新搜索页面，支持模式切换（内部搜索 / 全网搜索）
- 保留原有的内部搜索功能
- 更新环境变量配置（添加 ZAI_API_KEY 和 TAVILY_API_KEY）
- 添加集成文档（FRAMEWORK_INTEGRATION_UPDATE.md）
- 添加集成脚本（备份、回滚、快速集成）"
if %ERRORLEVEL% neq 0 (
    echo ❌ Git commit 失败
    pause
    exit /b 1
)
echo ✅ 提交成功
echo.

echo [3/4] 推送到 GitHub...
git push
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Git push 失败，请检查网络或认证
    echo 💡 提示：你可以稍后手动运行: git push
    pause
    exit /b 1
)
echo ✅ 推送成功
echo.

echo [4/4] 完成！
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   ✅ 代码已成功推送到 GitHub！                           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📝 下一步操作：
echo.
echo 1. 访问 Vercel 项目设置：https://vercel.com/your-project/settings/environment-variables
echo 2. 添加以下环境变量：
echo    - ZAI_API_KEY=9546abcd96dd456bbd880ae3bb1ac917.li0XljgB4bTXhinx
echo    - TAVILY_API_KEY=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
echo 3. 等待 Vercel 自动部署完成
echo 4. 访问生产环境，验证功能正常
echo.
pause
