import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DatePicker,
  Pagination,
  IconButton,
  Menu,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Send,
  GetApp,
  Receipt,
  Phone,
  ShoppingCart,
  AccountBalanceWallet,
  Search,
  FilterList,
  Download,
  MoreVert,
  Refresh,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Transactions = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const itemsPerPage = 10;

  const [transactions] = useState([
    { id: 1, type: 'received', amount: 250.00, from: 'John Doe', to: null, description: 'Payment for services', date: '2024-01-15T10:30:00', status: 'completed', reference: 'TXN001' },
    { id: 2, type: 'sent', amount: 100.00, from: null, to: 'Jane Smith', description: 'Lunch payment', date: '2024-01-14T14:20:00', status: 'completed', reference: 'TXN002' },
    { id: 3, type: 'bill', amount: 75.50, from: null, to: null, description: 'Electricity Bill - ABC Electric', date: '2024-01-13T09:15:00', status: 'completed', reference: 'TXN003' },
    { id: 4, type: 'topup', amount: 25.00, from: null, to: null, description: 'Mobile Topup - 555-0123', date: '2024-01-12T16:45:00', status: 'completed', reference: 'TXN004' },
    { id: 5, type: 'shop', amount: 45.75, from: null, to: null, description: 'Coffee Shop - Main Street', date: '2024-01-11T08:30:00', status: 'completed', reference: 'TXN005' },
    { id: 6, type: 'cashin', amount: 500.00, from: null, to: null, description: 'Cash In - Agent Location', date: '2024-01-10T11:00:00', status: 'completed', reference: 'TXN006' },
    { id: 7, type: 'cashout', amount: 200.00, from: null, to: null, description: 'Cash Out - ATM Withdrawal', date: '2024-01-09T13:20:00', status: 'pending', reference: 'TXN007' },
    { id: 8, type: 'sent', amount: 150.00, from: null, to: 'Mike Johnson', description: 'Rent contribution', date: '2024-01-08T19:10:00', status: 'failed', reference: 'TXN008' },
    { id: 9, type: 'received', amount: 300.00, from: 'Sarah Wilson', to: null, description: 'Freelance payment', date: '2024-01-07T12:45:00', status: 'completed', reference: 'TXN009' },
    { id: 10, type: 'bill', amount: 120.00, from: null, to: null, description: 'Internet Bill - XYZ ISP', date: '2024-01-06T10:15:00', status: 'completed', reference: 'TXN010' },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
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
      case 'shop':
        return <ShoppingCart sx={{ color: 'purple' }} />;
      case 'cashin':
      case 'cashout':
        return <AccountBalanceWallet sx={{ color: 'primary.main' }} />;
      default:
        return <Send />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'received':
      case 'cashin':
        return 'success.main';
      case 'sent':
      case 'bill':
      case 'topup':
      case 'shop':
      case 'cashout':
        return 'error.main';
      default:
        return 'text.primary';
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

  const getTransactionTitle = (transaction) => {
    switch (transaction.type) {
      case 'received':
        return `Received from ${transaction.from}`;
      case 'sent':
        return `Sent to ${transaction.to}`;
      case 'bill':
        return 'Bill Payment';
      case 'topup':
        return 'Mobile Topup';
      case 'shop':
        return 'Shop Payment';
      case 'cashin':
        return 'Cash In';
      case 'cashout':
        return 'Cash Out';
      default:
        return 'Transaction';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.from && transaction.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.to && transaction.to.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = (!startDate || transactionDate >= startDate) && 
                            (!endDate || transactionDate <= endDate);
    
    return matchesSearch && matchesType && matchesStatus && matchesDateRange;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleMenuClick = (event, transaction) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleExport = () => {
    // Handle export functionality
    console.log('Exporting transactions...');
    handleMenuClose();
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading transactions..." />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Transaction History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all your transactions
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {transactions.length}
                    </Typography>
                  </Box>
                  <Receipt sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Money Received
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(850.00)}
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Money Sent
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      {formatCurrency(690.25)}
                    </Typography>
                  </Box>
                  <TrendingDown sx={{ fontSize: 40, color: 'error.main', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      2
                    </Typography>
                  </Box>
                  <Refresh sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    label="Type"
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="received">Received</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="bill">Bill Payment</MenuItem>
                    <MenuItem value="topup">Mobile Topup</MenuItem>
                    <MenuItem value="shop">Shop Payment</MenuItem>
                    <MenuItem value="cashin">Cash In</MenuItem>
                    <MenuItem value="cashout">Cash Out</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
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
              <Grid item xs={12} sm={6} md={2}>
                <MuiDatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <MuiDatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={1}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExport}
                  fullWidth
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Transactions ({filteredTransactions.length})
              </Typography>
              <IconButton>
                <FilterList />
              </IconButton>
            </Box>

            <List>
              {paginatedTransactions.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getTransactionIcon(transaction.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {getTransactionTitle(transaction)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {transaction.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.reference} • {formatDateTime(transaction.date).date} at {formatDateTime(transaction.date).time}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', ml: 2 }}>
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              sx={{ color: getTransactionColor(transaction.type) }}
                            >
                              {['received', 'cashin'].includes(transaction.type) ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={transaction.status}
                                size="small"
                                color={getStatusColor(transaction.status)}
                                variant="outlined"
                              />
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuClick(e, transaction)}
                              >
                                <MoreVert />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < paginatedTransactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {filteredTransactions.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No transactions found matching your criteria.
                </Typography>
              </Box>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Transaction Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            Download Receipt
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            Report Issue
          </MenuItem>
        </Menu>
      </Box>
    </LocalizationProvider>
  );
};

export default Transactions;