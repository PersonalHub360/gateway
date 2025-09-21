import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';

const ShopPayments = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shop Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pay at partner shops
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <StoreIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Shop Payments Feature
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is under development
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ShopPayments;
