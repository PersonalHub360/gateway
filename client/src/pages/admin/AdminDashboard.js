import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Dashboard,
  People,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  MoreVert,
  Refresh,
  Download,
  Notifications,
  Security,
  Settings,
  Analytics,
  MonetizationOn,
  CreditCard,
  SwapHoriz,
  Block,
  Schedule,
  Today,
  CalendarMonth,
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 15420,
      activeUsers: 8934,
      totalTransactions: 45678,
      totalVolume: 2345678.90,
      pendingTransactions: 23,
      failedTransactions: 12,
      systemUptime: 99.8,
      avgResponseTime: 245,
    },
    recentTransactions: [
      {
        id: 'TXN001',
        user: 'John Doe',
        type: 'Send Money',
        amount: 150.00,
        status: 'completed',
        timestamp: '2024-01-15 14:30:25',
      },
      {
        id: 'TXN002',
        user: 'Jane Smith',
        type: 'Cash In',
        amount: 500.00,
        status: 'pending',
        timestamp: '2024-01-15 14:25:10',
      },
      {
        id: 'TXN003',
        user: 'Mike Johnson',
        type: 'Bill Payment',
        amount: 75.50,
        status: 'failed',
        timestamp: '2024-01-15 14:20:45',
      },
    ],
    alerts: [
      {
        id: 1,
        type: 'warning',
        message: 'High transaction volume detected',
        timestamp: '2024-01-15 14:35:00',
      },
      {
        id: 2,
        type: 'error',
        message: 'Payment gateway timeout',
        timestamp: '2024-01-15 14:30:00',
      },
      {
        id: 3,
        type: 'info',
        message: 'System maintenance scheduled',
        timestamp: '2024-01-15 14:25:00',
      },
    ],
    chartData: {
      transactions: [
        { name: 'Mon', value: 1200 },
        { name: 'Tue', value: 1900 },
        { name: 'Wed', value: 1500 },
        { name: 'Thu', value: 2100 },
        { name: 'Fri', value: 2800 },
        { name: 'Sat', value: 2200 },
        { name: 'Sun', value: 1800 },
      ],
      revenue: [
        { name: 'Mon', value: 12000 },
        { name: 'Tue', value: 19000 },
        { name: 'Wed', value: 15000 },
        { name: 'Thu', value: 21000 },
        { name: 'Fri', value: 28000 },
        { name: 'Sat', value: 22000 },
        { name: 'Sun', value: 18000 },
      ],
      userGrowth: [
        { name: 'Jan', users: 1000 },
        { name: 'Feb', users: 1200 },
        { name: 'Mar', users: 1500 },
        { name: 'Apr', users: 1800 },
        { name: 'May', users: 2200 },
        { name: 'Jun', users: 2800 },
      ],
      transactionTypes: [
        { name: 'Send Money', value: 35, color: '#8884d8' },
        { name: 'Cash In', value: 25, color: '#82ca9d' },
        { name: 'Bill Payment', value: 20, color: '#ffc658' },
        { name: 'Mobile Topup', value: 15, color: '#ff7300' },
        { name: 'Others', value: 5, color: '#00ff88' },
      ],
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update dashboard data based on selected period
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    handleMenuClose();
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      case 'info':
        return <Notifications color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const StatCard = ({ title, value, change, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {typeof value === 'number' && title.includes('$') ? `$${value.toLocaleString()}` : value.toLocaleString()}
            </Typography>
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {change > 0 ? (
                  <TrendingUp color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDown color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  color={change > 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.name || 'Administrator'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Today />}
            onClick={handleMenuClick}
          >
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handlePeriodChange('today')}>
          <Today sx={{ mr: 1 }} /> Today
        </MenuItem>
        <MenuItem onClick={() => handlePeriodChange('week')}>
          <CalendarMonth sx={{ mr: 1 }} /> This Week
        </MenuItem>
        <MenuItem onClick={() => handlePeriodChange('month')}>
          <CalendarMonth sx={{ mr: 1 }} /> This Month
        </MenuItem>
      </Menu>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={dashboardData.stats.totalUsers}
            change={12.5}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={dashboardData.stats.activeUsers}
            change={8.2}
            icon={<Dashboard />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Transactions"
            value={dashboardData.stats.totalTransactions}
            change={15.3}
            icon={<SwapHoriz />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Volume"
            value={`$${dashboardData.stats.totalVolume.toLocaleString()}`}
            change={22.1}
            icon={<MonetizationOn />}
            color="warning"
          />
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {dashboardData.stats.systemUptime}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uptime
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {dashboardData.stats.avgResponseTime}ms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Pending: {dashboardData.stats.pendingTransactions}
                </Typography>
                <Typography variant="body2" color="error.main">
                  Failed: {dashboardData.stats.failedTransactions}
                </Typography>
              </Box>
              <Button variant="outlined" size="small" startIcon={<Analytics />}>
                View Details
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Alerts
            </Typography>
            <List dense>
              {dashboardData.alerts.map((alert) => (
                <ListItem key={alert.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {getAlertIcon(alert.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.message}
                    secondary={alert.timestamp}
                  />
                </ListItem>
              ))}
            </List>
            <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }}>
              View All Alerts
            </Button>
          </Paper>
        </Grid>

        {/* Transaction Volume Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Volume
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.chartData.transactions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Transaction Types */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Types
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.chartData.transactionTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.chartData.transactionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Transactions
              </Typography>
              <Button variant="outlined" size="small">
                View All
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{transaction.user}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell align="right">${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={getStatusColor(transaction.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{transaction.timestamp}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;