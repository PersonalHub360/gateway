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
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  AccountBalance,
  CreditCard,
  AccountBalanceWallet,
  CheckCircle,
  Security,
  Speed,
  MonetizationOn,
  Store,
  QrCode,
  LocationOn,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CashIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [errors, setErrors] = useState({});

  const steps = ['Choose Method', 'Enter Amount', 'Complete Payment'];

  const cashInMethods = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: <AccountBalance />,
      description: 'Transfer from your bank account',
      fee: 'Free',
      processingTime: 'Instant',
      minAmount: 10,
      maxAmount: 5000,
    },
    {
      id: 'card',
      name: 'Debit/Credit Card',
      icon: <CreditCard />,
      description: 'Add money using your card',
      fee: '2.9% + $0.30',
      processingTime: 'Instant',
      minAmount: 1,
      maxAmount: 2000,
    },
    {
      id: 'agent',
      name: 'Cash Agent',
      icon: <Store />,
      description: 'Visit a nearby agent location',
      fee: '$2.00',
      processingTime: 'Instant',
      minAmount: 20,
      maxAmount: 1000,
    },
    {
      id: 'atm',
      name: 'ATM Deposit',
      icon: <MonetizationOn />,
      description: 'Deposit cash at partner ATMs',
      fee: '$1.50',
      processingTime: 'Instant',
      minAmount: 20,
      maxAmount: 500,
    },
  ];

  const banks = [
    { id: 'chase', name: 'Chase Bank', logo: '🏦' },
    { id: 'bofa', name: 'Bank of America', logo: '🏦' },
    { id: 'wells', name: 'Wells Fargo', logo: '🏦' },
    { id: 'citi', name: 'Citibank', logo: '🏦' },
  ];

  const nearbyAgents = [
    {
      id: 1,
      name: 'QuickMart Store',
      address: '123 Main St, Downtown',
      distance: '0.2 miles',
      hours: '24/7',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'City Convenience',
      address: '456 Oak Ave, Midtown',
      distance: '0.5 miles',
      hours: '6 AM - 11 PM',
      rating: 4.6,
    },
    {
      id: 3,
      name: 'Metro Gas Station',
      address: '789 Pine St, Uptown',
      distance: '0.8 miles',
      hours: '24/7',
      rating: 4.7,
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateFee = (method, amount) => {
    const amt = parseFloat(amount) || 0;
    switch (method) {
      case 'bank':
        return 0;
      case 'card':
        return amt * 0.029 + 0.30;
      case 'agent':
        return 2.00;
      case 'atm':
        return 1.50;
      default:
        return 0;
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    const selectedMethodData = cashInMethods.find(m => m.id === selectedMethod);

    switch (step) {
      case 0:
        if (!selectedMethod) {
          newErrors.method = 'Please select a cash-in method';
        }
        break;
      case 1:
        if (!amount || parseFloat(amount) <= 0) {
          newErrors.amount = 'Please enter a valid amount';
        } else if (selectedMethodData) {
          if (parseFloat(amount) < selectedMethodData.minAmount) {
            newErrors.amount = `Minimum amount is ${formatCurrency(selectedMethodData.minAmount)}`;
          } else if (parseFloat(amount) > selectedMethodData.maxAmount) {
            newErrors.amount = `Maximum amount is ${formatCurrency(selectedMethodData.maxAmount)}`;
          }
        }
        
        if (selectedMethod === 'bank' && !selectedBank) {
          newErrors.bank = 'Please select a bank';
        }
        if (selectedMethod === 'agent' && !selectedAgent) {
          newErrors.agent = 'Please select an agent location';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCashIn = async () => {
    try {
      // Simulate cash-in process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setActiveStep(3); // Success step
    } catch (error) {
      console.error('Error processing cash-in:', error);
    }
  };

  const selectedMethodData = cashInMethods.find(m => m.id === selectedMethod);
  const fee = calculateFee(selectedMethod, amount);
  const total = (parseFloat(amount) || 0) + fee;

  if (loading) {
    return <LoadingSpinner fullScreen message="Processing..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Add Money
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add money to your wallet using various methods
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {activeStep < 3 && (
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}

              {/* Step 0: Choose Method */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    How would you like to add money?
                  </Typography>

                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                    >
                      {cashInMethods.map((method) => (
                        <Paper
                          key={method.id}
                          variant="outlined"
                          sx={{
                            p: 2,
                            mb: 2,
                            cursor: 'pointer',
                            border: selectedMethod === method.id ? 2 : 1,
                            borderColor: selectedMethod === method.id ? 'primary.main' : 'divider',
                            '&:hover': {
                              borderColor: 'primary.main',
                            },
                          }}
                          onClick={() => setSelectedMethod(method.id)}
                        >
                          <FormControlLabel
                            value={method.id}
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Box sx={{ mr: 2, color: 'primary.main' }}>
                                  {method.icon}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" gutterBottom>
                                    {method.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {method.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <Chip
                                      label={`Fee: ${method.fee}`}
                                      size="small"
                                      color={method.fee === 'Free' ? 'success' : 'default'}
                                    />
                                    <Chip
                                      label={method.processingTime}
                                      size="small"
                                      icon={<Speed />}
                                    />
                                    <Chip
                                      label={`${formatCurrency(method.minAmount)} - ${formatCurrency(method.maxAmount)}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </Box>
                                </Box>
                              </Box>
                            }
                            sx={{ m: 0, width: '100%' }}
                          />
                        </Paper>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  {errors.method && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.method}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button onClick={() => navigate('/wallet')}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!selectedMethod}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 1: Enter Amount */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Enter Amount
                  </Typography>

                  {selectedMethodData && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        <strong>{selectedMethodData.name}</strong> - {selectedMethodData.description}
                      </Typography>
                      <Typography variant="body2">
                        Fee: {selectedMethodData.fee} • Processing: {selectedMethodData.processingTime}
                      </Typography>
                      <Typography variant="body2">
                        Limits: {formatCurrency(selectedMethodData.minAmount)} - {formatCurrency(selectedMethodData.maxAmount)}
                      </Typography>
                    </Alert>
                  )}

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

                  {/* Bank Selection */}
                  {selectedMethod === 'bank' && (
                    <Box sx={{ mb: 3 }}>
                      <FormLabel component="legend" sx={{ mb: 2 }}>
                        Select Bank
                      </FormLabel>
                      <RadioGroup
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                      >
                        {banks.map((bank) => (
                          <FormControlLabel
                            key={bank.id}
                            value={bank.id}
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography sx={{ mr: 1 }}>{bank.logo}</Typography>
                                <Typography>{bank.name}</Typography>
                              </Box>
                            }
                          />
                        ))}
                      </RadioGroup>
                      {errors.bank && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {errors.bank}
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* Agent Selection */}
                  {selectedMethod === 'agent' && (
                    <Box sx={{ mb: 3 }}>
                      <FormLabel component="legend" sx={{ mb: 2 }}>
                        Select Agent Location
                      </FormLabel>
                      <RadioGroup
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                      >
                        {nearbyAgents.map((agent) => (
                          <Paper
                            key={agent.id}
                            variant="outlined"
                            sx={{
                              p: 2,
                              mb: 1,
                              cursor: 'pointer',
                              border: selectedAgent === agent.id.toString() ? 2 : 1,
                              borderColor: selectedAgent === agent.id.toString() ? 'primary.main' : 'divider',
                            }}
                            onClick={() => setSelectedAgent(agent.id.toString())}
                          >
                            <FormControlLabel
                              value={agent.id.toString()}
                              control={<Radio />}
                              label={
                                <Box>
                                  <Typography variant="body1" fontWeight="medium">
                                    {agent.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                                    {agent.address} • {agent.distance}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Hours: {agent.hours} • Rating: ⭐ {agent.rating}
                                  </Typography>
                                </Box>
                              }
                              sx={{ m: 0, width: '100%' }}
                            />
                          </Paper>
                        ))}
                      </RadioGroup>
                      {errors.agent && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {errors.agent}
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* Fee Breakdown */}
                  {amount && (
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Transaction Summary
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Amount</Typography>
                          <Typography>{formatCurrency(parseFloat(amount) || 0)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Fee</Typography>
                          <Typography>{formatCurrency(fee)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6">Total</Typography>
                          <Typography variant="h6" color="primary.main">
                            {formatCurrency(total)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!amount || parseFloat(amount) <= 0}
                    >
                      Continue
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 2: Complete Payment */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Complete Payment
                  </Typography>

                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Payment Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Method
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedMethodData?.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Amount
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(parseFloat(amount) || 0)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Fee
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(fee)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {formatCurrency(total)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {selectedMethod === 'agent' && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Next Steps:
                      </Typography>
                      <Typography variant="body2">
                        1. Visit the selected agent location
                      </Typography>
                      <Typography variant="body2">
                        2. Show this confirmation to the agent
                      </Typography>
                      <Typography variant="body2">
                        3. Pay cash and receive confirmation
                      </Typography>
                    </Alert>
                  )}

                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Please review all details carefully before proceeding.
                  </Alert>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleCashIn}
                      startIcon={<AccountBalanceWallet />}
                      disabled={loading}
                    >
                      {selectedMethod === 'agent' ? 'Generate Code' : 'Add Money'}
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 3: Success */}
              {activeStep === 3 && (
                <Box sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom color="success.main">
                    {selectedMethod === 'agent' ? 'Code Generated!' : 'Money Added Successfully!'}
                  </Typography>
                  
                  {selectedMethod === 'agent' ? (
                    <Box>
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        Show this code to the agent to complete your cash-in
                      </Typography>
                      <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.100' }}>
                        <Typography variant="h3" fontWeight="bold" color="primary.main">
                          AG-{Math.random().toString(36).substr(2, 6).toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Valid for 24 hours
                        </Typography>
                      </Paper>
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {formatCurrency(parseFloat(amount))} has been added to your wallet
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/transactions')}
                    >
                      View Transaction
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/wallet')}
                    >
                      Back to Wallet
                    </Button>
                  </Box>
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
                Current Balance
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {formatCurrency(user?.availableBalance || 1200.75)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available balance
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Features
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Security color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Encrypted Transactions"
                    secondary="All transactions are secured"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Instant Processing"
                    secondary="Money available immediately"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountBalance color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Bank-Level Security"
                    secondary="Your money is protected"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CashIn;