import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Avatar,
  Chip
} from '@mui/material';
import { 
  AccountBalanceWallet, 
  TrendingUp, 
  TrendingDown, 
  Receipt,
  Send,
  RequestPage
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Mock data - replace with real data from API
  const walletData = {
    balance: 2500.75,
    currency: 'USD'
  };

  const recentTransactions = [
    { id: 1, type: 'send', amount: -150.00, recipient: 'John Doe', date: '2024-01-15' },
    { id: 2, type: 'receive', amount: 500.00, sender: 'Jane Smith', date: '2024-01-14' },
    { id: 3, type: 'payment', amount: -25.50, description: 'Electricity Bill', date: '2024-01-13' },
  ];

  const quickActions = [
    { title: 'Send Money', icon: <Send />, path: '/send-money', color: 'primary' },
    { title: 'Request Money', icon: <RequestPage />, path: '/request-money', color: 'secondary' },
    { title: 'Cash In', icon: <TrendingUp />, path: '/cash-in', color: 'success' },
    { title: 'Cash Out', icon: <TrendingDown />, path: '/cash-out', color: 'warning' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your account today
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Wallet Balance Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AccountBalanceWallet />
                </Avatar>
                <Box>
                  <Typography variant="h6">Wallet Balance</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Funds
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h3" color="primary" gutterBottom>
                ${walletData.balance.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {walletData.currency}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/wallet')}>
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={action.icon}
                      onClick={() => navigate(action.path)}
                      sx={{ 
                        height: 80,
                        flexDirection: 'column',
                        gap: 1,
                        borderColor: `${action.color}.main`,
                        color: `${action.color}.main`,
                        '&:hover': {
                          bgcolor: `${action.color}.light`,
                          color: 'white'
                        }
                      }}
                    >
                      <Typography variant="body2">{action.title}</Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Transactions</Typography>
                <Button size="small" onClick={() => navigate('/transactions')}>
                  View All
                </Button>
              </Box>
              <Box>
                {recentTransactions.map((transaction) => (
                  <Box 
                    key={transaction.id}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        bgcolor: transaction.amount > 0 ? 'success.light' : 'error.light',
                        mr: 2,
                        width: 40,
                        height: 40
                      }}>
                        {transaction.amount > 0 ? <TrendingUp /> : <TrendingDown />}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {transaction.type === 'send' && transaction.recipient}
                          {transaction.type === 'receive' && transaction.sender}
                          {transaction.type === 'payment' && transaction.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(transaction.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography 
                        variant="h6" 
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                      >
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </Typography>
                      <Chip 
                        label={transaction.type} 
                        size="small" 
                        color={transaction.amount > 0 ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
