import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import CashInForm from '../components/Payment/CashInForm';
import { Payment as PaymentIcon } from '@mui/icons-material';

const CashInPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <PaymentIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Cash In
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Add money to your wallet using various payment methods
        </Typography>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Available Payment Methods
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Choose from multiple payment options including mobile wallets (bKash, Nagad, Rocket, Upay) 
          and bank transfers (Islami Bank, City Bank, BRAC Bank). Select between automated merchant 
          payments or manual agent/personal payments based on your preference.
        </Typography>
      </Box>

      <CashInForm />

      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Payment Information
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          • <strong>Merchant Payment:</strong> Automated processing with instant confirmation
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          • <strong>Agent Payment:</strong> Manual verification by our agents (2-5 minutes)
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          • <strong>Personal Payment:</strong> Manual processing with personal account verification
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          • <strong>Bank Payment:</strong> Bank transfer processing (10-30 minutes)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2, fontWeight: 'bold' }}>
          All transactions are secured with end-to-end encryption and monitored 24/7.
        </Typography>
      </Paper>
    </Container>
  );
};

export default CashInPage;