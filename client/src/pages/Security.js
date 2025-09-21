import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
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
  TextField,
  Chip,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Security,
  Fingerprint,
  Key,
  Shield,
  Lock,
  Visibility,
  VisibilityOff,
  PhoneAndroid,
  Computer,
  LocationOn,
  Warning,
  CheckCircle,
  Error,
  Info,
  Delete,
  Add,
  Edit,
  ExpandMore,
  VpnKey,
  History,
  Block,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SecurityPage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    biometricAuth: true,
    loginAlerts: true,
    sessionTimeout: true,
    deviceTracking: true,
  });

  const [passwordDialog, setPasswordDialog] = useState(false);
  const [twoFactorDialog, setTwoFactorDialog] = useState(false);
  const [deviceDialog, setDeviceDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  const trustedDevices = [
    {
      id: 1,
      name: 'iPhone 13 Pro',
      type: 'mobile',
      location: 'New York, NY',
      lastActive: '2023-12-15T10:30:00Z',
      current: true,
    },
    {
      id: 2,
      name: 'MacBook Pro',
      type: 'desktop',
      location: 'New York, NY',
      lastActive: '2023-12-14T15:45:00Z',
      current: false,
    },
    {
      id: 3,
      name: 'Chrome on Windows',
      type: 'desktop',
      location: 'Boston, MA',
      lastActive: '2023-12-10T09:20:00Z',
      current: false,
    },
  ];

  const loginHistory = [
    {
      id: 1,
      device: 'iPhone 13 Pro',
      location: 'New York, NY',
      timestamp: '2023-12-15T10:30:00Z',
      status: 'success',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      device: 'MacBook Pro',
      location: 'New York, NY',
      timestamp: '2023-12-14T15:45:00Z',
      status: 'success',
      ip: '192.168.1.101',
    },
    {
      id: 3,
      device: 'Unknown Device',
      location: 'Los Angeles, CA',
      timestamp: '2023-12-12T08:15:00Z',
      status: 'blocked',
      ip: '203.0.113.45',
    },
    {
      id: 4,
      device: 'Chrome on Windows',
      location: 'Boston, MA',
      timestamp: '2023-12-10T09:20:00Z',
      status: 'success',
      ip: '198.51.100.23',
    },
  ];

  const securityRecommendations = [
    {
      id: 1,
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      priority: 'high',
      completed: securitySettings.twoFactorAuth,
      action: 'Enable 2FA',
    },
    {
      id: 2,
      title: 'Update Password',
      description: 'Your password was last changed 6 months ago',
      priority: 'medium',
      completed: false,
      action: 'Change Password',
    },
    {
      id: 3,
      title: 'Review Login Activity',
      description: 'Check for any suspicious login attempts',
      priority: 'low',
      completed: false,
      action: 'Review Activity',
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'mobile':
        return <PhoneAndroid />;
      case 'desktop':
        return <Computer />;
      default:
        return <Computer />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'blocked':
        return 'error';
      case 'failed':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleSettingChange = (key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) return;

    setSaveLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, dispatch password change action
      // dispatch(changePassword(passwordData));
      
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRemoveDevice = (deviceId) => {
    // In a real app, this would remove the device from trusted devices
    console.log('Remove device:', deviceId);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading security settings..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Security
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account security and privacy settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Security Overview */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Overview
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Shield sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" color="success.main">
                      Strong
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Security Level
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">
                      2FA
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enabled
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontSize: 40, mb: 1 }}>
                      {trustedDevices.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trusted Devices
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontSize: 40, mb: 1 }}>
                      30d
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last Password Change
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <VpnKey />
                  </ListItemIcon>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Secure your account with an additional verification step"
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={securitySettings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                        color={securitySettings.twoFactorAuth ? 'success' : 'default'}
                        size="small"
                      />
                      <Button
                        size="small"
                        onClick={() => setTwoFactorDialog(true)}
                      >
                        {securitySettings.twoFactorAuth ? 'Manage' : 'Enable'}
                      </Button>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Fingerprint />
                  </ListItemIcon>
                  <ListItemText
                    primary="Biometric Authentication"
                    secondary="Use fingerprint or face recognition to unlock"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={securitySettings.biometricAuth}
                      onChange={(e) => handleSettingChange('biometricAuth', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Lock />
                  </ListItemIcon>
                  <ListItemText
                    primary="Password"
                    secondary="Last changed 30 days ago"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      onClick={() => setPasswordDialog(true)}
                    >
                      Change
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Warning />
                  </ListItemIcon>
                  <ListItemText
                    primary="Login Alerts"
                    secondary="Get notified of new login attempts"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <History />
                  </ListItemIcon>
                  <ListItemText
                    primary="Session Timeout"
                    secondary="Automatically log out after inactivity"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={securitySettings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Trusted Devices */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Trusted Devices
                </Typography>
                <Button
                  size="small"
                  onClick={() => setDeviceDialog(true)}
                >
                  Manage All
                </Button>
              </Box>
              
              <List>
                {trustedDevices.slice(0, 3).map((device) => (
                  <ListItem key={device.id}>
                    <ListItemIcon>
                      {getDeviceIcon(device.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {device.name}
                          {device.current && (
                            <Chip label="Current" color="primary" size="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {device.location} • Last active {formatDate(device.lastActive)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {!device.current && (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveDevice(device.id)}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Login Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Login Activity
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Device</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loginHistory.slice(0, 5).map((login) => (
                      <TableRow key={login.id}>
                        <TableCell>{login.device}</TableCell>
                        <TableCell>{login.location}</TableCell>
                        <TableCell>{formatDate(login.timestamp)}</TableCell>
                        <TableCell>
                          <Chip
                            label={login.status}
                            color={getStatusColor(login.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              >
                View Full Activity Log
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Security Recommendations */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Recommendations
              </Typography>
              
              {securityRecommendations.map((recommendation) => (
                <Accordion key={recommendation.id} elevation={0}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {recommendation.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={recommendation.priority}
                        color={getPriorityColor(recommendation.priority)}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {recommendation.description}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={recommendation.completed}
                    >
                      {recommendation.completed ? 'Completed' : recommendation.action}
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>

          {/* Security Score */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Score
              </Typography>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h2" fontWeight="bold" color="success.main">
                  85
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  out of 100
                </Typography>
              </Box>
              
              <Alert severity="success" sx={{ mb: 2 }}>
                Your account has strong security protection
              </Alert>
              
              <Typography variant="body2" color="text.secondary">
                Complete the remaining recommendations to improve your security score.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('confirm')}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Password must be at least 8 characters and contain uppercase, lowercase, and numbers.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={saveLoading}
          >
            {saveLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Two-Factor Auth Dialog */}
      <Dialog open={twoFactorDialog} onClose={() => setTwoFactorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Two-factor authentication is currently enabled for your account.
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Authenticator App"
                secondary="Google Authenticator configured"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Backup Codes"
                secondary="10 backup codes generated"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTwoFactorDialog(false)}>
            Close
          </Button>
          <Button variant="outlined" color="error">
            Disable 2FA
          </Button>
          <Button variant="contained">
            Regenerate Codes
          </Button>
        </DialogActions>
      </Dialog>

      {saveLoading && (
        <LoadingSpinner message="Updating security settings..." />
      )}
    </Box>
  );
};

export default SecurityPage;