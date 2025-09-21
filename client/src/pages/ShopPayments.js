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
  Badge,
  Fab,
} from '@mui/material';
import {
  Store,
  QrCode,
  LocationOn,
  Star,
  History,
  Search,
  CheckCircle,
  MonetizationOn,
  Receipt,
  Favorite,
  FavoriteBorder,
  CameraAlt,
  NearMe,
  Category,
  LocalOffer,
  Storefront,
  Restaurant,
  LocalGroceryStore,
  LocalGasStation,
  LocalPharmacy,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ShopPayments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [qrDialog, setQrDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { id: 'all', name: 'All', icon: <Category /> },
    { id: 'restaurant', name: 'Restaurants', icon: <Restaurant /> },
    { id: 'grocery', name: 'Grocery', icon: <LocalGroceryStore /> },
    { id: 'gas', name: 'Gas Stations', icon: <LocalGasStation /> },
    { id: 'pharmacy', name: 'Pharmacy', icon: <LocalPharmacy /> },
    { id: 'retail', name: 'Retail', icon: <Storefront /> },
  ];

  const nearbyMerchants = [
    {
      id: 1,
      name: 'Starbucks Coffee',
      category: 'restaurant',
      address: '123 Main St, Downtown',
      distance: '0.1 miles',
      rating: 4.5,
      offers: ['5% cashback', 'Free drink after 10 purchases'],
      logo: '☕',
      isFavorite: true,
      acceptsWallet: true,
    },
    {
      id: 2,
      name: 'Whole Foods Market',
      category: 'grocery',
      address: '456 Oak Ave, Midtown',
      distance: '0.3 miles',
      rating: 4.3,
      offers: ['2% cashback on groceries'],
      logo: '🛒',
      isFavorite: false,
      acceptsWallet: true,
    },
    {
      id: 3,
      name: 'Shell Gas Station',
      category: 'gas',
      address: '789 Pine St, Uptown',
      distance: '0.5 miles',
      rating: 4.1,
      offers: ['3¢ off per gallon'],
      logo: '⛽',
      isFavorite: true,
      acceptsWallet: true,
    },
    {
      id: 4,
      name: 'CVS Pharmacy',
      category: 'pharmacy',
      address: '321 Elm St, Downtown',
      distance: '0.2 miles',
      rating: 4.0,
      offers: ['ExtraBucks rewards'],
      logo: '💊',
      isFavorite: false,
      acceptsWallet: true,
    },
    {
      id: 5,
      name: 'Target',
      category: 'retail',
      address: '654 Maple Ave, Westside',
      distance: '0.8 miles',
      rating: 4.4,
      offers: ['5% off with RedCard', '1% cashback'],
      logo: '🎯',
      isFavorite: false,
      acceptsWallet: true,
    },
    {
      id: 6,
      name: 'McDonald\'s',
      category: 'restaurant',
      address: '987 Broadway, Central',
      distance: '0.4 miles',
      rating: 3.9,
      offers: ['Buy 1 Get 1 Free on Fridays'],
      logo: '🍟',
      isFavorite: false,
      acceptsWallet: true,
    },
  ];

  const recentPayments = [
    {
      id: 1,
      merchantName: 'Starbucks Coffee',
      amount: 12.50,
      date: '2023-12-15',
      status: 'completed',
      cashback: 0.63,
      logo: '☕',
    },
    {
      id: 2,
      merchantName: 'Whole Foods Market',
      amount: 85.30,
      date: '2023-12-14',
      status: 'completed',
      cashback: 1.71,
      logo: '🛒',
    },
    {
      id: 3,
      merchantName: 'Shell Gas Station',
      amount: 45.00,
      date: '2023-12-13',
      status: 'completed',
      cashback: 0.00,
      logo: '⛽',
    },
  ];

  const favoriteStores = nearbyMerchants.filter(merchant => merchant.isFavorite);

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

  const filteredMerchants = nearbyMerchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || merchant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const validatePayment = () => {
    const newErrors = {};
    const availableBalance = user?.availableBalance || 1200.75;

    if (!selectedMerchant) {
      newErrors.merchant = 'Please select a merchant';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(amount) > availableBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = () => {
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
      setSelectedMerchant(null);
      setAmount('');
      setPaymentDialog(false);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleMerchantSelect = (merchant) => {
    setSelectedMerchant(merchant);
    setPaymentDialog(true);
  };

  const toggleFavorite = (merchantId) => {
    // In a real app, this would update the backend
    console.log('Toggle favorite for merchant:', merchantId);
  };

  const calculateCashback = (merchant, amount) => {
    // Simple cashback calculation based on merchant offers
    const amt = parseFloat(amount) || 0;
    if (merchant.name.includes('Starbucks')) return amt * 0.05;
    if (merchant.name.includes('Whole Foods')) return amt * 0.02;
    if (merchant.name.includes('Target')) return amt * 0.01;
    return 0;
  };

  const estimatedCashback = selectedMerchant ? calculateCashback(selectedMerchant, amount) : 0;

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Shop Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pay at your favorite stores and earn rewards
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
                <Tab label="Nearby Stores" />
                <Tab label="Favorites" />
                <Tab label="Payment History" />
              </Tabs>

              {/* Nearby Stores Tab */}
              {activeTab === 0 && (
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="Search stores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {categories.map((category) => (
                        <Chip
                          key={category.id}
                          label={category.name}
                          icon={category.icon}
                          clickable
                          variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                          color={selectedCategory === category.id ? 'primary' : 'default'}
                          onClick={() => setSelectedCategory(category.id)}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    {filteredMerchants.map((merchant) => (
                      <Grid item xs={12} sm={6} key={merchant.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: 2,
                              borderColor: 'primary.main',
                            },
                          }}
                          onClick={() => handleMerchantSelect(merchant)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h4" sx={{ mr: 2 }}>
                                  {merchant.logo}
                                </Typography>
                                <Box>
                                  <Typography variant="h6" fontWeight="medium">
                                    {merchant.name}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Star sx={{ fontSize: 16, color: 'orange', mr: 0.5 }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {merchant.rating}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(merchant.id);
                                }}
                              >
                                {merchant.isFavorite ? (
                                  <Favorite color="error" />
                                ) : (
                                  <FavoriteBorder />
                                )}
                              </IconButton>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                              {merchant.address} • {merchant.distance}
                            </Typography>

                            {merchant.offers.length > 0 && (
                              <Box sx={{ mb: 1 }}>
                                {merchant.offers.slice(0, 2).map((offer, index) => (
                                  <Chip
                                    key={index}
                                    label={offer}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    icon={<LocalOffer />}
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip
                                label="Wallet Accepted"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<MonetizationOn />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMerchantSelect(merchant);
                                }}
                              >
                                Pay
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Favorites Tab */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Your Favorite Stores
                  </Typography>

                  {favoriteStores.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Store sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No favorite stores yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add stores to your favorites for quick access
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveTab(0)}
                      >
                        Browse Stores
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {favoriteStores.map((merchant) => (
                        <Grid item xs={12} sm={6} key={merchant.id}>
                          <Card
                            variant="outlined"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                boxShadow: 2,
                                borderColor: 'primary.main',
                              },
                            }}
                            onClick={() => handleMerchantSelect(merchant)}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h4" sx={{ mr: 2 }}>
                                  {merchant.logo}
                                </Typography>
                                <Box>
                                  <Typography variant="h6" fontWeight="medium">
                                    {merchant.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {merchant.distance} away
                                  </Typography>
                                </Box>
                              </Box>
                              <Button
                                variant="contained"
                                fullWidth
                                startIcon={<MonetizationOn />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMerchantSelect(merchant);
                                }}
                              >
                                Pay Now
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
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
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h4" sx={{ mr: 2 }}>
                              {payment.logo}
                            </Typography>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {payment.merchantName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(payment.date)}
                              </Typography>
                              {payment.cashback > 0 && (
                                <Typography variant="body2" color="success.main">
                                  Cashback: {formatCurrency(payment.cashback)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight="bold">
                              {formatCurrency(payment.amount)}
                            </Typography>
                            <Chip
                              label={payment.status}
                              size="small"
                              color="success"
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
                <ListItem button onClick={() => setQrDialog(true)}>
                  <ListItemIcon>
                    <QrCode />
                  </ListItemIcon>
                  <ListItemText primary="Scan QR Code" />
                </ListItem>
                <ListItem button onClick={() => setActiveTab(1)}>
                  <ListItemIcon>
                    <Favorite />
                  </ListItemIcon>
                  <ListItemText primary="Favorite Stores" />
                </ListItem>
                <ListItem button onClick={() => setActiveTab(2)}>
                  <ListItemIcon>
                    <History />
                  </ListItemIcon>
                  <ListItemText primary="Payment History" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                This Month's Rewards
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {formatCurrency(23.45)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total cashback earned
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code Scanner Dialog */}
      <Dialog open={qrDialog} onClose={() => setQrDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <QrCode sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Point your camera at the QR code
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Scan the merchant's QR code to make a payment
            </Typography>
            <Button
              variant="contained"
              startIcon={<CameraAlt />}
              onClick={() => {
                // In a real app, this would open the camera
                setQrDialog(false);
              }}
            >
              Open Camera
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Pay at {selectedMerchant?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedMerchant && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ mr: 2 }}>
                  {selectedMerchant.logo}
                </Typography>
                <Box>
                  <Typography variant="h6">
                    {selectedMerchant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMerchant.address}
                  </Typography>
                </Box>
              </Box>
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

            {amount && estimatedCashback > 0 && (
              <Alert severity="success" sx={{ mb: 3 }}>
                You'll earn {formatCurrency(estimatedCashback)} cashback on this purchase!
              </Alert>
            )}

            {selectedMerchant?.offers.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Available offers:
                </Typography>
                {selectedMerchant.offers.map((offer, index) => (
                  <Chip
                    key={index}
                    label={offer}
                    size="small"
                    color="success"
                    variant="outlined"
                    icon={<LocalOffer />}
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePayment}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Pay {amount ? formatCurrency(parseFloat(amount)) : ''}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Pay {formatCurrency(parseFloat(amount) || 0)} at {selectedMerchant?.name}?
          </Typography>
          {estimatedCashback > 0 && (
            <Typography variant="body2" color="success.main">
              You'll earn {formatCurrency(estimatedCashback)} cashback
            </Typography>
          )}
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
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Your payment has been processed successfully.
          </Typography>
          {estimatedCashback > 0 && (
            <Typography variant="body1" color="success.main">
              You earned {formatCurrency(estimatedCashback)} cashback!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialog(false)} fullWidth variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating QR Scanner Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setQrDialog(true)}
      >
        <QrCode />
      </Fab>
    </Box>
  );
};

export default ShopPayments;