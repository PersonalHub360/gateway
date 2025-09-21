import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Rating,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Support,
  Help,
  ContactSupport,
  Phone,
  Email,
  Chat,
  VideoCall,
  ExpandMore,
  Search,
  Send,
  Attachment,
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  Close,
  Add,
  History,
  Schedule,
  CheckCircle,
  Error,
  Warning,
  Info,
  QuestionAnswer,
  Book,
  LiveHelp,
  Feedback,
  BugReport,
  Lightbulb,
} from '@mui/icons-material';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SupportPage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactDialog, setContactDialog] = useState(false);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [contactForm, setContactForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
    attachments: [],
  });

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    category: '',
    message: '',
  });

  const faqCategories = [
    {
      id: 1,
      title: 'Account & Security',
      icon: <Support />,
      count: 12,
      questions: [
        {
          id: 1,
          question: 'How do I reset my password?',
          answer: 'You can reset your password by clicking on "Forgot Password" on the login page and following the instructions sent to your email.',
          helpful: 45,
          notHelpful: 3,
        },
        {
          id: 2,
          question: 'How do I enable two-factor authentication?',
          answer: 'Go to Settings > Security > Two-Factor Authentication and follow the setup instructions using your preferred authenticator app.',
          helpful: 38,
          notHelpful: 2,
        },
        {
          id: 3,
          question: 'Why is my account locked?',
          answer: 'Accounts are locked after multiple failed login attempts for security. Wait 30 minutes or contact support to unlock immediately.',
          helpful: 29,
          notHelpful: 5,
        },
      ],
    },
    {
      id: 2,
      title: 'Payments & Transactions',
      icon: <QuestionAnswer />,
      count: 18,
      questions: [
        {
          id: 4,
          question: 'How long do transfers take?',
          answer: 'Instant transfers are processed immediately. Bank transfers typically take 1-3 business days depending on your bank.',
          helpful: 67,
          notHelpful: 4,
        },
        {
          id: 5,
          question: 'What are the transaction limits?',
          answer: 'Daily limits vary by account type: Basic ($1,000), Premium ($5,000), Business ($25,000). Monthly limits are 10x daily limits.',
          helpful: 52,
          notHelpful: 8,
        },
        {
          id: 6,
          question: 'How do I dispute a transaction?',
          answer: 'Go to Transactions, find the disputed transaction, and click "Dispute". Provide details and evidence for review.',
          helpful: 41,
          notHelpful: 6,
        },
      ],
    },
    {
      id: 3,
      title: 'Mobile App',
      icon: <Book />,
      count: 8,
      questions: [
        {
          id: 7,
          question: 'How do I update the app?',
          answer: 'Visit your device\'s app store (App Store or Google Play), search for our app, and tap "Update" if available.',
          helpful: 34,
          notHelpful: 2,
        },
        {
          id: 8,
          question: 'Why can\'t I log in on mobile?',
          answer: 'Ensure you have the latest app version, stable internet connection, and correct credentials. Clear app cache if issues persist.',
          helpful: 28,
          notHelpful: 7,
        },
      ],
    },
  ];

  const supportTickets = [
    {
      id: 'TK-001',
      subject: 'Unable to complete payment',
      category: 'Payments',
      priority: 'high',
      status: 'open',
      created: '2023-12-15T10:30:00Z',
      updated: '2023-12-15T14:20:00Z',
      assignedTo: 'Sarah Johnson',
      messages: 3,
    },
    {
      id: 'TK-002',
      subject: 'Account verification issue',
      category: 'Account',
      priority: 'medium',
      status: 'in_progress',
      created: '2023-12-14T09:15:00Z',
      updated: '2023-12-15T11:45:00Z',
      assignedTo: 'Mike Chen',
      messages: 5,
    },
    {
      id: 'TK-003',
      subject: 'Feature request: Dark mode',
      category: 'Feature Request',
      priority: 'low',
      status: 'resolved',
      created: '2023-12-10T16:20:00Z',
      updated: '2023-12-12T10:30:00Z',
      assignedTo: 'Alex Rodriguez',
      messages: 8,
    },
  ];

  const contactOptions = [
    {
      id: 1,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: <Chat />,
      available: true,
      responseTime: 'Usually responds in 2-5 minutes',
      action: 'Start Chat',
    },
    {
      id: 2,
      title: 'Phone Support',
      description: 'Speak directly with a support representative',
      icon: <Phone />,
      available: true,
      responseTime: 'Available 24/7',
      action: 'Call Now',
      phone: '+1 (555) 123-4567',
    },
    {
      id: 3,
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Email />,
      available: true,
      responseTime: 'Usually responds within 24 hours',
      action: 'Send Email',
      email: 'support@example.com',
    },
    {
      id: 4,
      title: 'Video Call',
      description: 'Schedule a video call for complex issues',
      icon: <VideoCall />,
      available: false,
      responseTime: 'Available Mon-Fri 9AM-5PM EST',
      action: 'Schedule Call',
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleSearchFAQ = (query) => {
    setSearchQuery(query);
    // In a real app, this would filter FAQ results
  };

  const handleContactSubmit = async () => {
    setSubmitLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, dispatch create ticket action
      // dispatch(createSupportTicket(contactForm));
      
      setContactDialog(false);
      setContactForm({
        subject: '',
        category: '',
        priority: 'medium',
        message: '',
        attachments: [],
      });
    } catch (error) {
      console.error('Error submitting ticket:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    setSubmitLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, dispatch submit feedback action
      // dispatch(submitFeedback(feedbackForm));
      
      setFeedbackDialog(false);
      setFeedbackForm({
        rating: 0,
        category: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleHelpfulVote = (questionId, helpful) => {
    // In a real app, this would update the helpful votes
    console.log('Vote:', questionId, helpful);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading support center..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Support Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get help, find answers, and contact our support team
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Help Center" />
          <Tab label="Contact Support" />
          <Tab
            label={
              <Badge badgeContent={supportTickets.filter(t => t.status !== 'resolved').length} color="error">
                My Tickets
              </Badge>
            }
          />
          <Tab label="Feedback" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Search */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Search Help Articles
                </Typography>
                <TextField
                  fullWidth
                  placeholder="What can we help you with?"
                  value={searchQuery}
                  onChange={(e) => handleSearchFAQ(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </CardContent>
            </Card>

            {/* FAQ Categories */}
            {faqCategories.map((category) => (
              <Card key={category.id} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {category.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {category.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.count} articles
                      </Typography>
                    </Box>
                  </Box>
                  
                  {category.questions.map((faq) => (
                    <Accordion key={faq.id} elevation={0}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body1">
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {faq.answer}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Was this helpful?
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<ThumbUp />}
                            onClick={() => handleHelpfulVote(faq.id, true)}
                          >
                            Yes ({faq.helpful})
                          </Button>
                          <Button
                            size="small"
                            startIcon={<ThumbDown />}
                            onClick={() => handleHelpfulVote(faq.id, false)}
                          >
                            No ({faq.notHelpful})
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            ))}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Need More Help?
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Chat />}
                    onClick={() => setActiveTab(1)}
                  >
                    Contact Support
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<History />}
                    onClick={() => setActiveTab(2)}
                  >
                    View My Tickets
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Feedback />}
                    onClick={() => setActiveTab(3)}
                  >
                    Send Feedback
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Popular Articles
                </Typography>
                <List dense>
                  <ListItemButton>
                    <ListItemText
                      primary="How to send money"
                      secondary="Step-by-step guide"
                    />
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemText
                      primary="Setting up 2FA"
                      secondary="Security best practices"
                    />
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemText
                      primary="Transaction limits"
                      secondary="Understanding your limits"
                    />
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemText
                      primary="Account verification"
                      secondary="Required documents"
                    />
                  </ListItemButton>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Contact Options */}
            <Grid container spacing={2}>
              {contactOptions.map((option) => (
                <Grid item xs={12} sm={6} key={option.id}>
                  <Card
                    sx={{
                      height: '100%',
                      opacity: option.available ? 1 : 0.6,
                      cursor: option.available ? 'pointer' : 'default',
                    }}
                    onClick={() => option.available && setContactDialog(true)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {option.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {option.title}
                          </Typography>
                          <Chip
                            label={option.available ? 'Available' : 'Unavailable'}
                            color={option.available ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {option.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        {option.responseTime}
                      </Typography>
                      {option.phone && (
                        <Typography variant="body2" fontWeight="bold">
                          {option.phone}
                        </Typography>
                      )}
                      {option.email && (
                        <Typography variant="body2" fontWeight="bold">
                          {option.email}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Contact Form Sidebar */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Submit a Ticket
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Can't find what you're looking for? Create a support ticket and we'll get back to you.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setTicketDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Create Ticket
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    My Support Tickets
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setTicketDialog(true)}
                  >
                    New Ticket
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ticket ID</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Updated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {supportTickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <TableCell>{ticket.id}</TableCell>
                          <TableCell>{ticket.subject}</TableCell>
                          <TableCell>{ticket.category}</TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.priority}
                              color={getPriorityColor(ticket.priority)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.status}
                              color={getStatusColor(ticket.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(ticket.created)}</TableCell>
                          <TableCell>{formatDate(ticket.updated)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Send Feedback
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Help us improve by sharing your thoughts and suggestions.
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    How would you rate your overall experience?
                  </Typography>
                  <Rating
                    value={feedbackForm.rating}
                    onChange={(e, value) => setFeedbackForm(prev => ({ ...prev, rating: value }))}
                    size="large"
                    sx={{ mb: 3 }}
                  />
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Feedback Category</InputLabel>
                    <Select
                      value={feedbackForm.category}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <MenuItem value="general">General Feedback</MenuItem>
                      <MenuItem value="bug">Bug Report</MenuItem>
                      <MenuItem value="feature">Feature Request</MenuItem>
                      <MenuItem value="ui">User Interface</MenuItem>
                      <MenuItem value="performance">Performance</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Your Feedback"
                    placeholder="Tell us what you think..."
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, message: e.target.value }))}
                    sx={{ mb: 3 }}
                  />
                  
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={() => setFeedbackDialog(true)}
                    disabled={!feedbackForm.rating || !feedbackForm.message}
                  >
                    Submit Feedback
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Feedback Sidebar */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feedback Types
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Lightbulb color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Feature Request"
                      secondary="Suggest new features"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BugReport color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Bug Report"
                      secondary="Report issues or bugs"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Feedback color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="General Feedback"
                      secondary="Share your thoughts"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={ticketDialog} onClose={() => setTicketDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Subject"
              value={contactForm.subject}
              onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
              sx={{ mb: 3 }}
            />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={contactForm.category}
                    onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <MenuItem value="account">Account & Security</MenuItem>
                    <MenuItem value="payments">Payments & Transactions</MenuItem>
                    <MenuItem value="technical">Technical Issues</MenuItem>
                    <MenuItem value="billing">Billing & Fees</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Message"
              placeholder="Please describe your issue in detail..."
              value={contactForm.message}
              onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              sx={{ mb: 3 }}
            />
            
            <Button
              variant="outlined"
              startIcon={<Attachment />}
              sx={{ mb: 2 }}
            >
              Attach Files
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleContactSubmit}
            disabled={submitLoading || !contactForm.subject || !contactForm.message}
          >
            {submitLoading ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Confirmation Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Feedback</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Thank you for taking the time to provide feedback! Your input helps us improve our service.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Your feedback will be reviewed by our team and may be used to improve our products and services.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleFeedbackSubmit}
            disabled={submitLoading}
          >
            {submitLoading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>

      {submitLoading && (
        <LoadingSpinner message="Submitting your request..." />
      )}
    </Box>
  );
};

export default SupportPage;