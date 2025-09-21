# Trea Payment Gateway - Localhost Setup Guide

## Prerequisites

Before running this application, you need to install the following software:

### 1. Node.js and npm
- Download and install Node.js (version 16 or higher) from: https://nodejs.org/
- This will also install npm (Node Package Manager)
- Verify installation by running:
  ```bash
  node --version
  npm --version
  ```

### 2. MongoDB
- Download and install MongoDB Community Server from: https://www.mongodb.com/try/download/community
- Start MongoDB service:
  - **Windows**: MongoDB should start automatically as a service
  - **macOS/Linux**: Run `mongod` in terminal
- Default connection: `mongodb://localhost:27017`

### 3. Git (Optional but recommended)
- Download from: https://git-scm.com/downloads

## Installation Steps

### Step 1: Install Backend Dependencies
```bash
# Navigate to the project root directory
cd "c:\Users\mozam\Downloads\trea gateway file"

# Install backend dependencies
npm install
```

### Step 2: Install Frontend Dependencies
```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Go back to root directory
cd ..
```

### Step 3: Environment Configuration
The environment files are already configured for localhost:
- **Backend**: `.env` (configured for localhost:27017 MongoDB and port 5000)
- **Frontend**: `client/.env` (configured to connect to localhost:5000 API)

### Step 4: Create Uploads Directory
```bash
# Create uploads directory for file storage
mkdir uploads
```

## Running the Application

### Option 1: Using the Batch Files (Windows)
```bash
# Install all dependencies (run once)
install-dependencies.bat

# Start both servers
start-servers.bat
```

### Option 2: Manual Start

#### Start Backend Server
```bash
# From project root directory
npm run dev
# or
npm start
```
The backend will run on: http://localhost:5000

#### Start Frontend Server (New Terminal)
```bash
# Navigate to client directory
cd client

# Start React development server
npm start
```
The frontend will run on: http://localhost:3000

### Option 3: Using npm Scripts
```bash
# Start backend server
npm run server

# Start frontend server (in another terminal)
npm run client
```

## Application URLs

- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Default Admin Credentials

- **Email**: admin@treapayment.com
- **Password**: admin123456

## Database

The application will automatically connect to MongoDB at `mongodb://localhost:27017/trea_payment_gateway`

## Features Available

### User Features
- User registration and authentication
- Wallet management
- Money transfers
- Transaction history
- Multi-currency support
- QR code payments

### Admin Features
- User management
- Transaction monitoring
- Reports and analytics
- System configuration

### Payment Gateways
- Stripe integration (test mode)
- PayPal integration
- Bank transfers
- Mobile money

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend (5000): Change PORT in `.env` file
   - Frontend (3000): React will automatically suggest port 3001

2. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env` file

3. **Dependencies Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **CORS Errors**
   - Ensure frontend is running on http://localhost:3000
   - Check CORS configuration in `server.js`

### Development Commands

```bash
# Backend development with auto-restart
npm run dev

# Frontend development
cd client && npm start

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
trea-payment-gateway/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── config/                 # Configuration files
├── middleware/             # Express middleware
├── models/                 # MongoDB models
├── routes/                 # API routes
├── utils/                  # Utility functions
├── uploads/                # File uploads
├── .env                    # Environment variables
├── server.js               # Main server file
└── package.json            # Backend dependencies
```

## Next Steps

1. Install Node.js and MongoDB if not already installed
2. Run the installation commands above
3. Start both servers
4. Access the application at http://localhost:3000
5. Login with admin credentials or create a new user account

## Support

For issues or questions, please check the troubleshooting section above or refer to the project documentation.