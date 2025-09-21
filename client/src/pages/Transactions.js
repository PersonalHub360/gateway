import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  TrendingUp, 
  TrendingDown,
  Receipt,
  Send,
  RequestPage,
  Payment
} from '@mui/icons-material';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with real data from API
  const transactions = [
    {
      id: 'TXN001',
      type: 'send',
      status: 'completed',
      amount: -150.00,
      currency: 'USD',
      description: 'Payment to John Doe',
      date: '2024-01-15T10:30:00Z',
      fee: 2.50
    },
    {
      id: 'TXN002',
      type: 'receive',
      status: 'completed',
      amount: 500.00,
      currency: 'USD',
      description: 'Payment from Jane Smith',
      date: '2024-01-14T15:45:00Z',
      fee: 0
    },
    {
      id: 'TXN003',
      type: 'payment',
      status: 'pending',
      amount: -25.50,
      currency: 'USD',
      description: 'Electricity Bill Payment',
      date: '2024-01-13T09:15:00Z',
      fee: 1.00
    },
    {
      id: 'TXN004',
      type: 'cash_in',
      status: 'completed',
      amount: 1000.00,
      currency: 'USD',
      description: 'Bank Transfer',
      date: '2024-01-12T14:20:00Z',
      fee: 5.00
    },
    {
      id: 'TXN005',
      type: 'cash_out',
      status: 'failed',
      amount: -200.00,
      currency: 'USD',
      description: 'ATM Withdrawal',
      date: '2024-01-11T16:30:00Z',
      fee: 3.00
    }
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'send':
        return <Send />;
      case 'receive':
        return <TrendingUp />;
      case 'payment':
        return <Payment />;
      case 'cash_in':
        return <TrendingUp />;
      case 'cash_out':
        return <TrendingDown />;
      default:
        return <Receipt />;
    }
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transaction History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your transaction history
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="send">Send</MenuItem>
                  <MenuItem value="receive">Receive</MenuItem>
                  <MenuItem value="payment">Payment</MenuItem>
                  <MenuItem value="cash_in">Cash In</MenuItem>
                  <MenuItem value="cash_out">Cash Out</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Transactions ({filteredTransactions.length})
          </Typography>
          
          {filteredTransactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No transactions found matching your criteria
              </Typography>
            </Box>
          ) : (
            <Box>
              {filteredTransactions.map((transaction) => (
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
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Avatar sx={{ 
                      bgcolor: transaction.amount > 0 ? 'success.light' : 'error.light',
                      mr: 2,
                      width: 48,
                      height: 48
                    }}>
                      {getTransactionIcon(transaction.type)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {transaction.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.id} • {new Date(transaction.date).toLocaleDateString()}
                      </Typography>
                      {transaction.fee > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Fee: ${transaction.fee.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography 
                      variant="h6" 
                      color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                    >
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {transaction.currency}
                    </Typography>
                    <Chip 
                      label={transaction.status} 
                      size="small" 
                      color={getStatusColor(transaction.status)}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              ))}
              
              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination count={5} page={1} color="primary" />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Transactions;
