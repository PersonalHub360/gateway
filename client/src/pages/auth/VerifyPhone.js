import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Phone,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { verifyPhone, sendPhoneVerification } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VerifyPhone = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (user?.isPhoneVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      return;
    }

    try {
      await dispatch(verifyPhone({ code })).unwrap();
      setVerificationSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      // Error is handled by the slice
      setVerificationCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendMessage('');
    
    try {
      await dispatch(sendPhoneVerification({ 
        phoneNumber: user?.phoneNumber 
      })).unwrap();
      setResendMessage('Verification code sent successfully!');
      setCountdown(60); // 60 second countdown
    } catch (error) {
      setResendMessage('Failed to send verification code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Verifying your phone..." />;
  }

  if (verificationSuccess) {
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
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="success.main">
              Phone Verified!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your phone number has been successfully verified.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to dashboard...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
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
            <Phone sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Verify Phone
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter the 6-digit code sent to
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {user?.phoneNumber}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {resendMessage && (
            <Alert 
              severity={resendMessage.includes('Failed') ? 'error' : 'success'} 
              sx={{ mb: 2 }}
            >
              {resendMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Verification Code
              </Typography>
              <Grid container spacing={1} justifyContent="center">
                {verificationCode.map((digit, index) => (
                  <Grid item key={index}>
                    <TextField
                      id={`code-${index}`}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      inputProps={{
                        maxLength: 1,
                        style: { 
                          textAlign: 'center', 
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }
                      }}
                      sx={{
                        width: 50,
                        '& .MuiOutlinedInput-root': {
                          height: 60,
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || verificationCode.join('').length !== 6}
              sx={{ mb: 2 }}
            >
              Verify Phone
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Didn't receive the code?
              </Typography>
              <Button
                variant="text"
                onClick={handleResendCode}
                disabled={resendLoading || countdown > 0}
                startIcon={<Refresh />}
              >
                {countdown > 0 
                  ? `Resend in ${countdown}s` 
                  : 'Resend Code'
                }
              </Button>
            </Box>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="text"
              onClick={() => navigate('/dashboard')}
              sx={{ textTransform: 'none' }}
            >
              Skip for now
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyPhone;