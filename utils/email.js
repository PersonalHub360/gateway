const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const emailTemplates = {
  'email-verification': {
    subject: 'Verify Your Email - Trea Payment Gateway',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Trea Payment Gateway</h1>
          <p style="color: #6b7280; margin: 5px 0;">Secure Digital Payments</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">Welcome {{firstName}}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for registering with Trea Payment Gateway. To complete your registration and secure your account, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{verificationLink}}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="{{verificationLink}}" style="color: #2563eb; word-break: break-all;">{{verificationLink}}</a>
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <p>&copy; 2024 Trea Payment Gateway. All rights reserved.</p>
        </div>
      </div>
    `
  },

  'password-reset': {
    subject: 'Reset Your Password - Trea Payment Gateway',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Trea Payment Gateway</h1>
          <p style="color: #6b7280; margin: 5px 0;">Secure Digital Payments</p>
        </div>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #dc2626; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Hello {{firstName}}, we received a request to reset your password for your Trea Payment Gateway account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetLink}}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="{{resetLink}}" style="color: #dc2626; word-break: break-all;">{{resetLink}}</a>
          </p>
        </div>
        
        <div style="background: #fffbeb; border: 1px solid #fed7aa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>This reset link will expire in 1 hour.</p>
          <p>&copy; 2024 Trea Payment Gateway. All rights reserved.</p>
        </div>
      </div>
    `
  },

  'transaction-notification': {
    subject: 'Transaction {{status}} - Trea Payment Gateway',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Trea Payment Gateway</h1>
          <p style="color: #6b7280; margin: 5px 0;">Transaction Notification</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">Transaction {{status}}</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Hello {{firstName}}, your transaction has been {{status}}.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Transaction ID:</td>
                <td style="padding: 8px 0; color: #1f2937;">{{transactionId}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Amount:</td>
                <td style="padding: 8px 0; color: #1f2937;">{{amount}} {{currency}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Type:</td>
                <td style="padding: 8px 0; color: #1f2937;">{{type}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">{{date}}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>For any questions, please contact our support team.</p>
          <p>&copy; 2024 Trea Payment Gateway. All rights reserved.</p>
        </div>
      </div>
    `
  },

  'kyc-status': {
    subject: 'KYC Verification {{status}} - Trea Payment Gateway',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Trea Payment Gateway</h1>
          <p style="color: #6b7280; margin: 5px 0;">KYC Verification Update</p>
        </div>
        
        <div style="background: {{bgColor}}; border: 1px solid {{borderColor}}; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: {{textColor}}; margin-top: 0;">KYC Verification {{status}}</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Hello {{firstName}}, your KYC verification has been {{status}}.
          </p>
          
          {{#if message}}
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #1f2937; margin: 0;">{{message}}</p>
          </div>
          {{/if}}
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>For any questions, please contact our support team.</p>
          <p>&copy; 2024 Trea Payment Gateway. All rights reserved.</p>
        </div>
      </div>
    `
  },

  'security-alert': {
    subject: 'Security Alert - Trea Payment Gateway',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Trea Payment Gateway</h1>
          <p style="color: #6b7280; margin: 5px 0;">Security Alert</p>
        </div>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #dc2626; margin-top: 0;">Security Alert</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Hello {{firstName}}, we detected {{alertType}} on your account.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Time:</td>
                <td style="padding: 8px 0; color: #1f2937;">{{time}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">IP Address:</td>
                <td style="padding: 8px 0; color: #1f2937;">{{ipAddress}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Location:</td>
                <td style="padding: 8px 0; color: #1f2937;">{{location}}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #dc2626; font-weight: bold;">
            If this wasn't you, please secure your account immediately by changing your password and enabling 2FA.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>&copy; 2024 Trea Payment Gateway. All rights reserved.</p>
        </div>
      </div>
    `
  }
};

// Template rendering function
const renderTemplate = (templateName, data) => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  let html = template.html;
  let subject = template.subject;

  // Simple template replacement
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, data[key] || '');
    subject = subject.replace(regex, data[key] || '');
  });

  // Handle conditional blocks (basic implementation)
  html = html.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
    return data[condition] ? content : '';
  });

  return { html, subject };
};

// Main send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    let emailContent;
    
    if (options.template) {
      // Use template
      emailContent = renderTemplate(options.template, options.data || {});
    } else {
      // Use provided content
      emailContent = {
        html: options.html,
        subject: options.subject
      };
    }

    const mailOptions = {
      from: `"Trea Payment Gateway" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: options.text // Optional plain text version
    };

    // Add CC and BCC if provided
    if (options.cc) mailOptions.cc = options.cc;
    if (options.bcc) mailOptions.bcc = options.bcc;

    // Add attachments if provided
    if (options.attachments) mailOptions.attachments = options.attachments;

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: result.messageId,
      to: options.to,
      subject: emailContent.subject
    });

    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Bulk email sending
const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ ...result, to: email.to });
    } catch (error) {
      results.push({ 
        success: false, 
        error: error.message, 
        to: email.to 
      });
    }
  }
  
  return results;
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

// Send OTP email
const sendOTPEmail = async (to, otp, firstName) => {
  return sendEmail({
    to,
    template: 'otp-verification',
    data: {
      firstName,
      otp,
      expiryMinutes: 10
    }
  });
};

// Send transaction notification
const sendTransactionNotification = async (to, transactionData) => {
  const statusColors = {
    completed: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
    failed: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    pending: { bg: '#fffbeb', border: '#fed7aa', text: '#92400e' }
  };

  const colors = statusColors[transactionData.status] || statusColors.pending;

  return sendEmail({
    to,
    template: 'transaction-notification',
    data: {
      ...transactionData,
      bgColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text
    }
  });
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  verifyEmailConfig,
  sendOTPEmail,
  sendTransactionNotification,
  renderTemplate
};