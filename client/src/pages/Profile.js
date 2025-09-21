import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Badge,
  Paper,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Verified,
  Security,
  Notifications,
  Settings,
  CreditCard,
  AccountBalance,
  History,
  Help,
  Logout,
  Save,
  Cancel,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '+1 (555) 123-4567',
    dateOfBirth: user?.dateOfBirth || '1990-01-15',
    address: user?.address || '123 Main St, New York, NY 10001',
    bio: user?.bio || 'Digital wallet enthusiast and tech lover.',
  });
  const [originalData, setOriginalData] = useState({ ...profileData });
  const [avatarDialog, setAvatarDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  const accountStats = {
    memberSince: '2022-03-15',
    totalTransactions: 1247,
    totalSpent: 15420.50,
    rewardsEarned: 342.75,
    verificationLevel: 'Verified',
  };

  const quickActions = [
    { icon: <Security />, label: 'Security Settings', path: '/security' },
    { icon: <Notifications />, label: 'Notifications', path: '/notifications' },
    { icon: <Settings />, label: 'App Settings', path: '/settings' },
    { icon: <CreditCard />, label: 'Payment Methods', path: '/wallet' },
    { icon: <History />, label: 'Transaction History', path: '/transactions' },
    { icon: <Help />, label: 'Help & Support', path: '/support' },
  ];

  const verificationStatus = {
    email: true,
    phone: true,
    identity: true,
    address: false,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!profileData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaveLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, dispatch update action
      // dispatch(updateProfile(profileData));
      
      setOriginalData({ ...profileData });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({ ...originalData });
    setErrors({});
    setEditMode(false);
  };

  const handleAvatarChange = () => {
    // In a real app, this would handle file upload
    setAvatarDialog(false);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and account settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Personal Information
                </Typography>
                {!editMode ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      disabled={saveLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={saveLoading}
                    >
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Avatar Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    editMode && (
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                        onClick={() => setAvatarDialog(true)}
                      >
                        <PhotoCamera fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <Avatar
                    sx={{ width: 100, height: 100, fontSize: '2rem' }}
                    src={user?.avatar}
                  >
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </Avatar>
                </Badge>
                <Box sx={{ ml: 3 }}>
                  <Typography variant="h5" fontWeight="bold">
                    {profileData.firstName} {profileData.lastName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {profileData.email}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={accountStats.verificationLevel}
                      color="success"
                      size="small"
                      icon={<Verified />}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Member since {formatDate(accountStats.memberSince)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Form Fields */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!editMode}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!editMode}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editMode}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      endAdornment: verificationStatus.email && (
                        <Verified color="success" fontSize="small" />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editMode}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    InputProps={{
                      endAdornment: verificationStatus.phone && (
                        <Verified color="success" fontSize="small" />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!editMode}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!editMode}
                    InputProps={{
                      endAdornment: !verificationStatus.address && editMode && (
                        <Typography variant="caption" color="warning.main">
                          Not verified
                        </Typography>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!editMode}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  Changes to your email or phone number may require verification.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Verification
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>Email</Typography>
                    </Box>
                    <Chip
                      label={verificationStatus.email ? 'Verified' : 'Pending'}
                      color={verificationStatus.email ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>Phone</Typography>
                    </Box>
                    <Chip
                      label={verificationStatus.phone ? 'Verified' : 'Pending'}
                      color={verificationStatus.phone ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>Identity</Typography>
                    </Box>
                    <Chip
                      label={verificationStatus.identity ? 'Verified' : 'Pending'}
                      color={verificationStatus.identity ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>Address</Typography>
                    </Box>
                    <Chip
                      label={verificationStatus.address ? 'Verified' : 'Pending'}
                      color={verificationStatus.address ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Account Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Statistics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Transactions
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {accountStats.totalTransactions.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Spent
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(accountStats.totalSpent)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Rewards Earned
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(accountStats.rewardsEarned)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List dense>
                {quickActions.map((action, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => {
                      // In a real app, navigate to the path
                      console.log('Navigate to:', action.path);
                    }}
                  >
                    <ListItemIcon>
                      {action.icon}
                    </ListItemIcon>
                    <ListItemText primary={action.label} />
                  </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />
                <ListItem button sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <Logout sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Sign Out" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarDialog} onClose={() => setAvatarDialog(false)}>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Avatar
              sx={{ width: 120, height: 120, fontSize: '2.5rem', mx: 'auto', mb: 3 }}
              src={user?.avatar}
            >
              {profileData.firstName[0]}{profileData.lastName[0]}
            </Avatar>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Recommended: Square image, at least 200x200 pixels
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAvatarChange}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {saveLoading && (
        <LoadingSpinner message="Saving changes..." />
      )}
    </Box>
  );
};

export default Profile;