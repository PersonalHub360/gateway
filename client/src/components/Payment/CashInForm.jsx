import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createCashInTransaction } from '../../store/slices/paymentSlice';

const CashInForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.payment);
  
  const [formData, setFormData] = useState({
    paymentType: '',
    paymentMethod: '',
    amount: '',
    accountNumber: '',
    pin: '',
    bankAccount: '',
    routingNumber: '',
    description: ''
  });

  const [availableMethods, setAvailableMethods] = useState([]);

  const paymentTypes = [
    { value: 'merchant', label: 'Auto Merchant Payment' },
    { value: 'agent', label: 'Manual Agent Payment' },
    { value: 'personal', label: 'Manual Personal Payment' },
    { value: 'bank', label: 'Bank Payment' }
  ];

  const mobileWallets = [
    { value: 'bkash', label: 'bKash', color: '#E2136E' },
    { value: 'nagad', label: 'Nagad', color: '#F47920' },
    { value: 'rocket', label: 'Rocket', color: '#8E44AD' },
    { value: 'upay', label: 'Upay', color: '#00A651' }
  ];

  const banks = [
    { value: 'islami_bank', label: 'Islami Bank Limited' },
    { value: 'city_bank', label: 'City Bank Limited' },
    { value: 'brac_bank', label: 'BRAC Bank Limited' }
  ];

  useEffect(() => {
    if (formData.paymentType === 'bank') {
      setAvailableMethods(banks);
    } else {
      setAvailableMethods(mobileWallets);
    }
    setFormData(prev => ({ ...prev, paymentMethod: '' }));
  }, [formData.paymentType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    try {
      await dispatch(createCashInTransaction(transactionData)).unwrap();
      // Reset form on success
      setFormData({
        paymentType: '',
        paymentMethod: '',
        amount: '',
        accountNumber: '',
        pin: '',
        bankAccount: '',
        routingNumber: '',
        description: ''
      });
    } catch (error) {
      console.error('Cash-in failed:', error);
    }
  };

  const isFormValid = () => {
    const requiredFields = ['paymentType', 'paymentMethod', 'amount'];
    
    if (formData.paymentType === 'bank') {
      requiredFields.push('bankAccount', 'routingNumber');
    } else {
      requiredFields.push('accountNumber');
      if (formData.paymentType === 'merchant') {
        requiredFields.push('pin');
      }
    }

    return requiredFields.every(field => formData[field]);
  };

  const getMethodColor = (method) => {
    const wallet = mobileWallets.find(w => w.value === method);
    return wallet ? wallet.color : '#1976d2';
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Cash In
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleInputChange}
                  label="Payment Type"
                >
                  {paymentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {formData.paymentType && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    label="Payment Method"
                  >
                    {availableMethods.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {formData.paymentType !== 'bank' && (
                            <Chip
                              size="small"
                              sx={{ 
                                backgroundColor: getMethodColor(method.value),
                                color: 'white',
                                minWidth: 60
                              }}
                              label={method.label}
                            />
                          )}
                          {formData.paymentType === 'bank' && method.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="amount"
                label="Amount (BDT)"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                inputProps={{ min: 1, step: 0.01 }}
              />
            </Grid>

            {formData.paymentType === 'bank' ? (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    name="bankAccount"
                    label="Bank Account Number"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    name="routingNumber"
                    label="Routing Number"
                    value={formData.routingNumber}
                    onChange={handleInputChange}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    name="accountNumber"
                    label="Mobile Number"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="01XXXXXXXXX"
                  />
                </Grid>
                {formData.paymentType === 'merchant' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      name="pin"
                      label="PIN"
                      type="password"
                      value={formData.pin}
                      onChange={handleInputChange}
                    />
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description (Optional)"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!isFormValid() || loading}
                sx={{ 
                  py: 1.5,
                  backgroundColor: formData.paymentMethod ? getMethodColor(formData.paymentMethod) : undefined
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Cash In ${formData.amount ? `৳${formData.amount}` : ''}`
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CashInForm;