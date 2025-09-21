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
  Chip,
  Divider,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Email,
  Sms,
  PhoneAndroid,
  Security,
  AccountBalance,
  ShoppingCart,
  Person,
  Settings,
  VolumeUp,
  Vibration,
  Schedule,
  FilterList,
  MarkEmailRead,
  Delete,
  MoreVert,
  ExpandMore,
  Info,
  Warning,
  CheckCircle,
  Error,
  Payment,
  TrendingUp,
  Group,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    // Push Notifications
    pushEnabled: true,
    transactionAlerts: true,
    securityAlerts: true,
    promotionalOffers: false,
    accountUpdates: true,
    paymentReminders: true,
    
    // Email Notifications
    emailEnabled: true,
    weeklyStatements: true,
    monthlyReports: true,
    securityEmails: true,
    marketingEmails: false,
    
    // SMS Notifications
    smsEnabled: true,
    transactionSms: true,
    securitySms: true,
    otpSms: true,
    
    // Sound & Vibration
    soundEnabled: true,
    vibrationEnabled: true,
    soundVolume: 70,
    
    // Timing
    quietHoursEnabled: true,
    quietStart: '22:00',
    quietEnd: '07:00',
  });

  const notifications = [
    {
      id: 1,
      type: 'transaction',
      title: 'Payment Received',
      message: 'You received $250.00 from John Doe',
      timestamp: '2023-12-15T10:30:00Z',
      read: false,
      priority: 'high',
      icon: 'payment',
    },
    {
      id: 2,
      type: 'security',
      title: 'New Device Login',
      message: 'Login detected from Chrome on Windows in Boston, MA',
      timestamp: '2023-12-15T09:15:00Z',
      read: false,
      priority: 'high',
      icon: 'security',
    },
    {
      id: 3,
      type: 'account',
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated',
      timestamp: '2023-12-14T16:45:00Z',
      read: true,
      priority: 'medium',
      icon: 'person',
    },
    {
      id: 4,
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 5% cashback on all transactions this weekend!',
      timestamp: '2023-12-14T12:00:00Z',
      read: true,
      priority: 'low',
      icon: 'trending',
    },
    {
      id: 5,
      type: 'transaction',
      title: 'Bill Payment Due',
      message: 'Your electricity bill payment is due in 2 days',
      timestamp: '2023-12-13T08:30:00Z',
      read: true,
      priority: 'medium',
      icon: 'payment',
    },
    {
      id: 6,
      type: 'system',
      title: 'Maintenance Notice',
      message: 'Scheduled maintenance on Dec 16, 2023 from 2:00 AM to 4:00 AM',
      timestamp: '2023-12-12T14:20:00Z',
      read: true,
      priority: 'low',
      icon: 'info',
    },
  ];

  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    today: notifications.filter(n => {
      const today = new Date().toDateString();
      return new Date(n.timestamp).toDateString() === today;
    }).length,
    thisWeek: notifications.filter(n => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(n.timestamp) >= weekAgo;
    }).length,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getNotificationIcon = (iconType) => {
    switch (iconType) {
      case 'payment':
        return <Payment />;
      case 'security':
        return <Security />;
      case 'person':
        return <Person />;
      case 'trending':
        return <TrendingUp />;
      case 'info':
        return <Info />;
      default:
        return <Notifications />;
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'transaction':
        return 'primary';
      case 'security':
        return 'error';
      case 'account':
        return 'info';
      case 'promotion':
        return 'success';
      case 'system':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleSettingChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, dispatch save settings action
      // dispatch(updateNotificationSettings(notificationSettings));
      
      console.log('Settings saved:', notificationSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId) => {
    // In a real app, dispatch mark as read action
    console.log('Mark as read:', notificationId);
  };

  const handleDeleteNotification = (notificationId) => {
    // In a real app, dispatch delete notification action
    console.log('Delete notification:', notificationId);
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = () => {
    // In a real app, dispatch mark all as read action
    console.log('Mark all as read');
  };

  const handleMenuClick = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading notifications..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your notification preferences and view your notification history
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab
            label={
              <Badge badgeContent={notificationStats.unread} color="error">
                Notifications
              </Badge>
            }
          />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Notification Stats */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Overview
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {notificationStats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {notificationStats.unread}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unread
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {notificationStats.today}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Today
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {notificationStats.thisWeek}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This Week
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Notifications
                  </Typography>
                  <Box>
                    <Button
                      size="small"
                      startIcon={<MarkEmailRead />}
                      onClick={handleMarkAllAsRead}
                      disabled={notificationStats.unread === 0}
                    >
                      Mark All Read
                    </Button>
                  </Box>
                </Box>
                
                <List>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        sx={{
                          bgcolor: notification.read ? 'transparent' : 'action.hover',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              bgcolor: `${getTypeColor(notification.type)}.main`,
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getNotificationIcon(notification.icon)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body1"
                                fontWeight={notification.read ? 'normal' : 'bold'}
                              >
                                {notification.title}
                              </Typography>
                              <Chip
                                label={notification.priority}
                                color={getPriorityColor(notification.priority)}
                                size="small"
                              />
                              {!notification.read && (
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(notification.timestamp)}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, notification)}
                          >
                            <MoreVert />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < notifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Load More Notifications
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<MarkEmailRead />}
                    onClick={handleMarkAllAsRead}
                    disabled={notificationStats.unread === 0}
                  >
                    Mark All as Read
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                  >
                    Filter Notifications
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={() => setActiveTab(1)}
                  >
                    Notification Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Types
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Payment color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Transactions"
                      secondary="Payment alerts and receipts"
                    />
                    <Chip label="3" color="primary" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Security color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Security"
                      secondary="Login alerts and security updates"
                    />
                    <Chip label="1" color="error" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Person color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account"
                      secondary="Profile and account updates"
                    />
                    <Chip label="1" color="info" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Promotions"
                      secondary="Offers and cashback deals"
                    />
                    <Chip label="1" color="success" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Push Notifications */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Push Notifications
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.pushEnabled}
                      onChange={(e) => handleSettingChange('pushEnabled', e.target.checked)}
                    />
                  }
                  label="Enable push notifications"
                  sx={{ mb: 2 }}
                />
                
                {notificationSettings.pushEnabled && (
                  <List>
                    <ListItem>
                      <ListItemText primary="Transaction Alerts" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.transactionAlerts}
                          onChange={(e) => handleSettingChange('transactionAlerts', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Security Alerts" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.securityAlerts}
                          onChange={(e) => handleSettingChange('securityAlerts', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Account Updates" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.accountUpdates}
                          onChange={(e) => handleSettingChange('accountUpdates', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Payment Reminders" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.paymentReminders}
                          onChange={(e) => handleSettingChange('paymentReminders', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Promotional Offers" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.promotionalOffers}
                          onChange={(e) => handleSettingChange('promotionalOffers', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Email Notifications */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Email Notifications
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailEnabled}
                      onChange={(e) => handleSettingChange('emailEnabled', e.target.checked)}
                    />
                  }
                  label="Enable email notifications"
                  sx={{ mb: 2 }}
                />
                
                {notificationSettings.emailEnabled && (
                  <List>
                    <ListItem>
                      <ListItemText primary="Weekly Statements" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.weeklyStatements}
                          onChange={(e) => handleSettingChange('weeklyStatements', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Monthly Reports" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.monthlyReports}
                          onChange={(e) => handleSettingChange('monthlyReports', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Security Emails" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.securityEmails}
                          onChange={(e) => handleSettingChange('securityEmails', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Marketing Emails" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.marketingEmails}
                          onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                )}
              </CardContent>
            </Card>

            {/* SMS Notifications */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  SMS Notifications
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.smsEnabled}
                      onChange={(e) => handleSettingChange('smsEnabled', e.target.checked)}
                    />
                  }
                  label="Enable SMS notifications"
                  sx={{ mb: 2 }}
                />
                
                {notificationSettings.smsEnabled && (
                  <List>
                    <ListItem>
                      <ListItemText primary="Transaction SMS" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.transactionSms}
                          onChange={(e) => handleSettingChange('transactionSms', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Security SMS" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.securitySms}
                          onChange={(e) => handleSettingChange('securitySms', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="OTP SMS" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.otpSms}
                          onChange={(e) => handleSettingChange('otpSms', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Sound & Vibration */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sound & Vibration
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText primary="Sound" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.soundEnabled}
                        onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {notificationSettings.soundEnabled && (
                    <ListItem>
                      <ListItemText primary="Volume" />
                      <Box sx={{ width: 200, ml: 2 }}>
                        <Slider
                          value={notificationSettings.soundVolume}
                          onChange={(e, value) => handleSettingChange('soundVolume', value)}
                          valueLabelDisplay="auto"
                          min={0}
                          max={100}
                        />
                      </Box>
                    </ListItem>
                  )}
                  
                  <ListItem>
                    <ListItemText primary="Vibration" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.vibrationEnabled}
                        onChange={(e) => handleSettingChange('vibrationEnabled', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Settings Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Quiet Hours */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quiet Hours
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.quietHoursEnabled}
                      onChange={(e) => handleSettingChange('quietHoursEnabled', e.target.checked)}
                    />
                  }
                  label="Enable quiet hours"
                  sx={{ mb: 2 }}
                />
                
                {notificationSettings.quietHoursEnabled && (
                  <Box>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      value={notificationSettings.quietStart}
                      onChange={(e) => handleSettingChange('quietStart', e.target.value)}
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      label="End Time"
                      type="time"
                      value={notificationSettings.quietEnd}
                      onChange={(e) => handleSettingChange('quietEnd', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Save Settings */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Save Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Don't forget to save your notification preferences.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={saveLoading}
                  sx={{ mt: 2 }}
                >
                  {saveLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Notification Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={() => handleMarkAsRead(selectedNotification.id)}>
            <ListItemIcon>
              <MarkEmailRead fontSize="small" />
            </ListItemIcon>
            Mark as Read
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteNotification(selectedNotification?.id)}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {saveLoading && (
        <LoadingSpinner message="Saving notification settings..." />
      )}
    </Box>
  );
};

export default NotificationsPage;