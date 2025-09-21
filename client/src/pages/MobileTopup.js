import React, { useState } from 'react';
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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import {
  Phone,
  Smartphone,
  Wifi,
  DataUsage,
  Message,
  Star,
  Add,
  Edit,
  Delete,
  CheckCircle,
  History,
  ContactPhone,
  Search,
  MonetizationOn,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MobileTopup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [errors, setErrors] = useState({});

  const carriers = [
    {
      id: 'verizon',
      name: 'Verizon',
      logo: '📱',
      color: '#ee1c25',
      plans: [
        { id: 'prepaid_15', name: '$15 Prepaid', amount: 15, description: '1GB Data + Unlimited Talk & Text' },
        { id: 'prepaid_30', name: '$30 Prepaid', amount: 30, description: '5GB Data + Unlimited Talk & Text' },
        { id: 'prepaid_50', name: '$50 Prepaid', amount: 50, description: '15GB Data + Unlimited Talk & Text' },
        { id: 'unlimited', name: '$70 Unlimited', amount: 70, description: 'Unlimited Everything' },
      ]
    },
    {
      id: 'att',
      name: 'AT&T',
      logo: '📶',
      color: '#00a8e0',
      plans: [
        { id: 'prepaid_25', name: '$25 Prepaid', amount: 25, description: '8GB Data + Unlimited Talk & Text' },
        { id: 'prepaid_40', name: '$40 Prepaid', amount: 40, description: '25GB Data + Unlimited Talk & Text' },
        { id: 'prepaid_60', name: '$60 Prepaid', amount: 60, description: 'Unlimited Data + Talk & Text' },
      ]
    },
    {
      id: 'tmobile',
      name: 'T-Mobile',
      logo: '📞',
      color: '#e20074',
      plans: [
        { id: 'prepaid_20', name: '$20 Prepaid', amount: 20, description: '3GB Data + Unlimited Talk & Text' },
        { id: 'prepaid_35', name: '$35 Prepaid', amount: 35, description: '10GB Data + Unlimited Talk & Text' },
        { id: 'prepaid_55', name: '$55 Prepaid', amount: 55, description: 'Unlimited Data + Talk & Text' },
      ]
    },
    {
      id: 'sprint',
      name: 'Sprint',
      logo: '📲',
      color: '#ffcf00',
      plans: [
        { id: 'prepaid_30', name: '$30 Prepaid', amount: 30, description: '3GB Data + Unlimited Talk & Text' },
        { id: 'prepaid_50', name: '$50 Prepaid', amount: 50, description: '10GB Data + Unlimited Talk & Text' },
      ]
    },
  ];

  const quickAmounts = [10, 15, 20, 25, 30, 50, 75, 100];

  const savedNumbers = [
    {
      id: 1,
      phoneNumber: '+1 (555) 123-4567',
      nickname: 'My Phone',
      carrier: 'verizon',
      lastTopup: 30,
      lastDate: '2023-12-15',
    },
    {
      id: 2,
      phoneNumber: '+1 (555) 987-6543',
      nickname: 'Mom\'s Phone',
      carrier: 'att',
      lastTopup: 25,
      lastDate: '2023-12-10',
    },
    {
      id: 3,
      phoneNumber: '+1 (555) 456-7890',
      nickname: 'Work Phone',
      carrier: 'tmobile',
      lastTopup: 50,
      lastDate: '2023-12-08',
    },
  ];

  const recentTopups = [
    {
      id: 1,
      phoneNumber: '+1 (555) 123-4567',
      carrier: 'Verizon',
      amount: 30,
      date: '2023-12-15',
      status: 'completed',
      plan: '$30 Prepaid',
    },
    {
      id: 2,
      phoneNumber: '+1 (555) 987-6543',
      carrier: 'AT&T',
      amount: 25,
      date: '2023-12-10',
      status: 'completed',
      plan: '$25 Prepaid',
    },
    {
      id: 3,
      phoneNumber: '+1 (555) 456-7890',
      carrier: 'T-Mobile',
      amount: 50,
      date: '2023-12-08',
      status: 'pending',
      plan: '$50 Prepaid',
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

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const validateTopup = () => {
    const newErrors = {};
    const availableBalance = user?.availableBalance || 1200.75;

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Please enter a phone number';
    } else if (!/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!selectedCarrier) {
      newErrors.carrier = 'Please select a carrier';
    }

    let amount = 0;
    if (selectedPlan) {
      const carrier = carriers.find(c => c.id === selectedCarrier);
      const plan = carrier?.plans.find(p => p.id === selectedPlan);
      amount = plan?.amount || 0;
    } else if (customAmount) {
      amount = parseFloat(customAmount);
      if (amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (amount < 5) {
        newErrors.amount = 'Minimum top-up amount is $5';
      } else if (amount > 200) {
        newErrors.amount = 'Maximum top-up amount is $200';
      }
    } else {
      newErrors.amount = 'Please select a plan or enter a custom amount';
    }

    if (amount > availableBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTopup = () => {
    if (validateTopup()) {
      setConfirmDialog(true);
    }
  };

  const confirmTopup = async () => {
    try {
      setConfirmDialog(false);
      // Simulate top-up processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccessDialog(true);
      // Reset form
      setPhoneNumber('');
      setSelectedCarrier('');
      setSelectedPlan('');
      setCustomAmount('');
    } catch (error) {
      console.error('Error processing top-up:', error);
    }
  };

  const handleQuickTopup = (savedNumber) => {
    setPhoneNumber(savedNumber.phoneNumber);
    setSelectedCarrier(savedNumber.carrier);
    setCustomAmount(savedNumber.lastTopup.toString());
    setActiveTab(0);
  };

  const getTopupAmount = () => {
    if (selectedPlan) {
      const carrier = carriers.find(c => c.id === selectedCarrier);
      const plan = carrier?.plans.find(p => p.id === selectedPlan);
      return plan?.amount || 0;
    }
    return parseFloat(customAmount) || 0;
  };

  const selectedCarrierData = carriers.find(c => c.id === selectedCarrier);
  const selectedPlanData = selectedCarrierData?.plans.find(p => p.id === selectedPlan);
  const topupAmount = getTopupAmount();
  const processingFee = topupAmount * 0.02; // 2% processing fee
  const totalAmount = topupAmount + processingFee;

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mobile Top-up
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add credit to your mobile phone instantly
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
                <Tab label="Top-up" />
                <Tab label="Saved Numbers" />
                <Tab label="History" />
              </Tabs>

              {/* Top-up Tab */}
              {activeTab === 0 && (
                <Box>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    placeholder="+1 (555) 123-4567"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Carrier</InputLabel>
                    <Select
                      value={selectedCarrier}
                      onChange={(e) => {
                        setSelectedCarrier(e.target.value);
                        setSelectedPlan('');
                      }}
                      label="Select Carrier"
                      error={!!errors.carrier}
                    >
                      {carriers.map((carrier) => (
                        <MenuItem key={carrier.id} value={carrier.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 2 }}>{carrier.logo}</Typography>
                            {carrier.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.carrier && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                        {errors.carrier}
                      </Typography>
                    )}
                  </FormControl>

                  {selectedCarrierData && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Choose Plan or Amount
                      </Typography>
                      
                      <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend">Select a plan</FormLabel>
                        <RadioGroup
                          value={selectedPlan}
                          onChange={(e) => {
                            setSelectedPlan(e.target.value);
                            setCustomAmount('');
                          }}
                        >
                          {selectedCarrierData.plans.map((plan) => (
                            <Paper
                              key={plan.id}
                              variant="outlined"
                              sx={{
                                p: 2,
                                mb: 1,
                                cursor: 'pointer',
                                border: selectedPlan === plan.id ? 2 : 1,
                                borderColor: selectedPlan === plan.id ? 'primary.main' : 'divider',
                              }}
                              onClick={() => {
                                setSelectedPlan(plan.id);
                                setCustomAmount('');
                              }}
                            >
                              <FormControlLabel
                                value={plan.id}
                                control={<Radio />}
                                label={
                                  <Box sx={{ width: '100%' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="h6" fontWeight="medium">
                                        {plan.name}
                                      </Typography>
                                      <Typography variant="h6" color="primary.main">
                                        {formatCurrency(plan.amount)}
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {plan.description}
                                    </Typography>
                                  </Box>
                                }
                                sx={{ m: 0, width: '100%' }}
                              />
                            </Paper>
                          ))}
                        </RadioGroup>
                      </FormControl>

                      <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          OR
                        </Typography>
                      </Divider>

                      <Typography variant="body1" gutterBottom>
                        Enter custom amount
                      </Typography>
                      <TextField
                        fullWidth
                        label="Custom Amount"
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedPlan('');
                        }}
                        error={!!errors.amount}
                        helperText={errors.amount || 'Minimum $5, Maximum $200'}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="body2" gutterBottom>
                        Quick amounts:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {quickAmounts.map((amount) => (
                          <Chip
                            key={amount}
                            label={formatCurrency(amount)}
                            clickable
                            variant={customAmount === amount.toString() ? 'filled' : 'outlined'}
                            color={customAmount === amount.toString() ? 'primary' : 'default'}
                            onClick={() => {
                              setCustomAmount(amount.toString());
                              setSelectedPlan('');
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

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

                  {topupAmount > 0 && (
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Top-up Summary
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Top-up Amount</Typography>
                          <Typography>{formatCurrency(topupAmount)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Processing Fee (2%)</Typography>
                          <Typography>{formatCurrency(processingFee)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6">Total</Typography>
                          <Typography variant="h6" color="primary.main">
                            {formatCurrency(totalAmount)}
                          </Typography>
                        </Box>
                        {selectedPlanData && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Plan: {selectedPlanData.description}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleTopup}
                    disabled={!phoneNumber || !selectedCarrier || (!selectedPlan && !customAmount)}
                    startIcon={<MonetizationOn />}
                  >
                    Top-up Now
                  </Button>
                </Box>
              )}

              {/* Saved Numbers Tab */}
              {activeTab === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Saved Phone Numbers
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setActiveTab(0)}
                    >
                      Add Number
                    </Button>
                  </Box>

                  {savedNumbers.map((savedNumber) => {
                    const carrier = carriers.find(c => c.id === savedNumber.carrier);
                    return (
                      <Card key={savedNumber.id} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" gutterBottom>
                                {savedNumber.nickname}
                              </Typography>
                              <Typography variant="body1" gutterBottom>
                                {savedNumber.phoneNumber}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography sx={{ mr: 1 }}>{carrier?.logo}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {carrier?.name}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                  label={`Last: ${formatCurrency(savedNumber.lastTopup)}`}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={formatDate(savedNumber.lastDate)}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleQuickTopup(savedNumber)}
                              >
                                Top-up
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
                    );
                  })}
                </Box>
              )}

              {/* History Tab */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Recent Top-ups
                  </Typography>

                  {recentTopups.map((topup) => (
                    <Card key={topup.id} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {topup.phoneNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {topup.carrier} • {topup.plan}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(topup.date)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight="bold">
                              {formatCurrency(topup.amount)}
                            </Typography>
                            <Chip
                              label={topup.status}
                              size="small"
                              color={topup.status === 'completed' ? 'success' : 'warning'}
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
                Available for top-ups
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popular Carriers
              </Typography>
              <List dense>
                {carriers.slice(0, 3).map((carrier) => (
                  <ListItem key={carrier.id} button onClick={() => {
                    setSelectedCarrier(carrier.id);
                    setActiveTab(0);
                  }}>
                    <ListItemIcon>
                      <Typography>{carrier.logo}</Typography>
                    </ListItemIcon>
                    <ListItemText primary={carrier.name} />
                  </ListItem>
                ))}
              </List>
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
                    <ContactPhone />
                  </ListItemIcon>
                  <ListItemText primary="Saved Numbers" />
                </ListItem>
                <ListItem button onClick={() => setActiveTab(2)}>
                  <ListItemIcon>
                    <History />
                  </ListItemIcon>
                  <ListItemText primary="Top-up History" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Top-up</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Top-up {formatPhoneNumber(phoneNumber)} with {formatCurrency(totalAmount)}?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Carrier: {selectedCarrierData?.name}
          </Typography>
          {selectedPlanData && (
            <Typography variant="body2" color="text.secondary">
              Plan: {selectedPlanData.name} - {selectedPlanData.description}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={confirmTopup}>
            Confirm Top-up
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Top-up Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your mobile top-up has been processed successfully.
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

export default MobileTopup;