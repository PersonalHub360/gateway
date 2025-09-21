@echo off
echo Starting Trea Gateway Servers...
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Backend dependencies not found. Installing...
    call install-dependencies.bat
    if %errorlevel% neq 0 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

if not exist "client\node_modules" (
    echo Frontend dependencies not found. Installing...
    call install-dependencies.bat
    if %errorlevel% neq 0 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Dependencies are installed.
echo.

echo Checking .env file...
if not exist ".env" (
    echo .env file not found. Please create one based on .env.example
    pause
    exit /b 1
)

echo .env file found.
echo.

echo Starting servers...
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

start "Trea Gateway Backend" cmd /k "echo Starting Backend Server... && npm start"
timeout /t 3 /nobreak >nul
start "Trea Gateway Frontend" cmd /k "echo Starting Frontend Server... && npm run client"

echo.
echo Servers are starting...
echo Check the opened terminal windows for server status
echo.
echo Backend API: http://localhost:5000/api
echo Frontend App: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin
echo.
pause