import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';

const BillPayments = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bill Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pay your bills online
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <PaymentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Bill Payments Feature
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is under development
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BillPayments;
