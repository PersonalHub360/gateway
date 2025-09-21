const axios = require('axios');

// SMS service configuration
const SMS_CONFIG = {
  provider: process.env.SMS_PROVIDER || 'twilio', // twilio, nexmo, textlocal, etc.
  apiKey: process.env.SMS_API_KEY,
  apiSecret: process.env.SMS_API_SECRET,
  apiUrl: process.env.SMS_API_URL,
  senderId: process.env.SMS_SENDER_ID || 'TREA-PAY'
};

// Twilio SMS implementation
const sendTwilioSMS = async (to, message) => {
  try {
    const accountSid = SMS_CONFIG.apiKey;
    const authToken = SMS_CONFIG.apiSecret;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: fromNumber,
        To: to,
        Body: message
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.sid,
      status: response.data.status
    };
  } catch (error) {
    console.error('Twilio SMS error:', error.response?.data || error.message);
    throw new Error(`Twilio SMS failed: ${error.response?.data?.message || error.message}`);
  }
};

// Nexmo/Vonage SMS implementation
const sendNexmoSMS = async (to, message) => {
  try {
    const response = await axios.post('https://rest.nexmo.com/sms/json', {
      from: SMS_CONFIG.senderId,
      to: to.replace('+', ''),
      text: message,
      api_key: SMS_CONFIG.apiKey,
      api_secret: SMS_CONFIG.apiSecret
    });

    if (response.data.messages[0].status === '0') {
      return {
        success: true,
        messageId: response.data.messages[0]['message-id'],
        status: 'sent'
      };
    } else {
      throw new Error(response.data.messages[0]['error-text']);
    }
  } catch (error) {
    console.error('Nexmo SMS error:', error.response?.data || error.message);
    throw new Error(`Nexmo SMS failed: ${error.response?.data?.message || error.message}`);
  }
};

