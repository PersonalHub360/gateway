import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Add,
  Remove,
  Visibility,
  VisibilityOff,
  Refresh,
  History,
  CreditCard,
  AccountBalance,
  QrCode,
  Send,
  GetApp,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Wallet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  
  const [showBalance, setShowBalance] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [addMoneyDialog, setAddMoneyDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [amount, setAmount] = useState('');

  const [walletTransactions] = useState([
    { id: 1, type: 'deposit', amount: 500.00, method: 'Bank Transfer', date: '2024-01-15', status: 'completed', reference: 'DEP001' },
    { id: 2, type: 'withdrawal', amount: 200.00, method: 'Bank Transfer', date: '2024-01-14', status: 'completed', reference: 'WTH001' },
    { id: 3, type: 'deposit', amount: 100.00, method: 'Credit Card', date: '2024-01-13', status: 'completed', reference: 'DEP002' },
    { id: 4, type: 'withdrawal', amount: 50.00, method: 'Cash Out', date: '2024-01-12', status: 'pending', reference: 'WTH002' },
  ]);

  const [paymentMethods] = useState([
    { id: 1, type: 'bank', name: 'Chase Bank', account: '****1234', primary: true },
    { id: 2, type: 'card', name: 'Visa Card', account: '****5678', primary: false },
    { id: 3, type: 'paypal', name: 'PayPal', account: 'user@email.com', primary: false },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    return type === 'deposit' ? 
      <TrendingUp sx={{ color: 'success.main' }} /> : 
      <TrendingDown sx={{ color: 'error.main' }} />;
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case 'bank':
        return <AccountBalance />;
      case 'card':
        return <CreditCard />;
      case 'paypal':
        return <AccountBalanceWallet />;
      default:
        return <AccountBalanceWallet />;
    }
  };

  const handleAddMoney = () => {
    // Handle add money logic
    setAddMoneyDialog(false);
    setAmount('');
  };

  const handleWithdraw = () => {
    // Handle withdraw logic
    setWithdrawDialog(false);
    setAmount('');
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading wallet..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Wallet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your balance and payment methods
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Balance Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', mb: 3 }}>
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
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Available
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(user?.availableBalance || 1200.75)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Pending
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(user?.pendingBalance || 50.00)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      This Month
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(850.25)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Last Month
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(1125.50)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                }}
                onClick={() => setAddMoneyDialog(true)}
              >
                <Add sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" fontWeight="medium">
                  Add Money
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                }}
                onClick={() => setWithdrawDialog(true)}
              >
                <Remove sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                <Typography variant="body2" fontWeight="medium">
                  Withdraw
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                }}
                onClick={() => navigate('/send-money')}
              >
                <Send sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" fontWeight="medium">
                  Send Money
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                }}
                onClick={() => navigate('/request-money')}
              >
                <GetApp sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                <Typography variant="body2" fontWeight="medium">
                  Request Money
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Methods
              </Typography>
              <List>
                {paymentMethods.map((method, index) => (
                  <React.Fragment key={method.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getMethodIcon(method.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {method.name}
                            </Typography>
                            {method.primary && (
                              <Chip label="Primary" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={method.account}
                      />
                    </ListItem>
                    {index < paymentMethods.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                startIcon={<Add />}
              >
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab label="All Transactions" />
                  <Tab label="Deposits" />
                  <Tab label="Withdrawals" />
                </Tabs>
              </Box>

              <List>
                {walletTransactions
                  .filter(transaction => {
                    if (tabValue === 1) return transaction.type === 'deposit';
                    if (tabValue === 2) return transaction.type === 'withdrawal';
                    return true;
                  })
                  .map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getTransactionIcon(transaction.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {transaction.type === 'deposit' ? 'Money Added' : 'Money Withdrawn'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  via {transaction.method} • {transaction.reference}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography
                                  variant="body1"
                                  fontWeight="bold"
                                  sx={{ color: transaction.type === 'deposit' ? 'success.main' : 'error.main' }}
                                >
                                  {transaction.type === 'deposit' ? '+' : '-'}
                                  {formatCurrency(transaction.amount)}
                                </Typography>
                                <Chip
                                  label={transaction.status}
                                  size="small"
                                  color={transaction.status === 'completed' ? 'success' : 'warning'}
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {new Date(transaction.date).toLocaleDateString()}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < walletTransactions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>

              <Button
                variant="text"
                fullWidth
                sx={{ mt: 2 }}
                startIcon={<History />}
                onClick={() => navigate('/transactions')}
              >
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Money Dialog */}
      <Dialog open={addMoneyDialog} onClose={() => setAddMoneyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Money to Wallet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select payment method:
          </Typography>
          <List>
            {paymentMethods.map((method) => (
              <ListItem key={method.id} button>
                <ListItemIcon>
                  {getMethodIcon(method.type)}
                </ListItemIcon>
                <ListItemText
                  primary={method.name}
                  secondary={method.account}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMoneyDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMoney} variant="contained">
            Add Money
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialog} onClose={() => setWithdrawDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Withdraw Money</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Available balance: {formatCurrency(user?.availableBalance || 1200.75)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog(false)}>Cancel</Button>
          <Button onClick={handleWithdraw} variant="contained" color="error">
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wallet;