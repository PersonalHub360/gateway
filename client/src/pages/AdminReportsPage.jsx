import React from 'react';
import { Box, Container, Typography, Paper, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import AdminReports from '../components/Admin/AdminReports';
import { Assessment as ReportIcon } from '@mui/icons-material';

const AdminReportsPage = () => {
  const { user } = useSelector((state) => state.auth);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Admin privileges required to view reports.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: 'secondary.main', color: 'white' }}>
        <ReportIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Reports
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Comprehensive reporting and analytics dashboard
        </Typography>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Report Features
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Generate detailed reports with customizable date ranges, filter by payment methods and types, 
          and download comprehensive data in CSV format. Monitor cash flow, commissions, and system performance 
          with real-time analytics.
        </Typography>
      </Box>

      <AdminReports />

      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Report Types Available
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          • <strong>Summary Report:</strong> Overview of all transactions and financial metrics
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          • <strong>Detailed Report:</strong> Complete transaction history with full details
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          • <strong>Cash In Report:</strong> All cash-in transactions across payment methods
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          • <strong>Cash Out Report:</strong> All cash-out and withdrawal transactions
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          • <strong>Withdrawals Report:</strong> Detailed withdrawal history and patterns
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          • <strong>Commissions Report:</strong> Commission earnings and fee analysis
        </Typography>
      </Paper>
    </Container>
  );
};

export default AdminReportsPage;