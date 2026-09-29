@echo off
echo ========================================
echo    AgriGuard - Frontend Setup (Windows)
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.

REM Install dependencies
echo Installing frontend dependencies...
cd frontend
npm install

echo.
echo ========================================
echo    Frontend setup complete!
echo ========================================
echo.
echo To start the frontend, run:
echo   cd frontend
echo   npm run dev
echo.
pause
