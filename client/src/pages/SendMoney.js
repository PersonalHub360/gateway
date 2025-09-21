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
  Avatar,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Send,
  Person,
  AccountBalanceWallet,
  CheckCircle,
  Search,
  ContactPhone,
  Email,
  QrCode,
  Favorite,
  History,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SendMoney = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [recipientType, setRecipientType] = useState('phone');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [errors, setErrors] = useState({});

  const steps = ['Select Recipient', 'Enter Amount', 'Confirm & Send'];

  const [recentContacts] = useState([
    { id: 1, name: 'John Doe', phone: '+1234567890', email: 'john@example.com', avatar: 'J', lastTransaction: '2024-01-15' },
    { id: 2, name: 'Jane Smith', phone: '+1234567891', email: 'jane@example.com', avatar: 'J', lastTransaction: '2024-01-14' },
    { id: 3, name: 'Mike Johnson', phone: '+1234567892', email: 'mike@example.com', avatar: 'M', lastTransaction: '2024-01-13' },
  ]);

  const [favorites] = useState([
    { id: 1, name: 'Mom', phone: '+1234567893', email: 'mom@example.com', avatar: 'M' },
    { id: 2, name: 'Dad', phone: '+1234567894', email: 'dad@example.com', avatar: 'D' },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!selectedContact && !recipient) {
          newErrors.recipient = 'Please select a recipient or enter contact details';
        }
        break;
      case 1:
        if (!amount || parseFloat(amount) <= 0) {
          newErrors.amount = 'Please enter a valid amount';
        } else if (parseFloat(amount) > (user?.availableBalance || 1200.75)) {
          newErrors.amount = 'Insufficient balance';
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

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setRecipient(recipientType === 'phone' ? contact.phone : contact.email);
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm.length > 2) {
      // Simulate search results
      const results = recentContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSendMoney = async () => {
    try {
      // Simulate sending money
      await new Promise(resolve => setTimeout(resolve, 2000));
      setActiveStep(3); // Success step
    } catch (error) {
      console.error('Error sending money:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Processing..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Send Money
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Send money to friends, family, or anyone with a phone number or email
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

              {/* Step 0: Select Recipient */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Who do you want to send money to?
                  </Typography>

                  {/* Search */}
                  <Box sx={{ mb: 3 }}>
                    <FormControl sx={{ minWidth: 120, mr: 2 }}>
                      <InputLabel>Search by</InputLabel>
                      <Select
                        value={recipientType}
                        label="Search by"
                        onChange={(e) => setRecipientType(e.target.value)}
                      >
                        <MenuItem value="phone">Phone</MenuItem>
                        <MenuItem value="email">Email</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      placeholder={`Enter ${recipientType} number or search name`}
                      value={recipient}
                      onChange={(e) => {
                        setRecipient(e.target.value);
                        handleSearch(e.target.value);
                      }}
                      error={!!errors.recipient}
                      helperText={errors.recipient}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1 }}
                    />
                  </Box>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Search Results
                      </Typography>
                      <List>
                        {searchResults.map((contact) => (
                          <ListItem
                            key={contact.id}
                            button
                            onClick={() => handleContactSelect(contact)}
                            selected={selectedContact?.id === contact.id}
                          >
                            <ListItemAvatar>
                              <Avatar>{contact.avatar}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={contact.name}
                              secondary={`${contact.phone} • ${contact.email}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Favorites */}
                  {favorites.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Favorite sx={{ mr: 1, color: 'error.main' }} />
                        Favorites
                      </Typography>
                      <List>
                        {favorites.map((contact) => (
                          <ListItem
                            key={contact.id}
                            button
                            onClick={() => handleContactSelect(contact)}
                            selected={selectedContact?.id === contact.id}
                          >
                            <ListItemAvatar>
                              <Avatar>{contact.avatar}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={contact.name}
                              secondary={`${contact.phone} • ${contact.email}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Recent Contacts */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <History sx={{ mr: 1 }} />
                      Recent Contacts
                    </Typography>
                    <List>
                      {recentContacts.map((contact) => (
                        <ListItem
                          key={contact.id}
                          button
                          onClick={() => handleContactSelect(contact)}
                          selected={selectedContact?.id === contact.id}
                        >
                          <ListItemAvatar>
                            <Avatar>{contact.avatar}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={contact.name}
                            secondary={`${contact.phone} • Last sent: ${new Date(contact.lastTransaction).toLocaleDateString()}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button onClick={() => navigate('/dashboard')}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!selectedContact && !recipient}
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
                    How much do you want to send?
                  </Typography>

                  {selectedContact && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Avatar sx={{ mr: 2 }}>{selectedContact.avatar}</Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedContact.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {recipientType === 'phone' ? selectedContact.phone : selectedContact.email}
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
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Note (Optional)"
                    multiline
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's this for?"
                    sx={{ mb: 3 }}
                  />

                  <Alert severity="info" sx={{ mb: 3 }}>
                    Available balance: {formatCurrency(user?.availableBalance || 1200.75)}
                  </Alert>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!amount || parseFloat(amount) <= 0}
                    >
                      Review
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 2: Confirm & Send */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Confirm Transaction
                  </Typography>

                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 2 }}>{selectedContact?.avatar || 'U'}</Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {selectedContact?.name || 'Recipient'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {recipient}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Amount
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatCurrency(parseFloat(amount || 0))}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Fee
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            Free
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Total
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="primary.main">
                            {formatCurrency(parseFloat(amount || 0))}
                          </Typography>
                        </Grid>
                        {note && (
                          <>
                            <Grid item xs={12}>
                              <Divider />
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">
                                Note
                              </Typography>
                              <Typography variant="body1">
                                {note}
                              </Typography>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>

                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Please review the details carefully. This transaction cannot be undone.
                  </Alert>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSendMoney}
                      startIcon={<Send />}
                      disabled={loading}
                    >
                      Send Money
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 3: Success */}
              {activeStep === 3 && (
                <Box sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom color="success.main">
                    Money Sent Successfully!
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {formatCurrency(parseFloat(amount))} has been sent to {selectedContact?.name || 'recipient'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/transactions')}
                    >
                      View Transaction
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/dashboard')}
                    >
                      Back to Dashboard
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
                Quick Actions
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<QrCode />}
                sx={{ mb: 2 }}
              >
                Scan QR Code
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ContactPhone />}
                sx={{ mb: 2 }}
              >
                Send to Contacts
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<History />}
                onClick={() => navigate('/transactions')}
              >
                Transaction History
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Balance
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {formatCurrency(user?.availableBalance || 1200.75)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available to send
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SendMoney;