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
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  RequestPage,
  Person,
  CheckCircle,
  Search,
  ContactPhone,
  Email,
  QrCode,
  Favorite,
  History,
  Share,
  ContentCopy,
  Cancel,
  Pending,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RequestMoney = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [recipientType, setRecipientType] = useState('phone');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [requestLink, setRequestLink] = useState('');

  const steps = ['Select Person', 'Enter Details', 'Share Request'];

  const [recentContacts] = useState([
    { id: 1, name: 'John Doe', phone: '+1234567890', email: 'john@example.com', avatar: 'J' },
    { id: 2, name: 'Jane Smith', phone: '+1234567891', email: 'jane@example.com', avatar: 'J' },
    { id: 3, name: 'Mike Johnson', phone: '+1234567892', email: 'mike@example.com', avatar: 'M' },
  ]);

  const [pendingRequests] = useState([
    {
      id: 1,
      recipient: 'John Doe',
      amount: 50.00,
      note: 'Dinner split',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z',
      expiresAt: '2024-01-22T10:30:00Z'
    },
    {
      id: 2,
      recipient: 'Jane Smith',
      amount: 25.00,
      note: 'Coffee',
      status: 'pending',
      createdAt: '2024-01-14T15:20:00Z',
      expiresAt: '2024-01-21T15:20:00Z'
    },
    {
      id: 3,
      recipient: 'Mike Johnson',
      amount: 100.00,
      note: 'Concert tickets',
      status: 'paid',
      createdAt: '2024-01-13T09:15:00Z',
      paidAt: '2024-01-14T11:30:00Z'
    },
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
          newErrors.recipient = 'Please select a person or enter contact details';
        }
        break;
      case 1:
        if (!amount || parseFloat(amount) <= 0) {
          newErrors.amount = 'Please enter a valid amount';
        }
        if (!note.trim()) {
          newErrors.note = 'Please add a note explaining what this request is for';
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

  const handleCreateRequest = async () => {
    try {
      // Simulate creating request
      await new Promise(resolve => setTimeout(resolve, 1500));
      const link = `https://app.example.com/pay/${Math.random().toString(36).substr(2, 9)}`;
      setRequestLink(link);
      setActiveStep(2);
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(requestLink);
    // Show success message
  };

  const handleCancelRequest = (requestId) => {
    // Handle cancel request
    console.log('Canceling request:', requestId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'paid':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Pending />;
      case 'paid':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return null;
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
          Request Money
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Request money from friends, family, or anyone
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="New Request" />
          <Tab label="My Requests" />
        </Tabs>
      </Paper>

      {/* New Request Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Step 0: Select Person */}
                {activeStep === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Who do you want to request money from?
                    </Typography>

                    {/* Search */}
                    <Box sx={{ mb: 3 }}>
                      <FormControl sx={{ minWidth: 120, mr: 2 }}>
                        <InputLabel>Contact by</InputLabel>
                        <Select
                          value={recipientType}
                          label="Contact by"
                          onChange={(e) => setRecipientType(e.target.value)}
                        >
                          <MenuItem value="phone">Phone</MenuItem>
                          <MenuItem value="email">Email</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        placeholder={`Enter ${recipientType} or search name`}
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
                              secondary={`${contact.phone} • ${contact.email}`}
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

                {/* Step 1: Enter Details */}
                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Request Details
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
                      label="What's this for?"
                      multiline
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      error={!!errors.note}
                      helperText={errors.note}
                      placeholder="e.g., Dinner split, Concert tickets, etc."
                      sx={{ mb: 3 }}
                    />

                    <Alert severity="info" sx={{ mb: 3 }}>
                      The person will receive a notification with your request and can pay you directly.
                    </Alert>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleCreateRequest}
                        disabled={!amount || !note.trim()}
                      >
                        Create Request
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Step 2: Share Request */}
                {activeStep === 2 && (
                  <Box>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                      <Typography variant="h5" gutterBottom color="success.main">
                        Request Created!
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        Your request for {formatCurrency(parseFloat(amount))} has been created
                      </Typography>
                    </Box>

                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Request Summary
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              From
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedContact?.name || 'Recipient'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Amount
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {formatCurrency(parseFloat(amount || 0))}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Note
                            </Typography>
                            <Typography variant="body1">
                              {note}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    <Typography variant="h6" gutterBottom>
                      Share Request
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Payment Link"
                        value={requestLink}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleCopyLink}>
                                <ContentCopy />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Share />}
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: 'Payment Request',
                                text: `Please pay me ${formatCurrency(parseFloat(amount))} for ${note}`,
                                url: requestLink,
                              });
                            }
                          }}
                        >
                          Share
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Email />}
                        >
                          Send Email
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setTabValue(1)}
                      >
                        View My Requests
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
                  Generate QR Code
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ContactPhone />}
                  sx={{ mb: 2 }}
                >
                  Request from Contacts
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<History />}
                  onClick={() => setTabValue(1)}
                >
                  My Requests
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* My Requests Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Money Requests
                </Typography>
                
                {pendingRequests.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <RequestPage sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No requests yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first money request to get started
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setTabValue(0)}
                      sx={{ mt: 2 }}
                    >
                      Create Request
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {pendingRequests.map((request) => (
                      <ListItem key={request.id} divider>
                        <ListItemAvatar>
                          <Avatar>
                            {getStatusIcon(request.status)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                {request.recipient}
                              </Typography>
                              <Chip
                                label={request.status}
                                color={getStatusColor(request.status)}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatCurrency(request.amount)} • {request.note}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Created: {new Date(request.createdAt).toLocaleDateString()}
                                {request.status === 'pending' && (
                                  <> • Expires: {new Date(request.expiresAt).toLocaleDateString()}</>
                                )}
                                {request.paidAt && (
                                  <> • Paid: {new Date(request.paidAt).toLocaleDateString()}</>
                                )}
                              </Typography>
                            </Box>
                          }
                        />
                        {request.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyLink()}
                              title="Copy link"
                            >
                              <ContentCopy />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleCancelRequest(request.id)}
                              title="Cancel request"
                              color="error"
                            >
                              <Cancel />
                            </IconButton>
                          </Box>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default RequestMoney;