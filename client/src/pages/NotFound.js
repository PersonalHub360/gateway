import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Home,
  ArrowBack,
  Search,
  Dashboard,
  AccountBalance,
  Send,
  Receipt,
  Settings,
  Support,
  ErrorOutline,
} from '@mui/icons-material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: 'Dashboard',
      description: 'View your account overview',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      title: 'Wallet',
      description: 'Manage your wallet and balance',
      icon: <AccountBalance />,
      path: '/wallet',
    },
    {
      title: 'Send Money',
      description: 'Transfer money to others',
      icon: <Send />,
      path: '/send-money',
    },
    {
      title: 'Transactions',
      description: 'View transaction history',
      icon: <Receipt />,
      path: '/transactions',
    },
    {
      title: 'Settings',
      description: 'Manage your account settings',
      icon: <Settings />,
      path: '/settings',
    },
    {
      title: 'Support',
      description: 'Get help and support',
      icon: <Support />,
      path: '/support',
    },
  ];

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleQuickLink = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        {/* 404 Illustration */}
        <Box sx={{ mb: 4 }}>
          <ErrorOutline
            sx={{
              fontSize: 120,
              color: 'primary.main',
              mb: 2,
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', md: '6rem' },
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2,
            }}
          >
            404
          </Typography>
        </Box>

        {/* Error Message */}
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Oops! The page you're looking for doesn't exist.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          The page you are trying to access may have been moved, deleted, or you may have entered an incorrect URL.
          Don't worry, you can easily navigate back to safety using the options below.
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={handleGoHome}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
          >
            Go Back
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Quick Links */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Here are some popular pages you might be looking for:
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {quickLinks.map((link, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleQuickLink(link.path)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: 'primary.main',
                            color: 'white',
                            mr: 2,
                          }}
                        >
                          {link.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {link.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {link.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Help Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Need Help?
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              If you're having trouble finding what you're looking for, we're here to help.
            </Typography>
            
            <List dense>
              <ListItem button onClick={() => navigate('/support')}>
                <ListItemIcon>
                  <Support color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Contact Support"
                  secondary="Get help from our team"
                />
              </ListItem>
              <ListItem button onClick={() => navigate('/support')}>
                <ListItemIcon>
                  <Search color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Search Help Center"
                  secondary="Find answers to common questions"
                />
              </ListItem>
            </List>
          </Paper>

          {/* Recent Pages */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Suggestions
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Try these popular features:
            </Typography>
            
            <List dense>
              <ListItem button onClick={() => navigate('/send-money')}>
                <ListItemText
                  primary="Send Money"
                  secondary="Transfer funds quickly"
                />
              </ListItem>
              <Divider />
              <ListItem button onClick={() => navigate('/cash-in')}>
                <ListItemText
                  primary="Add Money"
                  secondary="Top up your wallet"
                />
              </ListItem>
              <Divider />
              <ListItem button onClick={() => navigate('/bill-payments')}>
                <ListItemText
                  primary="Pay Bills"
                  secondary="Pay your bills online"
                />
              </ListItem>
              <Divider />
              <ListItem button onClick={() => navigate('/transactions')}>
                <ListItemText
                  primary="View Transactions"
                  secondary="Check your transaction history"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer Message */}
      <Box sx={{ textAlign: 'center', mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          If you believe this is an error or you were expecting to find content at this URL,
          please contact our support team for assistance.
        </Typography>
        <Button
          variant="text"
          color="primary"
          onClick={() => navigate('/support')}
          sx={{ mt: 1 }}
        >
          Report this issue
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;