import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Payment,
  MonetizationOn,
  Warning,
  Refresh,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

const EnhancedDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-BD').format(num || 0);
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const StatCard = ({ title, value, icon, color, change, isPositive }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="div" sx={{ color }}>
              {value}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {isPositive ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ color: isPositive ? 'success.main' : 'error.main' }}
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No dashboard data available
      </Alert>
    );
  }

  const { statistics, dailyStats, paymentMethods, recentTransactions, systemHealth } = dashboardData;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Admin Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchDashboardData} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Cash In"
            value={formatCurrency(statistics.totalCashIn)}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="success.main"
            change={getPercentageChange(statistics.totalCashIn, statistics.previousCashIn)}
            isPositive={statistics.totalCashIn >= (statistics.previousCashIn || 0)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Cash Out"
            value={formatCurrency(statistics.totalCashOut)}
            icon={<TrendingDown sx={{ fontSize: 40 }} />}
            color="warning.main"
            change={getPercentageChange(statistics.totalCashOut, statistics.previousCashOut)}
            isPositive={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Withdrawals"
            value={formatCurrency(statistics.totalWithdrawals)}
            icon={<AccountBalance sx={{ fontSize: 40 }} />}
            color="error.main"
            change={getPercentageChange(statistics.totalWithdrawals, statistics.previousWithdrawals)}
            isPositive={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Commission"
            value={formatCurrency(statistics.totalCommission)}
            icon={<MonetizationOn sx={{ fontSize: 40 }} />}
            color="primary.main"
            change={getPercentageChange(statistics.totalCommission, statistics.previousCommission)}
            isPositive={statistics.totalCommission >= (statistics.previousCommission || 0)}
          />
        </Grid>
      </Grid>

      {/* Daily Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Activity
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h6">
                      {formatCurrency(dailyStats.dailyCashIn)}
                    </Typography>
                    <Typography variant="body2">Cash In</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Typography variant="h6">
                      {formatCurrency(dailyStats.dailyCashOut)}
                    </Typography>
                    <Typography variant="body2">Cash Out</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="h6">
                      {formatCurrency(dailyStats.dailyWithdrawals)}
                    </Typography>
                    <Typography variant="body2">Withdrawals</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Total Losses: {formatCurrency(statistics.totalLosses)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((statistics.totalLosses / statistics.totalCashIn) * 100, 100)}
                  sx={{ mt: 1, bgcolor: 'error.light' }}
                  color="error"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Net Profit: {formatCurrency(statistics.totalCommission - statistics.totalLosses)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((statistics.totalCommission - statistics.totalLosses) / statistics.totalCashIn) * 100, 100)}
                  sx={{ mt: 1 }}
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Methods Breakdown */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Methods Usage
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Method</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Volume</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentMethods.map((method) => (
                      <TableRow key={method._id}>
                        <TableCell>
                          <Chip
                            label={method._id}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">{formatNumber(method.count)}</TableCell>
                        <TableCell align="right">{formatCurrency(method.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Active Users</Typography>
                  <Typography variant="h6" color="primary">
                    {formatNumber(systemHealth.activeUsers)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Pending Transactions</Typography>
                  <Typography variant="h6" color="warning.main">
                    {formatNumber(systemHealth.pendingTransactions)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Failed Transactions (24h)</Typography>
                  <Typography variant="h6" color="error.main">
                    {formatNumber(systemHealth.failedTransactions)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      {format(new Date(transaction.createdAt), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell>{transaction.user?.username || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        size="small"
                        color={transaction.type === 'cashin' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell align="right">{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        size="small"
                        color={
                          transaction.status === 'completed' ? 'success' :
                          transaction.status === 'pending' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EnhancedDashboard;