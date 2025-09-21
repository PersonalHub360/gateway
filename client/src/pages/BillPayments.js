import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  InputAdornment,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  ElectricalServices,
  Water,
  Wifi,
  LocalGasStation,
  Phone,
  Tv,
  School,
  LocalHospital,
  CreditCard,
  Receipt,
  History,
  Star,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Schedule,
  MonetizationOn,
  Search,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BillPayments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [errors, setErrors] = useState({});

  const billCategories = [
    {
      id: 'utilities',
      name: 'Utilities',
      icon: <ElectricalServices />,
      billers: [
        { id: 'electricity', name: 'Electric Company', icon: <ElectricalServices />, fee: 1.50 },
        { id: 'water', name: 'Water Authority', icon: <Water />, fee: 1.00 },
        { id: 'gas', name: 'Gas Company', icon: <LocalGasStation />, fee: 1.25 },
      ]
    },
    {
      id: 'telecom',
      name: 'Telecom',
      icon: <Phone />,
      billers: [
        { id: 'internet', name: 'Internet Provider', icon: <Wifi />, fee: 2.00 },
        { id: 'mobile', name: 'Mobile Carrier', icon: <Phone />, fee: 1.50 },
        { id: 'cable', name: 'Cable TV', icon: <Tv />, fee: 2.50 },
      ]
    },
    {
      id: 'financial',
      name: 'Financial',
      icon: <CreditCard />,
      billers: [
        { id: 'credit_card', name: 'Credit Card', icon: <CreditCard />, fee: 2.95 },
        { id: 'loan', name: 'Personal Loan', icon: <MonetizationOn />, fee: 3.00 },
      ]
    },
    {
      id: 'other',
      name: 'Other',
      icon: <Receipt />,
      billers: [
        { id: 'education', name: 'School Fees', icon: <School />, fee: 2.00 },
        { id: 'healthcare', name: 'Healthcare', icon: <LocalHospital />, fee: 1.75 },
      ]
    }
  ];

  const savedBillers = [
    {
      id: 1,
      billerId: 'electricity',
      billerName: 'Electric Company',
      accountNumber: '123456789',
      nickname: 'Home Electric',
      lastAmount: 125.50,
      dueDate: '2024-01-15',
      autopay: true,
    },
    {
      id: 2,
      billerId: 'internet',
      billerName: 'Internet Provider',
      accountNumber: '987654321',
      nickname: 'Home Internet',
      lastAmount: 79.99,
      dueDate: '2024-01-20',
      autopay: false,
    },
    {
      id: 3,
      billerId: 'mobile',
      billerName: 'Mobile Carrier',
      accountNumber: '555-0123',
      nickname: 'My Phone',
      lastAmount: 65.00,
      dueDate: '2024-01-25',
      autopay: true,
    },
  ];

  const recentPayments = [
    {
      id: 1,
      billerName: 'Electric Company',
      amount: 125.50,
      date: '2023-12-15',
      status: 'completed',
      accountNumber: '123456789',
    },
    {
      id: 2,
      billerName: 'Internet Provider',
      amount: 79.99,
      date: '2023-12-20',
      status: 'completed',
      accountNumber: '987654321',
    },
    {
      id: 3,
      billerName: 'Mobile Carrier',
      amount: 65.00,
      date: '2023-12-25',
      status: 'pending',
      accountNumber: '555-0123',
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const validatePayment = () => {
    const newErrors = {};
    const availableBalance = user?.availableBalance || 1200.75;

    if (!selectedBiller) {
      newErrors.biller = 'Please select a biller';
    }

    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Please enter account number';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(amount) > availableBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayBill = () => {
    if (validatePayment()) {
      setConfirmDialog(true);
    }
  };

  const confirmPayment = async () => {
    try {
      setConfirmDialog(false);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccessDialog(true);
      // Reset form
      setSelectedBiller(null);
      setAccountNumber('');
      setAmount('');
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleQuickPay = (savedBiller) => {
    const biller = billCategories
      .flatMap(cat => cat.billers)
      .find(b => b.id === savedBiller.billerId);
    
    setSelectedBiller(biller);
    setAccountNumber(savedBiller.accountNumber);
    setAmount(savedBiller.lastAmount.toString());
    setPaymentDialog(true);
  };

  const filteredBillers = billCategories.map(category => ({
    ...category,
    billers: category.billers.filter(biller =>
      biller.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.billers.length > 0);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Bill Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pay your bills quickly and securely
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3 }}
              >
                <Tab label="Pay Bills" />
                <Tab label="Saved Billers" />
                <Tab label="Payment History" />
              </Tabs>

              {/* Pay Bills Tab */}
              {activeTab === 0 && (
                <Box>
                  <TextField
                    fullWidth
                    placeholder="Search billers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />

                  {filteredBillers.map((category) => (
                    <Box key={category.id} sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        {category.icon}
                        <Box sx={{ ml: 1 }}>{category.name}</Box>
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {category.billers.map((biller) => (
                          <Grid item xs={12} sm={6} md={4} key={biller.id}>
                            <Paper
                              sx={{
                                p: 2,
                                cursor: 'pointer',
                                border: selectedBiller?.id === biller.id ? 2 : 1,
                                borderColor: selectedBiller?.id === biller.id ? 'primary.main' : 'divider',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  boxShadow: 2,
                                },
                              }}
                              onClick={() => {
                                setSelectedBiller(biller);
                                setPaymentDialog(true);
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                                  {biller.icon}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="medium">
                                    {biller.name}
                                  </Typography>
                                  <Chip
                                    label={`Fee: ${formatCurrency(biller.fee)}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Saved Billers Tab */}
              {activeTab === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Your Saved Billers
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setActiveTab(0)}
                    >
                      Add Biller
                    </Button>
                  </Box>

                  {savedBillers.map((savedBiller) => (
                    <Card key={savedBiller.id} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {savedBiller.nickname}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {savedBiller.billerName} • {savedBiller.accountNumber}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip
                                label={`Last: ${formatCurrency(savedBiller.lastAmount)}`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={`Due: ${formatDate(savedBiller.dueDate)}`}
                                size="small"
                                color={new Date(savedBiller.dueDate) < new Date() ? 'error' : 'default'}
                              />
                              {savedBiller.autopay && (
                                <Chip
                                  label="AutoPay"
                                  size="small"
                                  color="success"
                                  icon={<Schedule />}
                                />
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleQuickPay(savedBiller)}
                            >
                              Pay Now
                            </Button>
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {/* Payment History Tab */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Recent Payments
                  </Typography>

                  {recentPayments.map((payment) => (
                    <Card key={payment.id} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {payment.billerName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Account: {payment.accountNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(payment.date)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight="bold">
                              {formatCurrency(payment.amount)}
                            </Typography>
                            <Chip
                              label={payment.status}
                              size="small"
                              color={payment.status === 'completed' ? 'success' : 'warning'}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/transactions')}
                  >
                    View All Transactions
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Balance
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {formatCurrency(user?.availableBalance || 1200.75)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available for payments
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List dense>
                <ListItem button onClick={() => setActiveTab(1)}>
                  <ListItemIcon>
                    <Star />
                  </ListItemIcon>
                  <ListItemText primary="Saved Billers" />
                </ListItem>
                <ListItem button onClick={() => setActiveTab(2)}>
                  <ListItemIcon>
                    <History />
                  </ListItemIcon>
                  <ListItemText primary="Payment History" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText primary="Set Up AutoPay" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Bills
              </Typography>
              {savedBillers.slice(0, 3).map((bill) => (
                <Box key={bill.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {bill.nickname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(bill.dueDate)}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="primary.main">
                    {formatCurrency(bill.lastAmount)}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Pay Bill - {selectedBiller?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              error={!!errors.accountNumber}
              helperText={errors.accountNumber}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="wallet">Wallet Balance</MenuItem>
                <MenuItem value="bank">Bank Account</MenuItem>
                <MenuItem value="card">Credit/Debit Card</MenuItem>
              </Select>
            </FormControl>

            {selectedBiller && amount && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Bill Amount</Typography>
                    <Typography>{formatCurrency(parseFloat(amount) || 0)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Processing Fee</Typography>
                    <Typography>{formatCurrency(selectedBiller.fee)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" color="primary.main">
                      {formatCurrency((parseFloat(amount) || 0) + selectedBiller.fee)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePayBill}
            disabled={!selectedBiller || !accountNumber || !amount}
          >
            Pay Bill
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to pay {formatCurrency((parseFloat(amount) || 0) + (selectedBiller?.fee || 0))} to {selectedBiller?.name}?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Account: {accountNumber}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={confirmPayment}>
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your bill payment has been processed successfully.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialog(false)} fullWidth variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillPayments;