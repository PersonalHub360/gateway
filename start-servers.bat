@echo off
echo ========================================
echo  Trea Payment Gateway - Server Starter
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo ERROR: Backend dependencies not found!
    echo Please run install-dependencies.bat first
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

if not exist "client\node_modules" (
    echo ERROR: Frontend dependencies not found!
    echo Please run install-dependencies.bat first
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo Starting Trea Payment Gateway servers...
echo.
echo Backend will start on: http://localhost:5000
echo Frontend will start on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

echo Starting backend server...
start "Trea Backend Server" cmd /k "npm run dev"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Trea Frontend Server" cmd /k "cd client && npm start"

echo.
echo ========================================
echo  Both servers are starting...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo API Health: http://localhost:5000/api/health
echo.
echo Default Admin Login:
echo Email: admin@treapayment.com
echo Password: admin123456
echo.
echo Close this window or press Ctrl+C to stop monitoring
echo The servers will continue running in separate windows
echo.

:monitor
timeout /t 5 /nobreak >nul
echo Servers are running... (Press Ctrl+C to exit)
goto monitor