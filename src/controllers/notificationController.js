const notificationService = require('../services/notificationService');

/**
 * Send a notification
 * @route POST /notifications
 */
async function sendNotification(req, res) {
  try {
    const { userId, type, title, content, metadata } = req.body;
    
    // Validate required fields
    if (!userId || !type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, type, title, content'
      });
    }
    
    // Validate notification type
    const validTypes = ['EMAIL', 'SMS', 'IN_APP'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid notification type. Must be one of: ${validTypes.join(', ')}`
      });
    }
    
    // Additional validation based on type
    if (type === 'EMAIL' && (!metadata || !metadata.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email notifications require recipient email in metadata'
      });
    }
    
    if (type === 'SMS' && (!metadata || !metadata.phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'SMS notifications require recipient phone number in metadata'
      });
    }
    
    const result = await notificationService.createNotification({
      userId,
      type,
      title,
      content,
      metadata: metadata || {}
    });
    
    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'Notification created and queued for delivery',
        notification: result.notification
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in sendNotification controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Get user notifications
 * @route GET /users/:id/notifications
 */
async function getUserNotifications(req, res) {
  try {
    const { id: userId } = req.params;
    const { limit = 10, offset = 0, type } = req.query;
    
    const result = await notificationService.getUserNotifications(userId, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      type
    });
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        notifications: result.notifications,
        pagination: {
          limit: parseInt(limit, 10),
          offset: parseInt(offset, 10)
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in getUserNotifications controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  sendNotification,
  getUserNotifications
}; 