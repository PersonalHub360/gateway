import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  IconButton,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Send,
  GetApp,
  Payment,
  Phone,
  ShoppingCart,
  Receipt,
  Visibility,
  VisibilityOff,
  Refresh,
  Notifications,
} from '@mui/icons-material';
import { fetchUserProfile } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions] = useState([
    { id: 1, type: 'received', amount: 250.00, from: 'John Doe', date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'sent', amount: 100.00, to: 'Jane Smith', date: '2024-01-14', status: 'completed' },
    { id: 3, type: 'bill', amount: 75.50, description: 'Electricity Bill', date: '2024-01-13', status: 'completed' },
    { id: 4, type: 'topup', amount: 25.00, description: 'Mobile Topup', date: '2024-01-12', status: 'completed' },
  ]);

  const quickActions = [
    { title: 'Send Money', icon: <Send />, path: '/send-money', color: '#1976d2' },
    { title: 'Request Money', icon: <GetApp />, path: '/request-money', color: '#388e3c' },
    { title: 'Cash In', icon: <AccountBalanceWallet />, path: '/cash-in', color: '#f57c00' },
    { title: 'Cash Out', icon: <Payment />, path: '/cash-out', color: '#d32f2f' },
    { title: 'Bill Payments', icon: <Receipt />, path: '/bill-payments', color: '#7b1fa2' },
    { title: 'Mobile Topup', icon: <Phone />, path: '/mobile-topup', color: '#0288d1' },
  ];

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'received':
        return <TrendingUp sx={{ color: 'success.main' }} />;
      case 'sent':
        return <TrendingDown sx={{ color: 'error.main' }} />;
      case 'bill':
        return <Receipt sx={{ color: 'warning.main' }} />;
      case 'topup':
        return <Phone sx={{ color: 'info.main' }} />;
      default:
        return <Payment />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'received':
        return 'success.main';
      case 'sent':
        return 'error.main';
      case 'bill':
        return 'warning.main';
      case 'topup':
        return 'info.main';
      default:
        return 'text.primary';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your account today.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Total Balance
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {showBalance ? formatCurrency(user?.balance || 1250.75) : '••••••'}
                    </Typography>
                    <IconButton
                      onClick={() => setShowBalance(!showBalance)}
                      sx={{ color: 'white', ml: 1 }}
                    >
                      {showBalance ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Box>
                </Box>
                <IconButton sx={{ color: 'white' }}>
                  <Refresh />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Chip
                  label={`Available: ${formatCurrency(user?.availableBalance || 1200.75)}`}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  label={`Pending: ${formatCurrency(user?.pendingBalance || 50.00)}`}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
              >
                {user?.firstName?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                <Chip
                  label={user?.emailVerified ? 'Email Verified' : 'Email Pending'}
                  color={user?.emailVerified ? 'success' : 'warning'}
                  size="small"
                />
                <Chip
                  label={user?.phoneVerified ? 'Phone Verified' : 'Phone Pending'}
                  color={user?.phoneVerified ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/profile')}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: action.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="body2" fontWeight="medium">
                    {action.title}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Transactions
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/transactions')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentTransactions.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getTransactionIcon(transaction.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {transaction.from && `From ${transaction.from}`}
                              {transaction.to && `To ${transaction.to}`}
                              {transaction.description && transaction.description}
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              sx={{ color: getTransactionColor(transaction.type) }}
                            >
                              {transaction.type === 'received' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(transaction.date).toLocaleDateString()}
                            </Typography>
                            <Chip
                              label={transaction.status}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Notifications
                </Typography>
              </Box>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Welcome to Trea Gateway!"
                    secondary="Complete your profile to get started"
                  />
                </ListItem>
                <Divider />
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Security Alert"
                    secondary="Enable 2FA for better security"
                  />
                </ListItem>
                <Divider />
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="New Feature"
                    secondary="Try our new bill payment feature"
                  />
                </ListItem>
              </List>
              <Button
                variant="text"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => navigate('/notifications')}
              >
                View All Notifications
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;