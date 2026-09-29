@echo off
echo ========================================
echo    AgriGuard - Start Backend
echo ========================================
echo.

cd backend

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start the server
echo Starting AgriGuard Backend on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
set PYTHONIOENCODING=utf-8
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
