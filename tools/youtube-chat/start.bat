@echo off
cd /d "%~dp0\..\.."
py -3 -m venv .secrets\youtube-chat-venv
if errorlevel 1 goto failed
.secrets\youtube-chat-venv\Scripts\python.exe -m pip install -r tools\youtube-chat\requirements.txt
if errorlevel 1 goto failed
.secrets\youtube-chat-venv\Scripts\python.exe tools\youtube-chat\bridge.py
:failed
pause