// TextLocal SMS implementation (popular in India/UK)
const sendTextLocalSMS = async (to, message) => {
  try {
    const response = await axios.post(
      'https://api.textlocal.in/send/',
      new URLSearchParams({
        apikey: SMS_CONFIG.apiKey,
        numbers: to.replace('+', ''),
        message: message,
        sender: SMS_CONFIG.senderId
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (response.data.status === 'success') {
      return {
        success: true,
        messageId: response.data.messages[0].id,
        status: 'sent'
      };
    } else {
      throw new Error(response.data.errors[0].message);
    }
  } catch (error) {
    console.error('TextLocal SMS error:', error.response?.data || error.message);
    throw new Error(`TextLocal SMS failed: ${error.response?.data?.message || error.message}`);
  }
};

// Generic HTTP SMS implementation
const sendGenericSMS = async (to, message) => {
  try {
    const response = await axios.post(SMS_CONFIG.apiUrl, {
      to: to,
      message: message,
      from: SMS_CONFIG.senderId,
      api_key: SMS_CONFIG.apiKey
    }, {
      headers: {
        'Authorization': `Bearer ${SMS_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      messageId: response.data.id || response.data.message_id,
      status: response.data.status || 'sent'
    };
  } catch (error) {
    console.error('Generic SMS error:', error.response?.data || error.message);
    throw new Error(`SMS failed: ${error.response?.data?.message || error.message}`);
  }
};

// Main SMS sending function
const sendSMS = async (options) => {
  try {
    const { to, message, priority = 'normal' } = options;

    // Validate phone number format
    if (!to || !to.match(/^\+?[1-9]\d{1,14}$/)) {
      throw new Error('Invalid phone number format');
    }

    // Validate message
    if (!message || message.length === 0) {
      throw new Error('Message cannot be empty');
    }

    // Check message length (SMS limit is typically 160 characters)
    if (message.length > 160) {
      console.warn('SMS message exceeds 160 characters, may be sent as multiple messages');
    }

    // Format phone number
    const formattedPhone = to.startsWith('+') ? to : `+${to}`;

    let result;

    // Choose SMS provider based on configuration
    switch (SMS_CONFIG.provider.toLowerCase()) {
      case 'twilio':
        result = await sendTwilioSMS(formattedPhone, message);
        break;
      case 'nexmo':
      case 'vonage':
        result = await sendNexmoSMS(formattedPhone, message);
        break;
      case 'textlocal':
        result = await sendTextLocalSMS(formattedPhone, message);
        break;
      case 'generic':
        result = await sendGenericSMS(formattedPhone, message);
        break;
      default:
        throw new Error(`Unsupported SMS provider: ${SMS_CONFIG.provider}`);
    }

    console.log('SMS sent successfully:', {
      to: formattedPhone,
      messageId: result.messageId,
      status: result.status
    });

    return result;

  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
};

// Send OTP SMS
const sendOTPSMS = async (to, otp, expiryMinutes = 10) => {
  const message = `Your Trea Payment Gateway verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;
  
  return sendSMS({
    to,
    message,
    priority: 'high'
  });
};

// Send transaction notification SMS
const sendTransactionSMS = async (to, transactionData) => {
  const { type, amount, currency, status, transactionId } = transactionData;
  
  let message;
  switch (status) {
    case 'completed':
      message = `Transaction completed! ${type} of ${amount} ${currency}. ID: ${transactionId}. Thank you for using Trea Payment Gateway.`;
      break;
    case 'failed':
      message = `Transaction failed. ${type} of ${amount} ${currency}. ID: ${transactionId}. Please try again or contact support.`;
      break;
    case 'pending':
      message = `Transaction pending. ${type} of ${amount} ${currency}. ID: ${transactionId}. We'll notify you once processed.`;
      break;
    default:
      message = `Transaction ${status}. ${type} of ${amount} ${currency}. ID: ${transactionId}.`;
  }

  return sendSMS({
    to,
    message,
    priority: 'normal'
  });
};

// Send security alert SMS
const sendSecurityAlertSMS = async (to, alertType, location) => {
  const message = `Security Alert: ${alertType} detected on your Trea Payment Gateway account from ${location}. If this wasn't you, secure your account immediately.`;
  
  return sendSMS({
    to,
    message,
    priority: 'high'
  });
};

// Send account status SMS
const sendAccountStatusSMS = async (to, status, firstName) => {
  let message;
  switch (status) {
    case 'verified':
      message = `Hello ${firstName}, your Trea Payment Gateway account has been verified successfully. You can now access all features.`;
      break;
    case 'suspended':
      message = `Hello ${firstName}, your Trea Payment Gateway account has been suspended. Please contact support for assistance.`;
      break;
    case 'reactivated':
      message = `Hello ${firstName}, your Trea Payment Gateway account has been reactivated. Welcome back!`;
      break;
    default:
      message = `Hello ${firstName}, your Trea Payment Gateway account status has been updated to: ${status}.`;
  }

  return sendSMS({
    to,
    message,
    priority: 'normal'
  });
};

// Send bulk SMS
const sendBulkSMS = async (recipients) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendSMS(recipient);
      results.push({ 
        ...result, 
        to: recipient.to,
        success: true 
      });
    } catch (error) {
      results.push({ 
        success: false, 
        error: error.message, 
        to: recipient.to 
      });
    }
    
    // Add delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

// Verify SMS configuration
const verifySMSConfig = async () => {
  try {
    if (!SMS_CONFIG.apiKey) {
      throw new Error('SMS API key not configured');
    }

    // Test with a dummy number (won't actually send)
    console.log('SMS configuration verified:', {
      provider: SMS_CONFIG.provider,
      senderId: SMS_CONFIG.senderId,
      hasApiKey: !!SMS_CONFIG.apiKey
    });

    return true;
  } catch (error) {
    console.error('SMS configuration error:', error);
    return false;
  }
};

// Get SMS delivery status (if supported by provider)
const getSMSStatus = async (messageId) => {
  try {
    switch (SMS_CONFIG.provider.toLowerCase()) {
      case 'twilio':
        const response = await axios.get(
          `https://api.twilio.com/2010-04-01/Accounts/${SMS_CONFIG.apiKey}/Messages/${messageId}.json`,
          {
            auth: {
              username: SMS_CONFIG.apiKey,
              password: SMS_CONFIG.apiSecret
            }
          }
        );
        return {
          status: response.data.status,
          errorCode: response.data.error_code,
          errorMessage: response.data.error_message
        };
      default:
        return { status: 'unknown', message: 'Status check not supported for this provider' };
    }
  } catch (error) {
    console.error('SMS status check error:', error);
    return { status: 'error', message: error.message };
  }
};

// Format phone number for different regions
const formatPhoneNumber = (phone, countryCode = '+1') => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it doesn't start with country code, add it
  if (!phone.startsWith('+')) {
    return `${countryCode}${cleaned}`;
  }
  
  return phone;
};

// Validate phone number
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  sendSMS,
  sendOTPSMS,
  sendTransactionSMS,
  sendSecurityAlertSMS,
  sendAccountStatusSMS,
  sendBulkSMS,
  verifySMSConfig,
  getSMSStatus,
  formatPhoneNumber,
  validatePhoneNumber
};