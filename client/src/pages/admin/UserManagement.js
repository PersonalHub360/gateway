import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  InputAdornment,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Add,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Warning,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  AccountBalance,
  Security,
  Visibility,
  VisibilityOff,
  Download,
  Upload,
  Refresh,
} from '@mui/icons-material';

const UserManagement = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock user data - replace with actual API calls
  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      status: 'active',
      role: 'user',
      balance: 1250.50,
      joinDate: '2024-01-15',
      lastLogin: '2024-01-20 14:30',
      verified: true,
      kycStatus: 'approved',
      avatar: null,
      address: '123 Main St, City, Country',
      transactionCount: 45,
      totalVolume: 15420.75,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      status: 'suspended',
      role: 'user',
      balance: 750.25,
      joinDate: '2024-01-10',
      lastLogin: '2024-01-18 09:15',
      verified: true,
      kycStatus: 'pending',
      avatar: null,
      address: '456 Oak Ave, City, Country',
      transactionCount: 23,
      totalVolume: 8750.30,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1234567892',
      status: 'active',
      role: 'merchant',
      balance: 3420.80,
      joinDate: '2024-01-05',
      lastLogin: '2024-01-20 16:45',
      verified: false,
      kycStatus: 'rejected',
      avatar: null,
      address: '789 Pine St, City, Country',
      transactionCount: 78,
      totalVolume: 32150.90,
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleDialogOpen = (type, user = null) => {
    setDialogType(type);
    setSelectedUser(user);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setDialogType('');
  };

  const handleUserAction = async (action, userId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (action) {
        case 'activate':
          setUsers(users.map(user => 
            user.id === userId ? { ...user, status: 'active' } : user
          ));
          showSnackbar('User activated successfully', 'success');
          break;
        case 'suspend':
          setUsers(users.map(user => 
            user.id === userId ? { ...user, status: 'suspended' } : user
          ));
          showSnackbar('User suspended successfully', 'warning');
          break;
        case 'delete':
          setUsers(users.filter(user => user.id !== userId));
          showSnackbar('User deleted successfully', 'success');
          break;
        default:
          break;
      }
      handleDialogClose();
    } catch (error) {
      console.error('Error performing user action:', error);
      showSnackbar('Error performing action', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getKycStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const UserDetailsDialog = () => (
    <Dialog open={dialogOpen && dialogType === 'view'} onClose={handleDialogClose} maxWidth="md" fullWidth>
      <DialogTitle>
        User Details
      </DialogTitle>
      <DialogContent>
        {selectedUser && (
          <Box sx={{ mt: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Profile" />
              <Tab label="Account" />
              <Tab label="Activity" />
            </Tabs>
            
            {tabValue === 0 && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                        src={selectedUser.avatar}
                      >
                        {selectedUser.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6">{selectedUser.name}</Typography>
                      <Chip
                        label={selectedUser.role}
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Email sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography>{selectedUser.email}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography>{selectedUser.phone}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography>{selectedUser.address}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography>Joined: {selectedUser.joinDate}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Security sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography>Last Login: {selectedUser.lastLogin}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Account Status
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={selectedUser.status}
                            color={getStatusColor(selectedUser.status)}
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Verified: {selectedUser.verified ? 'Yes' : 'No'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            KYC Status:
                          </Typography>
                          <Chip
                            label={selectedUser.kycStatus}
                            color={getKycStatusColor(selectedUser.kycStatus)}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Financial Summary
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" color="primary">
                            ${selectedUser.balance.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Current Balance
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            Total Transactions: {selectedUser.transactionCount}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2">
                            Total Volume: ${selectedUser.totalVolume.toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Activity logs and transaction history would be displayed here.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const ConfirmDialog = () => (
    <Dialog open={dialogOpen && ['suspend', 'activate', 'delete'].includes(dialogType)} onClose={handleDialogClose}>
      <DialogTitle>
        Confirm Action
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to {dialogType} user "{selectedUser?.name}"?
        </Typography>
        {dialogType === 'delete' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. All user data will be permanently deleted.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button
          onClick={() => handleUserAction(dialogType, selectedUser?.id)}
          color={dialogType === 'delete' ? 'error' : 'primary'}
          variant="contained"
        >
          {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Upload />}>
            Import
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            Add User
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6">{users.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {users.filter(u => u.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {users.filter(u => u.status === 'suspended').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Suspended
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Security />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {users.filter(u => u.verified).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
            >
              More Filters
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchUsers}
              fullWidth
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell>KYC</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            user.verified ? (
                              <CheckCircle color="success" sx={{ fontSize: 16 }} />
                            ) : null
                          }
                        >
                          <Avatar sx={{ mr: 2 }} src={user.avatar}>
                            {user.name.charAt(0)}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="subtitle2">{user.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        ${user.balance.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.kycStatus}
                        color={getKycStatusColor(user.kycStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="More actions">
                        <IconButton onClick={(e) => handleMenuClick(e, user)}>
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDialogOpen('view', selectedUser)}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('edit', selectedUser)}>
          <Edit sx={{ mr: 1 }} /> Edit User
        </MenuItem>
        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={() => handleDialogOpen('suspend', selectedUser)}>
            <Block sx={{ mr: 1 }} /> Suspend User
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleDialogOpen('activate', selectedUser)}>
            <CheckCircle sx={{ mr: 1 }} /> Activate User
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDialogOpen('delete', selectedUser)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete User
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <UserDetailsDialog />
      <ConfirmDialog />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement;