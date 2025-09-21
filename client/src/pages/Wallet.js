import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Chip,
  Avatar
} from '@mui/material';
import { AccountBalanceWallet, TrendingUp, History } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Mock data - replace with real data from API
  const walletInfo = {
    balance: 2500.75,
    currency: 'USD',
    status: 'active',
    walletId: 'TREA-123456789'
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', balance: 2500.75, rate: 1.00 },
    { code: 'EUR', name: 'Euro', balance: 1200.50, rate: 0.85 },
    { code: 'GBP', name: 'British Pound', balance: 800.25, rate: 0.73 },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Wallet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your digital wallet and view balances
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Wallet Overview */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                  <AccountBalanceWallet />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="primary">
                    ${walletInfo.balance.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Balance ({walletInfo.currency})
                  </Typography>
                  <Chip 
                    label={walletInfo.status} 
                    color="success" 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Wallet ID: {walletInfo.walletId}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/send-money')}
                >
                  Send Money
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/request-money')}
                >
                  Request Money
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/cash-in')}
                >
                  Cash In
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/transactions')}
                  startIcon={<History />}
                >
                  Transaction History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Currency Balances */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Currency Balances
              </Typography>
              <Grid container spacing={2}>
                {currencies.map((currency) => (
                  <Grid item xs={12} sm={6} md={4} key={currency.code}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">
                              {currency.balance.toLocaleString()} {currency.code}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {currency.name}
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <TrendingUp />
                          </Avatar>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Rate: {currency.rate} USD
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Wallet;
