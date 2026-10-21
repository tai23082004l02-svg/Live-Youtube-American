@echo off
setlocal
cd /d "%~dp0"
title Down Arena - Live Arena - 8766
echo DOWN ARENA - SUKUNA - 8 CHARACTERS
echo Project: %CD%
echo Open http://127.0.0.1:8766/?build=sukuna-impact-2 in Chrome or Edge.
echo Keep this window open. Press Ctrl+C to stop.
echo.
where py >nul 2>&1
if not errorlevel 1 (
  py -3 "%~dp0tools\serve_game.py"
  goto finish
)
where python >nul 2>&1
if not errorlevel 1 (
  python "%~dp0tools\serve_game.py"
  goto finish
)
echo Python 3 was not found. Use Down_Arena_Play.html for the standalone version.
:finish
pause
