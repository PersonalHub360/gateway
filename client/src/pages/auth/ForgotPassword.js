import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Email,
  LockReset,
  ArrowBack,
} from '@mui/icons-material';
import { forgotPassword } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Email is invalid';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setEmailSent(true);
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Sending reset email..." />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockReset sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {emailSent 
                ? 'Check your email for reset instructions'
                : 'Enter your email to receive reset instructions'
              }
            </Typography>
          </Box>

          {emailSent ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset email sent to {email}
              </Alert>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please check your email and follow the instructions to reset your password.
                If you don't see the email, check your spam folder.
              </Typography>

              <Button
                variant="outlined"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                sx={{ mb: 2 }}
              >
                Send Another Email
              </Button>

              <Box>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button
                    startIcon={<ArrowBack />}
                    variant="text"
                  >
                    Back to Login
                  </Button>
                </Link>
              </Box>
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!validationError}
                  helperText={validationError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  Send Reset Email
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Button
                      startIcon={<ArrowBack />}
                      variant="text"
                    >
                      Back to Login
                    </Button>
                  </Link>
                </Box>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;