import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import RequestPageIcon from '@mui/icons-material/RequestPage';

const RequestMoney = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Request Money
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Request money from other users
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <RequestPageIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Request Money Feature
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is under development
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RequestMoney;
