@echo off
echo Stopping all BridgeAI containers...
docker-compose down

echo.
echo Removing volumes (this will clear any cached data)...
docker-compose down -v

echo.
echo Done! All containers stopped and cleaned up.
pause
