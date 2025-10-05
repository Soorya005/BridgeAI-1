@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    BridgeAI - Setup Wizard
echo ========================================
echo.
echo This will download the AI model (~4 GB)
echo and set up your environment.
echo.
pause

REM Check if models directory exists
if not exist "models" (
    echo Creating models directory...
    mkdir models
)

REM Check if model already exists
if exist "models\llama-2-7b-chat.Q4_K_M.gguf" (
    echo.
    echo Model file already exists!
    set /p overwrite="Do you want to re-download it? (y/N): "
    if /i not "!overwrite!"=="y" (
        echo Skipping download...
        goto env_setup
    )
    echo Removing old model...
    del "models\llama-2-7b-chat.Q4_K_M.gguf"
)

echo.
echo ========================================
echo   Downloading AI Model (4 GB)
echo ========================================
echo.
echo This may take 10-30 minutes depending on
echo your internet connection...
echo.

REM Hugging Face download URL
set MODEL_URL=https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf

REM Try different download methods
echo Attempting download...
echo.

REM Method 1: Try curl (built-in on Windows 10+)
where curl >nul 2>&1
if %errorlevel% equ 0 (
    echo Using curl to download...
    curl -L -o "models\llama-2-7b-chat.Q4_K_M.gguf" --progress-bar "%MODEL_URL%"
    if %errorlevel% equ 0 goto download_success
    echo Curl failed, trying PowerShell...
)

REM Method 2: Try PowerShell (always available on Windows)
echo Using PowerShell to download...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Write-Host 'Downloading... This may take a while...'; Invoke-WebRequest -Uri '%MODEL_URL%' -OutFile 'models\llama-2-7b-chat.Q4_K_M.gguf' -UseBasicParsing}"
if %errorlevel% equ 0 goto download_success

REM Method 3: If both failed
echo.
echo ========================================
echo   Download Failed!
echo ========================================
echo.
echo Please manually download the model:
echo.
echo 1. Go to: https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF
echo 2. Download: llama-2-7b-chat.Q4_K_M.gguf
echo 3. Place it in: models\ folder
echo.
echo Or try downloading with a browser and place the file manually.
echo.
pause
exit /b 1

:download_success
echo.
echo ========================================
echo   Download Complete! ✓
echo ========================================
echo.

REM Verify file exists and has reasonable size
if not exist "models\llama-2-7b-chat.Q4_K_M.gguf" (
    echo ERROR: Model file not found after download!
    pause
    exit /b 1
)

REM Check file size (should be around 4GB = 4,000,000,000 bytes)
for %%A in ("models\llama-2-7b-chat.Q4_K_M.gguf") do set size=%%~zA
if %size% LSS 3000000000 (
    echo WARNING: File size seems too small!
    echo Expected: ~4 GB, Got: %size% bytes
    echo Download may be incomplete.
    pause
)

:env_setup
echo.
echo ========================================
echo   Setting Up Environment
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env file from template...
        copy .env.example .env >nul
        echo.
        echo .env file created!
        echo.
    ) else (
        echo Creating basic .env file...
        echo CEREBRAS_API_KEY="" > .env
        echo MCP_GATEWAY_URL=http://mcp-gateway:8080 >> .env
        echo MODEL_PATH=/app/models/llama-2-7b-chat.Q4_K_M.gguf >> .env
    )
)

REM Check if API key is set (account for empty string with quotes)
findstr /C:"CEREBRAS_API_KEY=" .env | findstr /V "CEREBRAS_API_KEY=\"\"" | findstr /V "CEREBRAS_API_KEY=\"$\"" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   Cerebras API Key Setup
    echo ========================================
    echo.
    echo BridgeAI showcases HYBRID mode - online-first with offline fallback!
    echo.
    echo To demonstrate the full capabilities:
    echo - ONLINE mode: Fast responses with Cerebras Cloud
    echo - Automatic switch to OFFLINE mode when internet drops
    echo.
    echo Please enter your Cerebras API key to enable online mode.
    echo ^(Press Enter to skip and use offline-only mode^)
    echo.
    echo Get your FREE API key at: https://cloud.cerebras.ai/
    echo.
    set /p API_KEY="Enter Cerebras API Key: "
    
    if not "!API_KEY!"=="" (
        REM Update .env with the API key (wrapped in double quotes)
        powershell -Command "(Get-Content .env) -replace 'CEREBRAS_API_KEY=\".*\"', 'CEREBRAS_API_KEY=\"!API_KEY!\"' | Set-Content .env"
        echo.
        echo ✓ API key configured! You'll experience full HYBRID mode.
    ) else (
        echo.
        echo Skipped. App will run in offline-only mode.
        echo ^(You can add the API key later in .env file^)
    )
) else (
    echo .env file already configured ✓
)

echo.
echo ========================================
echo   Checking Docker
echo ========================================
echo.

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Docker not found!
    echo.
    echo Please install Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Docker is not running!
    echo.
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo Docker is ready ✓

echo.
echo ========================================
echo   Setup Complete! ✓
echo ========================================
echo.
echo Everything is ready to go!
echo.
echo Next steps:
echo 1. (Optional) Edit .env to add Cerebras API key
echo 2. Run start.bat to launch BridgeAI
echo.
echo The first launch will build Docker images
echo (this takes 5-10 minutes, only once)
echo.
pause
