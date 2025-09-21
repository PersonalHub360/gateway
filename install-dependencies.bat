@echo off
echo Installing Trea Gateway Dependencies...
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed
node --version
echo.

echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo npm is installed
npm --version
echo.

echo Installing backend dependencies...
echo Current directory: %cd%
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo Backend dependencies installed successfully!
echo.

echo Installing frontend dependencies...
cd client
if %errorlevel% neq 0 (
    echo ERROR: Could not navigate to client directory
    pause
    exit /b 1
)

echo Current directory: %cd%
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)

echo Frontend dependencies installed successfully!
echo.

cd ..
echo Returning to root directory: %cd%
echo.

echo ========================================
echo All dependencies installed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Configure your .env file (already created)
echo 3. Run 'npm run dev' to start both servers
echo 4. Or run 'npm start' for backend and 'npm run client' for frontend separately
echo.
pause