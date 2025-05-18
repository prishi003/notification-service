const config = require('../config/config');

/**
 * Send an email notification
 */
async function sendEmail(notification) {
  console.log('Email Service: Not configured, logging notification instead');
  console.log('Notification:', notification);
  
  return {
    success: false,
    error: 'Email service not configured'
  };
}

module.exports = {
  sendEmail
}; 