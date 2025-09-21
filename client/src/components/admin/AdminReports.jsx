import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';

const AdminReports = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    reportType: 'summary',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    paymentMethod: 'all',
    paymentType: 'all'
  });

  const reportTypes = [
    { value: 'summary', label: 'Summary Report' },
    { value: 'detailed', label: 'Detailed Report' },
    { value: 'cashin', label: 'Cash In Report' },
    { value: 'cashout', label: 'Cash Out Report' },
    { value: 'withdrawals', label: 'Withdrawals Report' },
    { value: 'commissions', label: 'Commissions Report' }
  ];

  const paymentMethods = [
    { value: 'all', label: 'All Methods' },
    { value: 'bkash', label: 'bKash' },
    { value: 'nagad', label: 'Nagad' },
    { value: 'rocket', label: 'Rocket' },
    { value: 'upay', label: 'Upay' },
    { value: 'islami_bank', label: 'Islami Bank' },
    { value: 'city_bank', label: 'City Bank' },
    { value: 'brac_bank', label: 'BRAC Bank' }
  ];

  const paymentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'merchant', label: 'Merchant' },
    { value: 'agent', label: 'Agent' },
    { value: 'personal', label: 'Personal' },
    { value: 'bank', label: 'Bank' }
  ];

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams({
        reportType: filters.reportType,
        startDate: format(filters.startDate, 'yyyy-MM-dd'),
        endDate: format(filters.endDate, 'yyyy-MM-dd'),
        paymentMethod: filters.paymentMethod,
        paymentType: filters.paymentType
      });

      const response = await fetch(`/api/reports/generate?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format = 'csv') => {
    try {
      const queryParams = new URLSearchParams({
        reportType: filters.reportType,
        startDate: format(filters.startDate, 'yyyy-MM-dd'),
        endDate: format(filters.endDate, 'yyyy-MM-dd'),
        paymentMethod: filters.paymentMethod,
        paymentType: filters.paymentType,
        format
      });

      const response = await fetch(`/api/reports/download?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${filters.reportType}_report_${format(filters.startDate, 'yyyy-MM-dd')}_to_${format(filters.endDate, 'yyyy-MM-dd')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <ReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Admin Reports
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Filters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={filters.reportType}
                    onChange={(e) => handleFilterChange('reportType', e.target.value)}
                    label="Report Type"
                  >
                    {reportTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={filters.paymentMethod}
                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                    label="Payment Method"
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        {method.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Payment Type</InputLabel>
                  <Select
                    value={filters.paymentType}
                    onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                    label="Payment Type"
                  >
                    {paymentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={1}>
                <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                  <Tooltip title="Generate Report">
                    <IconButton
                      onClick={generateReport}
                      disabled={loading}
                      color="primary"
                      size="large"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download CSV">
                    <IconButton
                      onClick={() => downloadReport('csv')}
                      disabled={loading || !reportData}
                      color="success"
                      size="large"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={generateReport}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <ReportIcon />}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => downloadReport('csv')}
                disabled={loading || !reportData}
                startIcon={<DownloadIcon />}
              >
                Download CSV
              </Button>
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Report Results */}
        {reportData && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Results
              </Typography>

              {/* Summary Statistics */}
              {reportData.summary && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(reportData.summary.totalCashIn || 0)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Cash In
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="secondary">
                        {formatCurrency(reportData.summary.totalCashOut || 0)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Cash Out
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="warning.main">
                        {formatCurrency(reportData.summary.totalWithdrawals || 0)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Withdrawals
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(reportData.summary.totalCommissions || 0)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Commissions
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Transactions Table */}
              {reportData.transactions && reportData.transactions.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Commission</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.transactions.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell>
                            {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.paymentType}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{transaction.paymentMethod}</TableCell>
                          <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.status}
                              size="small"
                              color={getStatusColor(transaction.status)}
                            />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(transaction.commission || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {reportData.transactions && reportData.transactions.length === 0 && (
                <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                  No transactions found for the selected criteria.
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AdminReports;