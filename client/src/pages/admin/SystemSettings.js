import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Settings,
  Security,
  Payment,
  Notifications,
  Storage,
  Api,
  Save,
  Refresh,
  Edit,
  Delete,
  Add,
  ExpandMore,
  Warning,
  CheckCircle,
  Error,
  Info,
  Upload,
  Download,
  Backup,
  RestoreFromTrash,
  MonetizationOn,
  Percent,
  Schedule,
  Language,
  Palette,
  Email,
  Sms,
  PhoneAndroid,
} from '@mui/icons-material';

const SystemSettings = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // System settings state
  const [settings, setSettings] = useState({
    general: {
      appName: 'Trea Gateway',
      appVersion: '1.0.0',
      timezone: 'UTC',
      language: 'en',
      currency: 'USD',
      maintenanceMode: false,
      debugMode: false,
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowedIpRanges: [],
      encryptionEnabled: true,
    },
    payment: {
      defaultFeePercentage: 2.5,
      minTransactionAmount: 1.00,
      maxTransactionAmount: 10000.00,
      dailyTransactionLimit: 50000.00,
      monthlyTransactionLimit: 500000.00,
      autoApprovalThreshold: 1000.00,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      emailProvider: 'smtp',
      smsProvider: 'twilio',
      pushProvider: 'firebase',
    },
    api: {
      rateLimit: 1000,
      rateLimitWindow: 3600,
      apiVersion: 'v1',
      webhookRetries: 3,
      webhookTimeout: 30,
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      backupLocation: 's3',
    },
  });

  const [feeStructure, setFeeStructure] = useState([
    { id: 1, type: 'send_money', percentage: 2.5, fixedFee: 0.50, minFee: 0.50, maxFee: 25.00 },
    { id: 2, type: 'cash_in', percentage: 1.0, fixedFee: 1.00, minFee: 1.00, maxFee: 10.00 },
    { id: 3, type: 'cash_out', percentage: 1.5, fixedFee: 2.00, minFee: 2.00, maxFee: 15.00 },
    { id: 4, type: 'bill_payment', percentage: 0.5, fixedFee: 0.25, minFee: 0.25, maxFee: 5.00 },
  ]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Settings would be fetched from API
    } catch (error) {
      console.error('Error fetching settings:', error);
      showSnackbar('Error fetching settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = async (category) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSnackbar(`${category} settings saved successfully`, 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (type, item = null) => {
    setDialogType(type);
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setDialogType('');
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const GeneralSettings = () => (
    <Card>
      <CardHeader title="General Settings" />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Application Name"
              value={settings.general.appName}
              onChange={(e) => handleSettingChange('general', 'appName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Application Version"
              value={settings.general.appVersion}
              onChange={(e) => handleSettingChange('general', 'appVersion', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={settings.general.timezone}
                label="Timezone"
                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="America/New_York">Eastern Time</MenuItem>
                <MenuItem value="America/Chicago">Central Time</MenuItem>
                <MenuItem value="America/Denver">Mountain Time</MenuItem>
                <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Default Language</InputLabel>
              <Select
                value={settings.general.language}
                label="Default Language"
                onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Default Currency</InputLabel>
              <Select
                value={settings.general.currency}
                label="Default Currency"
                onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
              >
                <MenuItem value="USD">USD - US Dollar</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
                <MenuItem value="GBP">GBP - British Pound</MenuItem>
                <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                />
              }
              label="Maintenance Mode"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.general.debugMode}
                  onChange={(e) => handleSettingChange('general', 'debugMode', e.target.checked)}
                />
              }
              label="Debug Mode"
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => handleSaveSettings('general')}
          >
            Save Changes
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const SecuritySettings = () => (
    <Card>
      <CardHeader title="Security Settings" />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Session Timeout (minutes)"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Login Attempts"
              value={settings.security.maxLoginAttempts}
              onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Password Minimum Length"
              value={settings.security.passwordMinLength}
              onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.security.requireTwoFactor}
                  onChange={(e) => handleSettingChange('security', 'requireTwoFactor', e.target.checked)}
                />
              }
              label="Require Two-Factor Authentication"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.security.encryptionEnabled}
                  onChange={(e) => handleSettingChange('security', 'encryptionEnabled', e.target.checked)}
                />
              }
              label="Enable Data Encryption"
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => handleSaveSettings('security')}
          >
            Save Changes
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const PaymentSettings = () => (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Payment Limits" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Transaction Amount"
                value={settings.payment.minTransactionAmount}
                onChange={(e) => handleSettingChange('payment', 'minTransactionAmount', parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Transaction Amount"
                value={settings.payment.maxTransactionAmount}
                onChange={(e) => handleSettingChange('payment', 'maxTransactionAmount', parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Daily Transaction Limit"
                value={settings.payment.dailyTransactionLimit}
                onChange={(e) => handleSettingChange('payment', 'dailyTransactionLimit', parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Monthly Transaction Limit"
                value={settings.payment.monthlyTransactionLimit}
                onChange={(e) => handleSettingChange('payment', 'monthlyTransactionLimit', parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Auto-Approval Threshold"
                value={settings.payment.autoApprovalThreshold}
                onChange={(e) => handleSettingChange('payment', 'autoApprovalThreshold', parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => handleSaveSettings('payment')}
            >
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Fee Structure"
          action={
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => handleDialogOpen('addFee')}
            >
              Add Fee
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction Type</TableCell>
                  <TableCell align="right">Percentage (%)</TableCell>
                  <TableCell align="right">Fixed Fee ($)</TableCell>
                  <TableCell align="right">Min Fee ($)</TableCell>
                  <TableCell align="right">Max Fee ($)</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feeStructure.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <Chip label={fee.type.replace('_', ' ')} />
                    </TableCell>
                    <TableCell align="right">{fee.percentage}%</TableCell>
                    <TableCell align="right">${fee.fixedFee.toFixed(2)}</TableCell>
                    <TableCell align="right">${fee.minFee.toFixed(2)}</TableCell>
                    <TableCell align="right">${fee.maxFee.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleDialogOpen('editFee', fee)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDialogOpen('deleteFee', fee)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const NotificationSettings = () => (
    <Card>
      <CardHeader title="Notification Settings" />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Notification Channels
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.emailEnabled}
                  onChange={(e) => handleSettingChange('notifications', 'emailEnabled', e.target.checked)}
                />
              }
              label="Email Notifications"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.smsEnabled}
                  onChange={(e) => handleSettingChange('notifications', 'smsEnabled', e.target.checked)}
                />
              }
              label="SMS Notifications"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.pushEnabled}
                  onChange={(e) => handleSettingChange('notifications', 'pushEnabled', e.target.checked)}
                />
              }
              label="Push Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Provider Settings
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Email Provider</InputLabel>
              <Select
                value={settings.notifications.emailProvider}
                label="Email Provider"
                onChange={(e) => handleSettingChange('notifications', 'emailProvider', e.target.value)}
              >
                <MenuItem value="smtp">SMTP</MenuItem>
                <MenuItem value="sendgrid">SendGrid</MenuItem>
                <MenuItem value="mailgun">Mailgun</MenuItem>
                <MenuItem value="ses">Amazon SES</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>SMS Provider</InputLabel>
              <Select
                value={settings.notifications.smsProvider}
                label="SMS Provider"
                onChange={(e) => handleSettingChange('notifications', 'smsProvider', e.target.value)}
              >
                <MenuItem value="twilio">Twilio</MenuItem>
                <MenuItem value="nexmo">Nexmo</MenuItem>
                <MenuItem value="aws-sns">AWS SNS</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Push Provider</InputLabel>
              <Select
                value={settings.notifications.pushProvider}
                label="Push Provider"
                onChange={(e) => handleSettingChange('notifications', 'pushProvider', e.target.value)}
              >
                <MenuItem value="firebase">Firebase</MenuItem>
                <MenuItem value="onesignal">OneSignal</MenuItem>
                <MenuItem value="pusher">Pusher</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => handleSaveSettings('notifications')}
          >
            Save Changes
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const APISettings = () => (
    <Card>
      <CardHeader title="API Settings" />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Rate Limit (requests)"
              value={settings.api.rateLimit}
              onChange={(e) => handleSettingChange('api', 'rateLimit', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Rate Limit Window (seconds)"
              value={settings.api.rateLimitWindow}
              onChange={(e) => handleSettingChange('api', 'rateLimitWindow', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="API Version"
              value={settings.api.apiVersion}
              onChange={(e) => handleSettingChange('api', 'apiVersion', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Webhook Retries"
              value={settings.api.webhookRetries}
              onChange={(e) => handleSettingChange('api', 'webhookRetries', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Webhook Timeout (seconds)"
              value={settings.api.webhookTimeout}
              onChange={(e) => handleSettingChange('api', 'webhookTimeout', parseInt(e.target.value))}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => handleSaveSettings('api')}
          >
            Save Changes
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const BackupSettings = () => (
    <Card>
      <CardHeader title="Backup & Recovery" />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.backup.autoBackup}
                  onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                />
              }
              label="Enable Automatic Backups"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Backup Frequency</InputLabel>
              <Select
                value={settings.backup.backupFrequency}
                label="Backup Frequency"
                onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Retention Days"
              value={settings.backup.retentionDays}
              onChange={(e) => handleSettingChange('backup', 'retentionDays', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Backup Location</InputLabel>
              <Select
                value={settings.backup.backupLocation}
                label="Backup Location"
                onChange={(e) => handleSettingChange('backup', 'backupLocation', e.target.value)}
              >
                <MenuItem value="local">Local Storage</MenuItem>
                <MenuItem value="s3">Amazon S3</MenuItem>
                <MenuItem value="gcs">Google Cloud Storage</MenuItem>
                <MenuItem value="azure">Azure Blob Storage</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Backup />}>
            Create Backup Now
          </Button>
          <Button variant="outlined" startIcon={<RestoreFromTrash />}>
            Restore from Backup
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => handleSaveSettings('backup')}
          >
            Save Changes
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const tabs = [
    { label: 'General', icon: <Settings />, component: <GeneralSettings /> },
    { label: 'Security', icon: <Security />, component: <SecuritySettings /> },
    { label: 'Payment', icon: <Payment />, component: <PaymentSettings /> },
    { label: 'Notifications', icon: <Notifications />, component: <NotificationSettings /> },
    { label: 'API', icon: <Api />, component: <APISettings /> },
    { label: 'Backup', icon: <Storage />, component: <BackupSettings /> },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          System Settings
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Upload />}>
            Import Config
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            Export Config
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchSettings}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Settings Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Settings Content */}
      <Box sx={{ mt: 3 }}>
        {tabs[tabValue]?.component}
      </Box>

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

export default SystemSettings;