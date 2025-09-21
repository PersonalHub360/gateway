import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
} from '@mui/icons-material';
import { verifyEmail, resendEmailVerification } from '../../store/slices/authSlice';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Verify email with token from URL
      handleVerifyEmail(token);
    } else if (user?.emailVerified) {
      // User is already verified, redirect to dashboard
      navigate('/dashboard');
    }
  }, [searchParams, user, navigate]);

  const handleVerifyEmail = async (token) => {
    try {
      await dispatch(verifyEmail({ token })).unwrap();
      setVerificationStatus('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      setVerificationStatus('error');
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendMessage('');
    
    try {
      await dispatch(resendEmailVerification()).unwrap();
      setResendMessage('Verification email sent successfully!');
    } catch (error) {
      setResendMessage('Failed to send verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    if (loading && verificationStatus === 'pending') {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Verifying your email...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we verify your email address.
          </Typography>
        </Box>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="success.main">
            Email Verified!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your email has been successfully verified.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to dashboard in 3 seconds...
          </Typography>
        </Box>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="error.main">
            Verification Failed
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            The verification link is invalid or has expired.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            onClick={handleResendEmail}
            disabled={resendLoading}
            startIcon={resendLoading ? <CircularProgress size={20} /> : <Refresh />}
          >
            Send New Verification Email
          </Button>
        </Box>
      );
    }

    // Default state - waiting for verification
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Email sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Verify Your Email
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We've sent a verification email to your address.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please check your email and click the verification link to activate your account.
          If you don't see the email, check your spam folder.
        </Typography>

        {resendMessage && (
          <Alert 
            severity={resendMessage.includes('Failed') ? 'error' : 'success'} 
            sx={{ mb: 2 }}
          >
            {resendMessage}
          </Alert>
        )}

        <Button
          variant="outlined"
          onClick={handleResendEmail}
          disabled={resendLoading}
          startIcon={resendLoading ? <CircularProgress size={20} /> : <Refresh />}
          sx={{ mb: 2 }}
        >
          Resend Verification Email
        </Button>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Already verified?{' '}
            <Button
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none' }}
            >
              Sign In
            </Button>
          </Typography>
        </Box>
      </Box>
    );
  };

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
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {renderContent()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyEmail;