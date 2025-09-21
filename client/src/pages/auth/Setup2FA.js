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
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  Paper,
} from '@mui/material';
import {
  Security,
  QrCode,
  Smartphone,
  CheckCircle,
  ContentCopy,
} from '@mui/icons-material';
import { setup2FA, verify2FA, disable2FA } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Setup2FA = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const steps = [
    'Install Authenticator App',
    'Scan QR Code',
    'Verify Setup'
  ];

  useEffect(() => {
    if (user?.twoFactorEnabled) {
      setSetupComplete(true);
    }
  }, [user]);

  const handleStart2FASetup = async () => {
    try {
      const result = await dispatch(setup2FA()).unwrap();
      setQrCode(result.qrCode);
      setSecretKey(result.secretKey);
      setActiveStep(1);
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      return;
    }

    try {
      await dispatch(verify2FA({ code: verificationCode })).unwrap();
      setSetupComplete(true);
      setActiveStep(2);
    } catch (error) {
      setVerificationCode('');
    }
  };

  const handleDisable2FA = async () => {
    try {
      await dispatch(disable2FA()).unwrap();
      setSetupComplete(false);
      setActiveStep(0);
      setQrCode('');
      setSecretKey('');
      setVerificationCode('');
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Setting up 2FA..." />;
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
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Security sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Two-Factor Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add an extra layer of security to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {copySuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Secret key copied to clipboard!
            </Alert>
          )}

          {setupComplete ? (
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="success.main">
                2FA is Active
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Your account is now protected with two-factor authentication.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={handleDisable2FA}
                    disabled={loading}
                  >
                    Disable 2FA
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Step 1: Install Authenticator App
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Download and install an authenticator app on your mobile device:
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Smartphone sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2">Google Authenticator</Typography>
                        <Typography variant="caption" color="text.secondary">
                          iOS & Android
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Smartphone sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2">Microsoft Authenticator</Typography>
                        <Typography variant="caption" color="text.secondary">
                          iOS & Android
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleStart2FASetup}
                    disabled={loading}
                  >
                    I've Installed an App
                  </Button>
                </Box>
              )}

              {activeStep === 1 && qrCode && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Step 2: Scan QR Code
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Open your authenticator app and scan this QR code:
                  </Typography>

                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Paper sx={{ p: 2, display: 'inline-block' }}>
                      <img 
                        src={qrCode} 
                        alt="2FA QR Code" 
                        style={{ maxWidth: '200px', width: '100%' }}
                      />
                    </Paper>
                  </Box>

                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Enter this secret key manually:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TextField
                      fullWidth
                      value={secretKey}
                      InputProps={{
                        readOnly: true,
                        style: { fontFamily: 'monospace' }
                      }}
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => copyToClipboard(secretKey)}
                      sx={{ ml: 1, minWidth: 'auto' }}
                    >
                      <ContentCopy />
                    </Button>
                  </Box>

                  <form onSubmit={handleVerify2FA}>
                    <TextField
                      fullWidth
                      label="Enter 6-digit code from your app"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      inputProps={{
                        maxLength: 6,
                        style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5rem' }
                      }}
                      sx={{ mb: 2 }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading || verificationCode.length !== 6}
                    >
                      Verify & Enable 2FA
                    </Button>
                  </form>
                </Box>
              )}
            </>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="text"
              onClick={() => navigate('/security')}
              sx={{ textTransform: 'none' }}
            >
              Back to Security Settings
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Setup2FA;