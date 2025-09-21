@echo off
echo ========================================
echo  Trea Payment Gateway - Dependency Installer
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

echo Node.js is installed. Proceeding with dependency installation...
echo.

echo Installing backend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies!
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd client

echo Cleaning previous installation...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json
if exist "yarn.lock" del yarn.lock

npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies!
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

cd ..

echo.
echo Creating uploads directory...
if not exist "uploads" mkdir uploads

echo.
echo ========================================
echo  Installation completed successfully!
echo ========================================
echo.
echo To start the application:
echo 1. Run start-servers.bat
echo 2. Or manually start:
echo    - Backend: npm run dev
echo    - Frontend: cd client && npm start
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5000
echo.
echo Press any key to exit...
pause >nul