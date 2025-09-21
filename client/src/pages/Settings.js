import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const Settings = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your account settings
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <SettingsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Account Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is under development
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
