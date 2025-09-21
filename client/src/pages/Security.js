import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

const Security = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Security
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account security
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <SecurityIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Security Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is under development
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Security;
