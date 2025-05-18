const config = require('../config/config');

/**
 * Send an SMS notification
 */
async function sendSMS(notification) {
  console.log('SMS Service: Twilio not configured, logging notification instead');
  console.log('Notification:', notification);
  
  return {
    success: false,
    error: 'SMS service not configured'
  };
}

module.exports = {
  sendSMS
}; 