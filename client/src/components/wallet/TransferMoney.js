import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  AccountBalance as BankIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { transferMoney } from '../../store/slices/walletSlice';
import walletService from '../../services/walletService';

const steps = ['Recipient', 'Amount', 'Confirmation'];

const validationSchemas = {
  recipient: Yup.object({
    recipientType: Yup.string().required('Recipient type is required'),
    recipient: Yup.string().required('Recipient is required'),
  }),
  amount: Yup.object({
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required'),
    description: Yup.string().max(100, 'Description must be less than 100 characters'),
  }),
};

const TransferMoney = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { walletInfo, loading } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [transferData, setTransferData] = useState({});
  const [recentRecipients, setRecentRecipients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [fees, setFees] = useState(0);

  useEffect(() => {
    // Fetch recent recipients
    fetchRecentRecipients();
  }, []);

  const fetchRecentRecipients = async () => {
    try {
      // This would be an API call to get recent recipients
      const recipients = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+234801234567',
          avatar: null,
          lastTransfer: '2024-01-15',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+234807654321',
          avatar: null,
          lastTransfer: '2024-01-10',
        },
      ];
      setRecentRecipients(recipients);
    } catch (error) {
      console.error('Error fetching recent recipients:', error);
    }
  };

  const searchRecipients = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      // This would be an API call to search recipients
      const results = [
        {
          id: 3,
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '+234809876543',
          avatar: null,
        },
      ];
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching recipients:', error);
    } finally {
      setSearching(false);
    }
  };

  const calculateFees = async (amount) => {
    try {
      const feeData = await walletService.getTransactionFees('transfer', amount);
      setFees(feeData.fee || 0);
    } catch (error) {
      console.error('Error calculating fees:', error);
      setFees(0);
    }
  };

  const recipientFormik = useFormik({
    initialValues: {
      recipientType: 'wallet',
      recipient: '',
      searchQuery: '',
    },
    validationSchema: validationSchemas.recipient,
    onSubmit: (values) => {
      setTransferData({ ...transferData, ...values });
      setActiveStep(1);
    },
  });

  const amountFormik = useFormik({
    initialValues: {
      amount: '',
      description: '',
    },
    validationSchema: validationSchemas.amount,
    onSubmit: (values) => {
      setTransferData({ ...transferData, ...values });
      calculateFees(values.amount);
      setActiveStep(2);
    },
  });

  const handleRecipientSelect = (recipient) => {
    recipientFormik.setFieldValue('recipient', recipient.email || recipient.phone);
    setTransferData({
      ...transferData,
      recipientData: recipient,
      recipient: recipient.email || recipient.phone,
    });
  };

  const handleConfirmTransfer = async () => {
    try {
      const result = await dispatch(transferMoney({
        ...transferData,
        fees,
        totalAmount: parseFloat(transferData.amount) + fees,
      })).unwrap();

      setConfirmDialog(false);
      navigate('/transactions', {
        state: { transactionId: result.transactionId },
      });
    } catch (error) {
      console.error('Transfer error:', error);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderRecipientStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Recipient
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Transfer Type</InputLabel>
        <Select
          value={recipientFormik.values.recipientType}
          onChange={recipientFormik.handleChange}
          name="recipientType"
          label="Transfer Type"
        >
          <MenuItem value="wallet">Wallet to Wallet</MenuItem>
          <MenuItem value="bank">Bank Transfer</MenuItem>
          <MenuItem value="phone">Phone Number</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Search Recipients"
        value={recipientFormik.values.searchQuery}
        onChange={(e) => {
          recipientFormik.handleChange(e);
          searchRecipients(e.target.value);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searching && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {recipientFormik.values.searchQuery && searchResults.length > 0 && (
        <Paper sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ p: 2, pb: 0 }}>
            Search Results
          </Typography>
          <List>
            {searchResults.map((recipient) => (
              <ListItemButton
                key={recipient.id}
                onClick={() => handleRecipientSelect(recipient)}
              >
                <ListItemAvatar>
                  <Avatar src={recipient.avatar}>
                    {recipient.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={recipient.name}
                  secondary={recipient.email || recipient.phone}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      {recentRecipients.length > 0 && (
        <Paper>
          <Typography variant="subtitle2" sx={{ p: 2, pb: 0 }}>
            Recent Recipients
          </Typography>
          <List>
            {recentRecipients.map((recipient) => (
              <ListItemButton
                key={recipient.id}
                onClick={() => handleRecipientSelect(recipient)}
              >
                <ListItemAvatar>
                  <Avatar src={recipient.avatar}>
                    {recipient.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={recipient.name}
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        {recipient.email || recipient.phone}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last transfer: {new Date(recipient.lastTransfer).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      <TextField
        fullWidth
        label={
          recipientFormik.values.recipientType === 'wallet'
            ? 'Email or Phone'
            : recipientFormik.values.recipientType === 'bank'
            ? 'Account Number'
            : 'Phone Number'
        }
        value={recipientFormik.values.recipient}
        onChange={recipientFormik.handleChange}
        name="recipient"
        error={recipientFormik.touched.recipient && Boolean(recipientFormik.errors.recipient)}
        helperText={recipientFormik.touched.recipient && recipientFormik.errors.recipient}
        sx={{ mt: 3 }}
      />
    </Box>
  );

  const renderAmountStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Enter Amount
      </Typography>

      <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Available Balance
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {walletService.formatCurrency(walletInfo?.balance || 0)}
          </Typography>
        </CardContent>
      </Card>

      <TextField
        fullWidth
        label="Amount"
        type="number"
        value={amountFormik.values.amount}
        onChange={(e) => {
          amountFormik.handleChange(e);
          if (e.target.value) {
            calculateFees(parseFloat(e.target.value));
          }
        }}
        name="amount"
        error={amountFormik.touched.amount && Boolean(amountFormik.errors.amount)}
        helperText={amountFormik.touched.amount && amountFormik.errors.amount}
        InputProps={{
          startAdornment: <InputAdornment position="start">₦</InputAdornment>,
        }}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="Description (Optional)"
        multiline
        rows={3}
        value={amountFormik.values.description}
        onChange={amountFormik.handleChange}
        name="description"
        error={amountFormik.touched.description && Boolean(amountFormik.errors.description)}
        helperText={amountFormik.touched.description && amountFormik.errors.description}
        sx={{ mb: 3 }}
      />

      {fees > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Transaction fee: {walletService.formatCurrency(fees)}
        </Alert>
      )}
    </Box>
  );

  const renderConfirmationStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Confirm Transfer
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Recipient
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Avatar sx={{ mr: 2 }}>
                  {transferData.recipientData?.name?.[0] || 'R'}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {transferData.recipientData?.name || 'Unknown Recipient'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {transferData.recipient}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="h6" color="primary">
                {walletService.formatCurrency(transferData.amount)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Fee
              </Typography>
              <Typography variant="h6">
                {walletService.formatCurrency(fees)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Total Amount
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {walletService.formatCurrency(parseFloat(transferData.amount) + fees)}
                </Typography>
              </Box>
            </Grid>

            {transferData.description && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2">
                  {transferData.description}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {parseFloat(transferData.amount) + fees > walletInfo?.balance && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Insufficient balance. You need {walletService.formatCurrency(
            parseFloat(transferData.amount) + fees - walletInfo?.balance
          )} more.
        </Alert>
      )}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transfer Money
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {activeStep === 0 && (
            <form onSubmit={recipientFormik.handleSubmit}>
              {renderRecipientStep()}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!recipientFormik.values.recipient}
                >
                  Next
                </Button>
              </Box>
            </form>
          )}

          {activeStep === 1 && (
            <form onSubmit={amountFormik.handleSubmit}>
              {renderAmountStep()}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!amountFormik.values.amount}
                >
                  Next
                </Button>
              </Box>
            </form>
          )}

          {activeStep === 2 && (
            <Box>
              {renderConfirmationStep()}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setConfirmDialog(true)}
                  disabled={parseFloat(transferData.amount) + fees > walletInfo?.balance}
                >
                  Confirm Transfer
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Confirm Transfer
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to transfer{' '}
            <strong>{walletService.formatCurrency(parseFloat(transferData.amount) + fees)}</strong>{' '}
            to <strong>{transferData.recipientData?.name || transferData.recipient}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmTransfer}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransferMoney;