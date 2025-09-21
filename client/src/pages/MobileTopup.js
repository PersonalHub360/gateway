import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

const MobileTopup = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mobile Top-up
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Top up your mobile phone
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <PhoneAndroidIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Mobile Top-up Feature
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is under development
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MobileTopup;
