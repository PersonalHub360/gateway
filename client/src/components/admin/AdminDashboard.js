import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  MonetizationOn as MoneyIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'react-toastify';

import {
  fetchDashboardStats,
  fetchRecentUsers,
  fetchRecentTransactions,
  fetchSystemAlerts,
  updateUserStatus,
  updateTransactionStatus,
  dismissAlert,
  exportData,
} from '../../store/slices/adminSlice';
import { formatCurrency, formatNumber, formatDate, formatRelativeTime } from '../../utils/helpers';
import { TRANSACTION_STATUS, USER_ROLES, CHART_COLORS } from '../../utils/constants';

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();

  const {
    dashboardStats,
    recentUsers,
    recentTransactions,
    systemAlerts,
    loading,
    error,
  } = useSelector((state) => state.admin);

  const [selectedTab, setSelectedTab] = useState(0);
  const [dateRange, setDateRange] = useState('7d');
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', item: null });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [dispatch, dateRange]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboardStats({ period: dateRange })).unwrap(),
        dispatch(fetchRecentUsers()).unwrap(),
        dispatch(fetchRecentTransactions()).unwrap(),
        dispatch(fetchSystemAlerts()).unwrap(),
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleActionMenuOpen = (event, item) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedItem(item);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedItem(null);
  };

  const handleActionDialog = (type, item = null) => {
    setActionDialog({ open: true, type, item });
    handleActionMenuClose();
  };

  const handleActionDialogClose = () => {
    setActionDialog({ open: false, type: '', item: null });
  };

  const handleUserAction = async (action, userId, data = {}) => {
    try {
      await dispatch(updateUserStatus({ userId, action, ...data })).unwrap();
      toast.success(`User ${action} successfully`);
      loadDashboardData();
      handleActionDialogClose();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleTransactionAction = async (action, transactionId, data = {}) => {
    try {
      await dispatch(updateTransactionStatus({ transactionId, action, ...data })).unwrap();
      toast.success(`Transaction ${action} successfully`);
      loadDashboardData();
      handleActionDialogClose();
    } catch (error) {
      toast.error(`Failed to ${action} transaction`);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await dispatch(dismissAlert(alertId)).unwrap();
      toast.success('Alert dismissed');
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  const handleExportData = async (type) => {
    try {
      const result = await dispatch(exportData({ type, period: dateRange })).unwrap();
      // Create download link
      const url = window.URL.createObjectURL(new Blob([result.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', result.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'approved':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'suspended':
      case 'failed':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'approved':
        return <CheckCircleIcon fontSize="small" />;
      case 'pending':
      case 'processing':
        return <WarningIcon fontSize="small" />;
      case 'suspended':
      case 'failed':
      case 'rejected':
        return <BlockIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const StatCard = ({ title, value, change, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {change && (
              <Box display="flex" alignItems="center" mt={1}>
                {change > 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={change > 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
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

  const ChartCard = ({ title, children, actions }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">{title}</Typography>
          {actions && <Box>{actions}</Box>}
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  if (loading && !dashboardStats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            System overview and management
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={dateRange}
              label="Period"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="1d">Today</MenuItem>
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
              <MenuItem value="90d">90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExportData('dashboard')}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* System Alerts */}
      {systemAlerts?.length > 0 && (
        <Box mb={3}>
          {systemAlerts.map((alert) => (
            <Alert
              key={alert.id}
              severity={alert.severity}
              onClose={() => handleDismissAlert(alert.id)}
              sx={{ mb: 1 }}
            >
              <Typography variant="body2">
                <strong>{alert.title}</strong> - {alert.message}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={formatNumber(dashboardStats?.totalUsers || 0)}
            change={dashboardStats?.userGrowth}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Transactions"
            value={formatNumber(dashboardStats?.totalTransactions || 0)}
            change={dashboardStats?.transactionGrowth}
            icon={<ReceiptIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Volume"
            value={formatCurrency(dashboardStats?.totalVolume || 0)}
            change={dashboardStats?.volumeGrowth}
            icon={<MoneyIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Wallets"
            value={formatNumber(dashboardStats?.activeWallets || 0)}
            change={dashboardStats?.walletGrowth}
            icon={<WalletIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} lg={8}>
          <ChartCard title="Transaction Volume Trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardStats?.volumeChart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#667eea"
                  fill="#667eea"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard title="Transaction Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardStats?.statusChart || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {(dashboardStats?.statusChart || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Recent Users" />
            <Tab label="Recent Transactions" />
            <Tab label="System Health" />
          </Tabs>
        </Box>

        {/* Recent Users Tab */}
        {selectedTab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2 }}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === USER_ROLES.ADMIN ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(user.status)}
                        label={user.status}
                        size="small"
                        color={getStatusColor(user.status)}
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionMenuOpen(e, user)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Recent Transactions Tab */}
        {selectedTab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {transaction.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.user?.firstName} {transaction.user?.lastName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {transaction.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={transaction.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(transaction.status)}
                        label={transaction.status}
                        size="small"
                        color={getStatusColor(transaction.status)}
                      />
                    </TableCell>
                    <TableCell>{formatRelativeTime(transaction.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionMenuOpen(e, transaction)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* System Health Tab */}
        {selectedTab === 2 && (
          <Box p={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  System Performance
                </Typography>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">CPU Usage</Typography>
                    <Typography variant="body2">
                      {dashboardStats?.systemHealth?.cpu || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardStats?.systemHealth?.cpu || 0}
                    color={
                      (dashboardStats?.systemHealth?.cpu || 0) > 80
                        ? 'error'
                        : (dashboardStats?.systemHealth?.cpu || 0) > 60
                        ? 'warning'
                        : 'success'
                    }
                  />
                </Box>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Memory Usage</Typography>
                    <Typography variant="body2">
                      {dashboardStats?.systemHealth?.memory || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardStats?.systemHealth?.memory || 0}
                    color={
                      (dashboardStats?.systemHealth?.memory || 0) > 80
                        ? 'error'
                        : (dashboardStats?.systemHealth?.memory || 0) > 60
                        ? 'warning'
                        : 'success'
                    }
                  />
                </Box>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Database Load</Typography>
                    <Typography variant="body2">
                      {dashboardStats?.systemHealth?.database || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardStats?.systemHealth?.database || 0}
                    color={
                      (dashboardStats?.systemHealth?.database || 0) > 80
                        ? 'error'
                        : (dashboardStats?.systemHealth?.database || 0) > 60
                        ? 'warning'
                        : 'success'
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Service Status
                </Typography>
                {dashboardStats?.serviceStatus?.map((service) => (
                  <Box
                    key={service.name}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Typography variant="body2">{service.name}</Typography>
                    <Chip
                      icon={service.status === 'online' ? <CheckCircleIcon /> : <ErrorIcon />}
                      label={service.status}
                      size="small"
                      color={service.status === 'online' ? 'success' : 'error'}
                    />
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Box>
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        {selectedItem?.email && (
          <>
            <MenuItem onClick={() => handleActionDialog('suspend', selectedItem)}>
              <ListItemIcon>
                <BlockIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Suspend User</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleActionDialog('activate', selectedItem)}>
              <ListItemIcon>
                <CheckCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Activate User</ListItemText>
            </MenuItem>
            <Divider />
          </>
        )}
        {selectedItem?.type && (
          <>
            <MenuItem onClick={() => handleActionDialog('approve', selectedItem)}>
              <ListItemIcon>
                <CheckCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Approve Transaction</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleActionDialog('reject', selectedItem)}>
              <ListItemIcon>
                <BlockIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Reject Transaction</ListItemText>
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem onClick={() => handleActionDialog('view', selectedItem)}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
      </Menu>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={handleActionDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'suspend' && 'Suspend User'}
          {actionDialog.type === 'activate' && 'Activate User'}
          {actionDialog.type === 'approve' && 'Approve Transaction'}
          {actionDialog.type === 'reject' && 'Reject Transaction'}
          {actionDialog.type === 'view' && 'View Details'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.type === 'suspend' && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to suspend this user?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason (optional)"
                variant="outlined"
                margin="normal"
              />
            </Box>
          )}
          {actionDialog.type === 'activate' && (
            <Typography variant="body1">
              Are you sure you want to activate this user?
            </Typography>
          )}
          {actionDialog.type === 'approve' && (
            <Typography variant="body1">
              Are you sure you want to approve this transaction?
            </Typography>
          )}
          {actionDialog.type === 'reject' && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to reject this transaction?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason"
                variant="outlined"
                margin="normal"
                required
              />
            </Box>
          )}
          {actionDialog.type === 'view' && (
            <Box>
              <Typography variant="body1">
                Details for {actionDialog.item?.email || actionDialog.item?.id}
              </Typography>
              {/* Add more details here */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionDialogClose}>Cancel</Button>
          {actionDialog.type !== 'view' && (
            <Button
              onClick={() => {
                if (actionDialog.item?.email) {
                  handleUserAction(actionDialog.type, actionDialog.item.id);
                } else if (actionDialog.item?.type) {
                  handleTransactionAction(actionDialog.type, actionDialog.item.id);
                }
              }}
              variant="contained"
              color={actionDialog.type === 'suspend' || actionDialog.type === 'reject' ? 'error' : 'primary'}
            >
              Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;