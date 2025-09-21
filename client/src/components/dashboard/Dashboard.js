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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Skeleton,
  Alert,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as TransferIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Phone as PhoneIcon,
  ElectricBolt as BillIcon,
  CreditCard as CardIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { getWalletInfo } from '../../store/slices/walletSlice';
import { getTransactions } from '../../store/slices/transactionSlice';
import walletService from '../../services/walletService';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { walletInfo, loading: walletLoading } = useSelector((state) => state.wallet);
  const { transactions, loading: transactionLoading } = useSelector((state) => state.transactions);

  const [showBalance, setShowBalance] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Fetch wallet info and recent transactions
    dispatch(getWalletInfo());
    dispatch(getTransactions({ limit: 5 }));
    fetchStats();
  }, [dispatch]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await walletService.getWalletStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(getWalletInfo());
    dispatch(getTransactions({ limit: 5 }));
    fetchStats();
  };

  const quickActions = [
    {
      icon: <TransferIcon />,
      label: 'Transfer',
      action: () => navigate('/transfer'),
      color: '#2196f3',
    },
    {
      icon: <AddIcon />,
      label: 'Cash In',
      action: () => navigate('/cash-in'),
      color: '#4caf50',
    },
    {
      icon: <RemoveIcon />,
      label: 'Cash Out',
      action: () => navigate('/cash-out'),
      color: '#ff5722',
    },
    {
      icon: <PhoneIcon />,
      label: 'Airtime',
      action: () => navigate('/airtime'),
      color: '#ff9800',
    },
    {
      icon: <BillIcon />,
      label: 'Bills',
      action: () => navigate('/bills'),
      color: '#9c27b0',
    },
    {
      icon: <CardIcon />,
      label: 'Cards',
      action: () => navigate('/cards'),
      color: '#607d8b',
    },
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'transfer':
        return <TransferIcon />;
      case 'cash_in':
        return <TrendingUpIcon color="success" />;
      case 'cash_out':
        return <TrendingDownIcon color="error" />;
      case 'airtime':
        return <PhoneIcon />;
      case 'bill_payment':
        return <BillIcon />;
      default:
        return <ReceiptIcon />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'cash_in':
        return 'success';
      case 'cash_out':
      case 'transfer':
        return 'error';
      default:
        return 'primary';
    }
  };

  const formatAmount = (amount, type) => {
    const formatted = walletService.formatCurrency(amount);
    return type === 'cash_in' ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your account today.
        </Typography>
      </Box>

      {/* Wallet Balance Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Wallet Balance
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {walletLoading ? (
                      <Skeleton variant="text" width={200} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    ) : (
                      <Typography variant="h3" fontWeight="bold">
                        {showBalance
                          ? walletService.formatCurrency(walletInfo?.balance || 0)
                          : '****'
                        }
                      </Typography>
                    )}
                    <IconButton
                      onClick={() => setShowBalance(!showBalance)}
                      sx={{ color: 'white', ml: 1 }}
                    >
                      {showBalance ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Box>
                </Box>
                <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
                  <RefreshIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Account Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {walletInfo?.accountNumber || '****'}
                  </Typography>
                </Box>
                <Chip
                  label={walletInfo?.status || 'Active'}
                  color="success"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  {statsLoading ? (
                    <Skeleton variant="text" width="100%" height={60} />
                  ) : (
                    <>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {stats?.totalIncome ? walletService.formatCurrency(stats.totalIncome) : '₦0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Income
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  {statsLoading ? (
                    <Skeleton variant="text" width="100%" height={60} />
                  ) : (
                    <>
                      <Typography variant="h4" color="error.main" fontWeight="bold">
                        {stats?.totalExpenses ? walletService.formatCurrency(stats.totalExpenses) : '₦0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Expenses
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={action.action}
                  sx={{
                    py: 2,
                    flexDirection: 'column',
                    gap: 1,
                    borderColor: action.color,
                    color: action.color,
                    '&:hover': {
                      borderColor: action.color,
                      bgcolor: `${action.color}10`,
                    },
                  }}
                >
                  {action.icon}
                  <Typography variant="caption">{action.label}</Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Transactions
            </Typography>
            <Button
              variant="text"
              onClick={() => navigate('/transactions')}
              size="small"
            >
              View All
            </Button>
          </Box>

          {transactionLoading ? (
            <Box>
              {[...Array(3)].map((_, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                  <Skeleton variant="text" width="20%" />
                </Box>
              ))}
            </Box>
          ) : transactions.length === 0 ? (
            <Alert severity="info">
              No transactions yet. Start by making your first transaction!
            </Alert>
          ) : (
            <List>
              {transactions.slice(0, 5).map((transaction) => (
                <ListItem key={transaction.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getTransactionColor(transaction.type)}.light` }}>
                      {getTransactionIcon(transaction.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={transaction.description || transaction.type}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </Typography>
                        <Chip
                          label={walletService.formatTransactionStatus(transaction.status)}
                          size="small"
                          sx={{
                            ml: 1,
                            bgcolor: walletService.getTransactionStatusColor(transaction.status),
                            color: 'white',
                          }}
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={getTransactionColor(transaction.type)}
                    >
                      {formatAmount(transaction.amount, transaction.type)}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {quickActions.slice(0, 4).map((action, index) => (
            <SpeedDialAction
              key={index}
              icon={action.icon}
              tooltipTitle={action.label}
              onClick={action.action}
            />
          ))}
        </SpeedDial>
      )}
    </Box>
  );
};

export default Dashboard;