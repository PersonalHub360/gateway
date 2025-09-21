import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

const Support = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Support
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get help and support
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <HelpIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Support Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is under development
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Support;
