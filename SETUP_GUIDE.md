# Trea Gateway Setup Guide

## 🚀 Complete Installation Guide

This guide will help you set up the Trea Gateway payment system from scratch.

## Step 1: Install Node.js and npm

### For Windows:

1. **Download Node.js**
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Download the **LTS version** (recommended for most users)
   - Choose the Windows Installer (.msi) for your system (64-bit or 32-bit)

2. **Install Node.js**
   - Run the downloaded installer
   - Follow the installation wizard
   - Make sure to check "Add to PATH" option
   - This will also install npm (Node Package Manager)

3. **Verify Installation**
   - Open Command Prompt or PowerShell
   - Run these commands:
   ```bash
   node --version
   npm --version
   ```
   - You should see version numbers for both

### Alternative: Using Chocolatey (Windows Package Manager)

If you have Chocolatey installed:
```bash
choco install nodejs
```

### Alternative: Using Winget (Windows 10/11)

```bash
winget install OpenJS.NodeJS
```

## Step 2: Install MongoDB

### Option 1: MongoDB Community Server (Recommended)

1. **Download MongoDB**
   - Go to [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Select your Windows version
   - Download the MSI installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool) - optional but helpful

3. **Verify MongoDB Installation**
   - Open Command Prompt
   - Run: `mongod --version`

### Option 2: MongoDB Atlas (Cloud Database)

If you prefer a cloud database:
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update the `MONGODB_URI` in your `.env` file

## Step 3: Install Git (Optional but Recommended)

1. Download from [https://git-scm.com/](https://git-scm.com/)
2. Install with default settings
3. This will give you Git Bash terminal

## Step 4: Setup Trea Gateway

### Using the Automated Scripts:

1. **Install Dependencies**
   ```bash
   # Double-click this file or run in command prompt
   install-dependencies.bat
   ```

2. **Start the Application**
   ```bash
   # Double-click this file or run in command prompt
   start-servers.bat
   ```

### Manual Setup:

1. **Open Command Prompt or PowerShell**
   - Navigate to the project directory
   ```bash
   cd "C:\Users\mozam\Downloads\trea gateway file"
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start MongoDB**
   - If installed as service, it should start automatically
   - Otherwise, run: `mongod`

5. **Start the Application**
   ```bash
   # Start both servers
   npm run dev
   
   # Or start separately
   npm start          # Backend (port 5000)
   npm run client     # Frontend (port 3000)
   ```

## Step 5: Access the Application

Once everything is running:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:3000/admin

## Default Admin Credentials

- **Email**: admin@treagateway.com
- **Password**: Admin123!@#

**⚠️ Change these credentials immediately after first login!**

## Troubleshooting

### Common Issues:

1. **"npm: command not found"**
   - Node.js is not installed or not in PATH
   - Restart your terminal after installing Node.js
   - Try running from a new Command Prompt window

2. **"MongoDB connection failed"**
   - Make sure MongoDB is running
   - Check if MongoDB service is started in Services (services.msc)
   - Verify the connection string in `.env` file

3. **Port already in use**
   - Another application is using port 3000 or 5000
   - Stop other applications or change ports in configuration

4. **Permission errors**
   - Run Command Prompt as Administrator
   - Or use PowerShell with elevated privileges

### Checking System Requirements:

```bash
# Check Node.js version (should be 14+)
node --version

# Check npm version
npm --version

# Check if MongoDB is running
mongo --eval "db.adminCommand('ismaster')"
```

## Environment Configuration

The `.env` file is already configured for development. Key settings:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/trea_gateway

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# JWT (already configured with secure defaults)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Next Steps After Installation

1. **Test the Application**
   - Register a new user account
   - Verify email functionality (check console for email logs)
   - Test wallet operations
   - Access admin panel

2. **Customize Configuration**
   - Update email settings for real email sending
   - Configure payment gateways (Stripe, PayPal)
   - Set up SMS service for phone verification

3. **Development**
   - Explore the codebase
   - Make customizations
   - Add new features

## Getting Help

If you encounter issues:

1. Check this guide first
2. Look at the main README.md file
3. Check the console/terminal for error messages
4. Ensure all prerequisites are properly installed

## File Structure Overview

```
trea-gateway/
├── client/                 # React frontend
├── config/                # Configuration files
├── controllers/           # API controllers
├── models/               # Database models
├── routes/               # API routes
├── .env                  # Environment variables (configured)
├── server.js             # Main server file
├── install-dependencies.bat  # Automated installer
├── start-servers.bat     # Automated server starter
└── SETUP_GUIDE.md        # This file
```

---

**You're all set! Happy coding! 🚀**