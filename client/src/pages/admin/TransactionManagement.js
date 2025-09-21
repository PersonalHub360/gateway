import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';

const TransactionManagement = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transaction Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage system transactions
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <ReceiptIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Transaction Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is under development
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionManagement;
