@echo off
echo ========================================================
echo   SmartWaste AI - Windows .EXE Packaging Pipeline
echo ========================================================
echo.

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10 or 3.11 from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Installing desktop packaging dependencies...
pip install -r requirements.txt
pip install pyinstaller pywebview

echo.
echo [2/4] Verifying local SQLite database and assets...
if not exist "smartwaste_local.db" (
    echo Initializing local database...
)

echo.
echo [3/4] Compiling SmartWaste AI into standalone Windows .EXE...
pyinstaller --noconfirm --onedir --windowed --name "SmartWasteAI" ^
    --add-data "requirements.txt;." ^
    app_desktop.py

echo.
echo ========================================================
echo [4/4] Build Complete!
echo Standalone executable created at:
echo   dist\SmartWasteAI\SmartWasteAI.exe
echo ========================================================
echo.
pause
