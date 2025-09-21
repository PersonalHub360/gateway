import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Typography, 
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import { Email, CheckCircle } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';

const VerifyEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // TODO: Implement resend verification API call
      console.log('Resending email verification...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400, boxShadow: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Email sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            
            <Typography variant="h4" component="h1" gutterBottom>
              Verify Your Email
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              We've sent a verification link to{' '}
              <strong>{user?.email}</strong>
            </Typography>

            <Typography variant="body2" sx={{ mb: 3 }}>
              Please check your email and click the verification link to activate your account.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleResendVerification}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Email />}
              >
                {isLoading ? 'Sending...' : 'Resend Verification Email'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleSkip}
              >
                Skip for Now
              </Button>
            </Box>

            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Didn't receive the email? Check your spam folder.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default VerifyEmail;
