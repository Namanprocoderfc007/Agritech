@echo off
echo ========================================
echo    AgriGuard - Setup Script (Windows)
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

echo [OK] Python found
echo.

REM Create virtual environment
echo Creating Python virtual environment...
cd backend
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo.
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo    Backend setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set up API keys in .env (if using cloud providers)
echo 2. Start backend: python -m uvicorn app.main:app --reload
echo.
pause
