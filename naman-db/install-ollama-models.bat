@echo off
echo ========================================
echo    Install Ollama Models for AgriGuard
echo ========================================
echo.
echo This will download the AI models needed for AgriGuard.
echo Total download size: ~8GB
echo.
echo Press any key to start downloading...
pause >nul

echo.
echo [1/2] Downloading LLaVA (Vision Model - ~4.5GB)...
ollama pull llava:13b

echo.
echo [2/2] Downloading Mistral (Chat Model - ~4GB)...
ollama pull mistral:7b

echo.
echo ========================================
echo    All models downloaded successfully!
echo ========================================
echo.
echo You can now start AgriGuard with:
echo   1. Run start-backend.bat
echo   2. Run start-frontend.bat
echo.
pause
