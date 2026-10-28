@echo off
rem ============================================================
rem   Whale Station - one-click publish from hexo-admin Deploy
rem   usage: deploy-scpt.cmd "commit message"
rem   flow: hexo generate -> git add/commit -> git push (triggers
rem         GitHub Actions to rebuild & publish blog.10vewhale.top)
rem ============================================================
setlocal
cd /d "%~dp0"

rem 1) regenerate static site
call npx hexo generate
if errorlevel 1 goto genfail

rem 2) stage all changes (posts, pages, config, assets)
git add -A
if errorlevel 1 goto gitfail
git status --short

rem 3) commit
git commit -m "%~1" >nul 2>&1
if errorlevel 1 goto commitfail

rem 4) push to origin main (SSH over 443 via ~/.ssh/config)
git push origin main
if errorlevel 1 goto pushfail

echo.
echo [OK] published. GitHub Actions is rebuilding the site.
exit /b 0

:genfail
echo [ERR] hexo generate failed. Nothing was committed.
exit /b 1

:gitfail
echo [ERR] git add failed.
exit /b 1

:commitfail
echo [NOTE] nothing to commit (no changes). Site already current.
exit /b 0

:pushfail
echo [ERR] git push failed. Check SSH key / network.
exit /b 1
