import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Container,
  Alert,
  InputAdornment
} from '@mui/material';
import { Phone, Message } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

const VerifyPhone = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      // TODO: Implement phone verification API call
      console.log('Verifying phone with code:', data.code);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsVerified(true);
      
      // Redirect to setup 2FA after 2 seconds
      setTimeout(() => {
        navigate('/setup-2fa');
      }, 2000);
    } catch (error) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // TODO: Implement resend SMS API call
      console.log('Resending SMS verification code...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Verification code sent! Please check your phone.');
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
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
              <Typography variant="h4" component="h1" gutterBottom color="success.main">
                Phone Verified!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Your phone number has been successfully verified.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting to 2FA setup...
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

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
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Phone sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Verify Your Phone
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We've sent a verification code to{' '}
                <strong>{user?.phone}</strong>
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Verification Code"
                margin="normal"
                {...register('code', {
                  required: 'Verification code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Please enter a 6-digit verification code',
                  },
                })}
                error={!!errors.code}
                helperText={errors.code?.message}
                placeholder="123456"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Message />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Phone'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleResendCode}
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                Resend Code
              </Button>

              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                Didn't receive the code? Check your SMS messages.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default VerifyPhone;
