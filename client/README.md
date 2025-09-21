# Trea Gateway - React Frontend

A modern, responsive React application for the Trea Gateway financial platform, built with Material-UI and Redux Toolkit.

## Features

- **Authentication System**: Login, registration, email/phone verification, 2FA
- **Dashboard**: Comprehensive overview with wallet balance, recent transactions, and quick actions
- **Wallet Management**: Transfer money, cash in/out, transaction history
- **Admin Panel**: System monitoring, user management, transaction oversight
- **Responsive Design**: Mobile-first approach with Material-UI components
- **State Management**: Redux Toolkit with persistence
- **Real-time Updates**: WebSocket integration for live data
- **Security**: JWT authentication, input validation, secure API calls

## Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **Material-UI (MUI) 5** - Comprehensive component library
- **Redux Toolkit** - State management with RTK Query
- **React Router 6** - Client-side routing
- **Formik & Yup** - Form handling and validation
- **Axios** - HTTP client with interceptors
- **React Query** - Server state management
- **Date-fns** - Date manipulation
- **Recharts** - Data visualization
- **React Toastify** - Notifications

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Backend API** running (see backend documentation)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd trea-gateway/client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**:
   Create a `.env` file in the client directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_WS_URL=ws://localhost:5000
   REACT_APP_ENVIRONMENT=development
   REACT_APP_VERSION=1.0.0
   ```

4. **Start the development server**:
   ```bash
   npm start
   # or
   yarn start
   ```

   The application will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)
- `npm run analyze` - Analyzes the bundle size

## Project Structure

```
client/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminDashboard.js
│   │   ├── auth/
│   │   │   └── Login.js
│   │   ├── common/
│   │   │   └── Layout.js
│   │   ├── dashboard/
│   │   │   └── Dashboard.js
│   │   └── wallet/
│   │       └── TransferMoney.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── walletService.js
│   ├── store/
│   │   ├── slices/
│   │   │   ├── adminSlice.js
│   │   │   ├── authSlice.js
│   │   │   ├── notificationSlice.js
│   │   │   ├── transactionSlice.js
│   │   │   ├── uiSlice.js
│   │   │   └── walletSlice.js
│   │   └── index.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── theme.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Key Components

### Authentication
- **Login Component**: Secure login with 2FA support
- **Registration**: Multi-step user registration
- **Verification**: Email and phone verification flows

### Dashboard
- **Main Dashboard**: Overview of wallet balance and recent activity
- **Quick Actions**: Fast access to common operations
- **Transaction History**: Paginated transaction list with filters

### Wallet Management
- **Transfer Money**: Step-by-step money transfer process
- **Cash In/Out**: Deposit and withdrawal functionality
- **Balance Management**: Real-time balance updates

### Admin Panel
- **System Overview**: Dashboard with key metrics and charts
- **User Management**: User administration and monitoring
- **Transaction Oversight**: Transaction approval and management

## State Management

The application uses Redux Toolkit for state management with the following slices:

- **authSlice**: User authentication and session management
- **walletSlice**: Wallet balance and operations
- **transactionSlice**: Transaction history and operations
- **adminSlice**: Admin panel data and operations
- **uiSlice**: UI state (theme, sidebar, modals)
- **notificationSlice**: Notifications and alerts

## API Integration

All API calls are handled through:
- **Axios instance** with request/response interceptors
- **Service classes** for organized API methods
- **Error handling** with user-friendly messages
- **Token management** with automatic refresh

## Styling and Theming

- **Material-UI Theme**: Custom theme with light/dark mode support
- **Responsive Design**: Mobile-first approach with breakpoints
- **Custom Components**: Styled components for consistent UI
- **CSS-in-JS**: Emotion-based styling with MUI

## Security Features

- **JWT Token Management**: Secure token storage and refresh
- **Input Validation**: Client-side validation with Yup schemas
- **CSRF Protection**: Request headers and validation
- **Secure Routes**: Protected routes based on authentication
- **Data Masking**: Sensitive data masking in UI

## Performance Optimizations

- **Code Splitting**: Lazy loading of routes and components
- **Memoization**: React.memo and useMemo for expensive operations
- **Bundle Optimization**: Webpack optimizations for smaller bundles
- **Image Optimization**: Optimized images and lazy loading

## Testing

Run tests with:
```bash
npm test
```

The project includes:
- Unit tests for components
- Integration tests for user flows
- API service tests
- Redux store tests

## Building for Production

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Serve the build** (optional):
   ```bash
   npm install -g serve
   serve -s build
   ```

The build folder will contain the optimized production files.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `REACT_APP_WS_URL` | WebSocket URL | `ws://localhost:5000` |
| `REACT_APP_ENVIRONMENT` | Environment name | `development` |
| `REACT_APP_VERSION` | App version | `1.0.0` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Node.js not found**: Install Node.js from [nodejs.org](https://nodejs.org/)
2. **npm command not found**: Node.js installation includes npm
3. **Port 3000 in use**: Use `npm start -- --port 3001` to use a different port
4. **API connection issues**: Check backend server is running and REACT_APP_API_URL is correct

### Development Tips

- Use React Developer Tools browser extension
- Enable Redux DevTools for state debugging
- Check browser console for errors
- Use network tab to debug API calls

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Note**: This is the frontend application for Trea Gateway. Make sure the backend API is running before starting the frontend development server.