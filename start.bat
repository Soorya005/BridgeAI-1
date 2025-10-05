@echo off
echo ========================================
echo    BridgeAI - Starting...
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/4] Checking model file...
if not exist "models\llama-2-7b-chat.Q4_K_M.gguf" (
    echo.
    echo [ERROR] Model file not found!
    echo.
    echo Please run setup.bat first to download the model.
    echo.
    echo Or manually download from:
    echo https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF
    echo.
    pause
    exit /b 1
)
echo       ✓ Model file found!

echo.
echo [2/4] Checking environment file...
if not exist ".env" (
    echo       Creating .env from template...
    copy .env.example .env >nul 2>&1
    echo       ✓ Created .env
) else (
    echo       ✓ .env file exists!
)

echo.
echo [3/4] Starting containers in background...
docker-compose up -d

echo.
echo [4/4] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

cls
echo ========================================
echo   ✅ BridgeAI is RUNNING!
echo ========================================
echo.
echo   Opening browser...
start http://localhost:5173
echo.
echo   If browser didn't open, go to:
echo   👉 http://localhost:5173
echo.
echo   📊 View logs: docker-compose logs -f
echo   🛑 Stop: Run stop.bat
echo.
echo ========================================
echo.
echo This window can be closed.
echo Press any key to close...
pause >nul
