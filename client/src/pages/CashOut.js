import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const CashOut = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cash Out
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Withdraw money from your wallet
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <TrendingDownIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Cash Out Feature
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is under development
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CashOut;
