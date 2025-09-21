import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  TextField,
} from '@mui/material';
import {
  Language,
  Palette,
  Notifications,
  Security,
  Fingerprint,
  VolumeUp,
  Vibration,
  LocationOn,
  DataUsage,
  Backup,
  CloudSync,
  Delete,
  Restore,
  Download,
  Upload,
  Warning,
  Info,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Settings = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [settings, setSettings] = useState({
    // App Preferences
    language: 'en',
    theme: 'system',
    currency: 'USD',
    
    // Notifications
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    transactionAlerts: true,
    promotionalEmails: false,
    
    // Privacy & Security
    biometricAuth: true,
    twoFactorAuth: true,
    locationServices: false,
    dataSharing: false,
    
    // Sound & Vibration
    soundEnabled: true,
    vibrationEnabled: true,
    notificationVolume: 70,
    
    // Data & Storage
    autoBackup: true,
    cloudSync: true,
    dataUsageLimit: false,
    monthlyDataLimit: 1000, // MB
    
    // Advanced
    developerMode: false,
    analyticsSharing: true,
  });

  const [resetDialog, setResetDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ar', name: 'العربية' },
  ];

  const themes = [
    { value: 'light', name: 'Light' },
    { value: 'dark', name: 'Dark' },
    { value: 'system', name: 'System Default' },
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' },
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, dispatch update action
      // dispatch(updateSettings(settings));
      
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      // Reset to default settings
      setSettings({
        language: 'en',
        theme: 'system',
        currency: 'USD',
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        transactionAlerts: true,
        promotionalEmails: false,
        biometricAuth: true,
        twoFactorAuth: true,
        locationServices: false,
        dataSharing: false,
        soundEnabled: true,
        vibrationEnabled: true,
        notificationVolume: 70,
        autoBackup: true,
        cloudSync: true,
        dataUsageLimit: false,
        monthlyDataLimit: 1000,
        developerMode: false,
        analyticsSharing: true,
      });
      setResetDialog(false);
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const handleExportData = () => {
    // In a real app, this would export user data
    const dataToExport = {
      profile: user,
      settings: settings,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `wallet-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    setExportDialog(false);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading settings..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your app experience and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* App Preferences */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                App Preferences
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      label="Language"
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      label="Theme"
                    >
                      {themes.map((theme) => (
                        <MenuItem key={theme.value} value={theme.value}>
                          {theme.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Default Currency</InputLabel>
                    <Select
                      value={settings.currency}
                      onChange={(e) => handleSettingChange('currency', e.target.value)}
                      label="Default Currency"
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency.code} value={currency.code}>
                          {currency.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive notifications on your device"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive important updates via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Receive alerts via text message"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary="Transaction Alerts"
                    secondary="Get notified of all transactions"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.transactionAlerts}
                      onChange={(e) => handleSettingChange('transactionAlerts', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Promotional Emails"
                    secondary="Receive offers and promotions"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.promotionalEmails}
                      onChange={(e) => handleSettingChange('promotionalEmails', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Privacy & Security
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Fingerprint />
                  </ListItemIcon>
                  <ListItemText
                    primary="Biometric Authentication"
                    secondary="Use fingerprint or face recognition"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.biometricAuth}
                      onChange={(e) => handleSettingChange('biometricAuth', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Extra security for your account"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary="Location Services"
                    secondary="Allow location-based features"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.locationServices}
                      onChange={(e) => handleSettingChange('locationServices', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <DataUsage />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Sharing"
                    secondary="Share anonymous usage data"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.dataSharing}
                      onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Sound & Vibration */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sound & Vibration
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <VolumeUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sound Effects"
                    secondary="Play sounds for actions"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.soundEnabled}
                      onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Vibration />
                  </ListItemIcon>
                  <ListItemText
                    primary="Vibration"
                    secondary="Vibrate for notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.vibrationEnabled}
                      onChange={(e) => handleSettingChange('vibrationEnabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography gutterBottom>
                  Notification Volume
                </Typography>
                <Slider
                  value={settings.notificationVolume}
                  onChange={(e, value) => handleSettingChange('notificationVolume', value)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  disabled={!settings.soundEnabled}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Data & Storage */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data & Storage
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Backup />
                  </ListItemIcon>
                  <ListItemText
                    primary="Auto Backup"
                    secondary="Automatically backup your data"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.autoBackup}
                      onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CloudSync />
                  </ListItemIcon>
                  <ListItemText
                    primary="Cloud Sync"
                    secondary="Sync data across devices"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.cloudSync}
                      onChange={(e) => handleSettingChange('cloudSync', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <DataUsage />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Usage Limit"
                    secondary="Set monthly data usage limit"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.dataUsageLimit}
                      onChange={(e) => handleSettingChange('dataUsageLimit', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              {settings.dataUsageLimit && (
                <Box sx={{ px: 2, pb: 2 }}>
                  <TextField
                    fullWidth
                    label="Monthly Data Limit (MB)"
                    type="number"
                    value={settings.monthlyDataLimit}
                    onChange={(e) => handleSettingChange('monthlyDataLimit', parseInt(e.target.value))}
                    InputProps={{
                      inputProps: { min: 100, max: 10000 }
                    }}
                  />
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
                Actions
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleSave}
                disabled={saveLoading}
                sx={{ mb: 2 }}
              >
                {saveLoading ? 'Saving...' : 'Save Settings'}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                onClick={() => setExportDialog(true)}
                sx={{ mb: 2 }}
              >
                Export Data
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Restore />}
                onClick={() => setResetDialog(true)}
                sx={{ mb: 2 }}
              >
                Reset to Default
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Usage
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  App Data
                </Typography>
                <Typography variant="h6">
                  45.2 MB
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Cache
                </Typography>
                <Typography variant="h6">
                  12.8 MB
                </Typography>
              </Box>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Delete />}
                size="small"
              >
                Clear Cache
              </Button>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              Some settings may require app restart to take effect.
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>
          <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
          Reset Settings
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={handleReset}>
            Reset Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>
          <Download sx={{ mr: 1, verticalAlign: 'middle' }} />
          Export Data
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            This will download a JSON file containing your profile information and settings.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Your exported data does not include sensitive information like passwords or payment details.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleExportData}>
            Export Data
          </Button>
        </DialogActions>
      </Dialog>

      {saveLoading && (
        <LoadingSpinner message="Saving settings..." />
      )}
    </Box>
  );
};

export default Settings;