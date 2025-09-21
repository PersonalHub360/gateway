import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  InputAdornment,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Visibility,
  Download,
  Refresh,
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  AccountBalance,
  CreditCard,
  Phone,
  Receipt,
  Block,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  CalendarToday,
  DateRange,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const TransactionManagement = () => {
  const dispatch = useDispatch();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock transaction data - replace with actual API calls
  const mockTransactions = [
    {
      id: 'TXN001',
      type: 'send_money',
      amount: 150.00,
      fee: 2.50,
      status: 'completed',
      sender: { id: 1, name: 'John Doe', email: 'john@example.com' },
      receiver: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      timestamp: '2024-01-20 14:30:25',
      reference: 'REF001',
      description: 'Payment for services',
      paymentMethod: 'wallet',
      currency: 'USD',
    },
    {
      id: 'TXN002',
      type: 'cash_in',
      amount: 500.00,
      fee: 5.00,
      status: 'pending',
      sender: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      receiver: null,
      timestamp: '2024-01-20 14:25:10',
      reference: 'REF002',
      description: 'Wallet top-up',
      paymentMethod: 'bank_transfer',
      currency: 'USD',
    },
    {
      id: 'TXN003',
      type: 'bill_payment',
      amount: 75.50,
      fee: 1.50,
      status: 'failed',
      sender: { id: 3, name: 'Mike Johnson', email: 'mike@example.com' },
      receiver: { id: null, name: 'Electric Company', email: null },
      timestamp: '2024-01-20 14:20:45',
      reference: 'REF003',
      description: 'Electricity bill payment',
      paymentMethod: 'wallet',
      currency: 'USD',
    },
    {
      id: 'TXN004',
      type: 'mobile_topup',
      amount: 25.00,
      fee: 0.50,
      status: 'completed',
      sender: { id: 1, name: 'John Doe', email: 'john@example.com' },
      receiver: null,
      timestamp: '2024-01-20 14:15:30',
      reference: 'REF004',
      description: 'Mobile credit top-up',
      paymentMethod: 'wallet',
      currency: 'USD',
    },
  ];

  const [stats, setStats] = useState({
    totalTransactions: 1250,
    totalVolume: 125000.50,
    completedTransactions: 1100,
    pendingTransactions: 85,
    failedTransactions: 65,
    avgTransactionValue: 100.00,
  });

  const chartData = [
    { name: 'Mon', transactions: 120, volume: 12000 },
    { name: 'Tue', transactions: 190, volume: 19000 },
    { name: 'Wed', transactions: 150, volume: 15000 },
    { name: 'Thu', transactions: 210, volume: 21000 },
    { name: 'Fri', transactions: 280, volume: 28000 },
    { name: 'Sat', transactions: 220, volume: 22000 },
    { name: 'Sun', transactions: 180, volume: 18000 },
  ];

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterStatus, filterType, dateRange]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showSnackbar('Error fetching transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(txn =>
        txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.sender?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.receiver?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(txn => txn.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(txn => txn.type === filterType);
    }

    setFilteredTransactions(filtered);
  };

  const handleMenuClick = (event, transaction) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleDialogOpen = (type, transaction = null) => {
    setDialogType(type);
    setSelectedTransaction(transaction);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTransaction(null);
    setDialogType('');
    setTabValue(0);
  };

  const handleTransactionAction = async (action, transactionId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (action) {
        case 'approve':
          setTransactions(transactions.map(txn => 
            txn.id === transactionId ? { ...txn, status: 'completed' } : txn
          ));
          showSnackbar('Transaction approved successfully', 'success');
          break;
        case 'reject':
          setTransactions(transactions.map(txn => 
            txn.id === transactionId ? { ...txn, status: 'failed' } : txn
          ));
          showSnackbar('Transaction rejected', 'warning');
          break;
        case 'refund':
          showSnackbar('Refund initiated successfully', 'success');
          break;
        default:
          break;
      }
      handleDialogClose();
    } catch (error) {
      console.error('Error performing transaction action:', error);
      showSnackbar('Error performing action', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'send_money':
        return <SwapHoriz />;
      case 'cash_in':
        return <TrendingUp />;
      case 'cash_out':
        return <TrendingDown />;
      case 'bill_payment':
        return <Receipt />;
      case 'mobile_topup':
        return <Phone />;
      default:
        return <AccountBalance />;
    }
  };

  const formatTransactionType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const TransactionDetailsDialog = () => (
    <Dialog open={dialogOpen && dialogType === 'view'} onClose={handleDialogClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Transaction Details
      </DialogTitle>
      <DialogContent>
        {selectedTransaction && (
          <Box sx={{ mt: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Overview" />
              <Tab label="Participants" />
              <Tab label="Timeline" />
            </Tabs>
            
            {tabValue === 0 && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Transaction Info
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Transaction ID"
                              secondary={selectedTransaction.id}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Reference"
                              secondary={selectedTransaction.reference}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Type"
                              secondary={formatTransactionType(selectedTransaction.type)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Status"
                              secondary={
                                <Chip
                                  label={selectedTransaction.status}
                                  color={getStatusColor(selectedTransaction.status)}
                                  size="small"
                                />
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Timestamp"
                              secondary={selectedTransaction.timestamp}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Financial Details
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Amount"
                              secondary={
                                <Typography variant="h6" color="primary">
                                  ${selectedTransaction.amount.toFixed(2)}
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Fee"
                              secondary={`$${selectedTransaction.fee.toFixed(2)}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Total"
                              secondary={`$${(selectedTransaction.amount + selectedTransaction.fee).toFixed(2)}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Currency"
                              secondary={selectedTransaction.currency}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Payment Method"
                              secondary={selectedTransaction.paymentMethod.replace('_', ' ')}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {selectedTransaction.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Sender
                        </Typography>
                        {selectedTransaction.sender ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>
                              {selectedTransaction.sender.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1">
                                {selectedTransaction.sender.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedTransaction.sender.email}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ID: {selectedTransaction.sender.id}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            System transaction
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Receiver
                        </Typography>
                        {selectedTransaction.receiver ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>
                              {selectedTransaction.receiver.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1">
                                {selectedTransaction.receiver.name}
                              </Typography>
                              {selectedTransaction.receiver.email && (
                                <Typography variant="body2" color="text.secondary">
                                  {selectedTransaction.receiver.email}
                                </Typography>
                              )}
                              {selectedTransaction.receiver.id && (
                                <Typography variant="body2" color="text.secondary">
                                  ID: {selectedTransaction.receiver.id}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No receiver (self transaction)
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Transaction Timeline
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transaction timeline and audit logs would be displayed here.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {selectedTransaction?.status === 'pending' && (
          <>
            <Button
              onClick={() => handleTransactionAction('approve', selectedTransaction.id)}
              color="success"
              variant="contained"
            >
              Approve
            </Button>
            <Button
              onClick={() => handleTransactionAction('reject', selectedTransaction.id)}
              color="error"
              variant="outlined"
            >
              Reject
            </Button>
          </>
        )}
        {selectedTransaction?.status === 'completed' && (
          <Button
            onClick={() => handleTransactionAction('refund', selectedTransaction.id)}
            color="warning"
            variant="outlined"
          >
            Initiate Refund
          </Button>
        )}
        <Button onClick={handleDialogClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Transaction Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchTransactions}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SwapHoriz />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.totalTransactions}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.completedTransactions}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.pendingTransactions}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <Error />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.failedTransactions}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <AccountBalance />
                </Avatar>
                <Box>
                  <Typography variant="h6">${stats.totalVolume.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Volume
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6">${stats.avgTransactionValue}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Volume
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="transactions" fill="#8884d8" name="Transactions" />
                <Bar dataKey="volume" fill="#82ca9d" name="Volume ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="transactions" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={2}>
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
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="send_money">Send Money</MenuItem>
                <MenuItem value="cash_in">Cash In</MenuItem>
                <MenuItem value="cash_out">Cash Out</MenuItem>
                <MenuItem value="bill_payment">Bill Payment</MenuItem>
                <MenuItem value="mobile_topup">Mobile Topup</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
            >
              Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Transactions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{transaction.id}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.reference}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getTypeIcon(transaction.type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {formatTransactionType(transaction.type)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          From: {transaction.sender?.name || 'System'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          To: {transaction.receiver?.name || 'Self'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        ${transaction.amount.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fee: ${transaction.fee.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.timestamp}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="More actions">
                        <IconButton onClick={(e) => handleMenuClick(e, transaction)}>
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDialogOpen('view', selectedTransaction)}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        {selectedTransaction?.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleTransactionAction('approve', selectedTransaction.id)}>
              <CheckCircle sx={{ mr: 1 }} /> Approve
            </MenuItem>
            <MenuItem onClick={() => handleTransactionAction('reject', selectedTransaction.id)}>
              <Block sx={{ mr: 1 }} /> Reject
            </MenuItem>
          </>
        )}
        {selectedTransaction?.status === 'completed' && (
          <MenuItem onClick={() => handleTransactionAction('refund', selectedTransaction.id)}>
            <TrendingDown sx={{ mr: 1 }} /> Refund
          </MenuItem>
        )}
      </Menu>

      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TransactionManagement;