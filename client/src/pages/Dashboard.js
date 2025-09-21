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
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
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
  People,
  Security,
  Speed,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
// import { fetchUserProfile } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading: loading } = useSelector((state) => state.auth);
  
  const [showBalance, setShowBalance] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentTransactions: [],
    chartData: null,
    activities: []
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  
  console.log('Dashboard component rendered', { user, loading, loadingData });

  // Mock wallet balance - in real app, this would come from wallet API
  const walletBalance = 12567.89;
  const monthlySpending = 2340.50;
  const monthlyIncome = 5670.00;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      setLoadingData(true);
      setError(null);

      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const statsData = await statsResponse.json();
      console.log('Stats data received:', statsData);

      // Fetch recent transactions
      const transactionsResponse = await fetch('/api/dashboard/recent-transactions?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const transactionsData = await transactionsResponse.json();

      // Fetch chart data
      const chartResponse = await fetch('/api/dashboard/chart-data?type=transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const chartData = await chartResponse.json();

      // Fetch activity feed
      const activitiesResponse = await fetch('/api/dashboard/activity-feed?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const activitiesData = await activitiesResponse.json();

      const newData = {
        stats: statsData.stats,
        recentTransactions: transactionsData.transactions || [],
        chartData: chartData.chartData,
        activities: activitiesData.activities || []
      };
      console.log('Setting dashboard data:', newData);
      setDashboardData(newData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration': return <People />;
      case 'transaction_completed': return <CheckCircle />;
      case 'security_alert': return <Security />;
      case 'system_maintenance': return <Speed />;
      case 'transaction_failed': return <Error />;
      default: return <Info />;
    }
  };

  const getActivityColor = (severity) => {
    switch (severity) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  if (loading || loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LoadingSpinner size={60} />
      </Box>
    );
  }

  console.log('Rendering dashboard with data:', dashboardData);

  return (
    <Box sx={{ p: 3 }}>
      {/* Debug Info */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2">
          Debug: Dashboard loaded. User: {user?.firstName || 'Unknown'}, Loading: {String(loading || false)}, DataLoading: {String(loadingData || false)}
        </Typography>
      </Box>
      
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your account today.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Wallet Balance
                  </Typography>
                  <Typography variant="h4">
                    {showBalance ? `$${walletBalance.toLocaleString()}` : '••••••'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available funds
                  </Typography>
                </Box>
                <IconButton onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Monthly Income
                  </Typography>
                  <Typography variant="h4">
                    ${monthlyIncome.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +12.5% from last month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <TrendingDown />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Monthly Spending
                  </Typography>
                  <Typography variant="h4">
                    ${monthlySpending.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    +5.2% from last month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Receipt />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Transactions
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.stats?.totalTransactions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Stats */}
      {dashboardData.stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Overview
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">Total Users</Typography>
                    <Typography variant="h6">{dashboardData.stats.totalUsers.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">Active Users</Typography>
                    <Typography variant="h6">{dashboardData.stats.activeUsers.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">Total Volume</Typography>
                    <Typography variant="h6">${dashboardData.stats.totalVolume.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">System Uptime</Typography>
                    <Chip label={dashboardData.stats.systemUptime} color="success" size="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transaction Status
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">Completed</Typography>
                    <Typography variant="h6" color="success.main">
                      {dashboardData.stats.completedTransactions.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">Pending</Typography>
                    <Typography variant="h6" color="warning.main">
                      {dashboardData.stats.pendingTransactions.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">Failed</Typography>
                    <Typography variant="h6" color="error.main">
                      {dashboardData.stats.failedTransactions.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">Success Rate</Typography>
                    <Typography variant="h6" color="success.main">
                      {((dashboardData.stats.completedTransactions / dashboardData.stats.totalTransactions) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts and Recent Activity */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Transaction Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Transaction Volume</Typography>
                <IconButton onClick={fetchDashboardData}>
                  <Refresh />
                </IconButton>
              </Box>
              {dashboardData.chartData && (
                <Box sx={{ height: 300 }}>
                  <Line
                    data={dashboardData.chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Daily Transaction Volume'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {dashboardData.activities.slice(0, 5).map((activity, index) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: `${getActivityColor(activity.severity)}.main`, width: 32, height: 32 }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.message}
                      secondary={new Date(activity.timestamp).toLocaleTimeString()}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Transactions</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={() => navigate('/transactions')}
                >
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {transaction.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            ${transaction.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            size="small"
                            color={getStatusColor(transaction.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.description}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={() => navigate('/send-money')}
                >
                  Send Money
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GetApp />}
                  onClick={() => navigate('/cash-in')}
                >
                  Cash In
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Payment />}
                  onClick={() => navigate('/bill-payments')}
                >
                  Pay Bills
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Phone />}
                  onClick={() => navigate('/mobile-topup')}
                >
                  Mobile Topup
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShoppingCart />}
                  onClick={() => navigate('/shop-payments')}
                >
                  Shop Payments
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;