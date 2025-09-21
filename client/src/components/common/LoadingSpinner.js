import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingSpinner = ({ size = 40, color = 'primary' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <CircularProgress 
        size={size} 
        sx={{ color: color === 'primary' ? '#667eea' : color }} 
      />
    </Box>
  );
};

export default LoadingSpinner;
