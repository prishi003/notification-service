const Notification = require('../models/notification');

/**
 * Create an in-app notification in the database
 * 
 * @param {Object} notification - The notification object
 * @param {string} notification.userId - ID of the recipient user
 * @param {string} notification.title - Notification title
 * @param {string} notification.content - Notification content
 * @param {Object} notification.metadata - Additional metadata
 * @returns {Promise<Object>} - Result of the in-app notification creation
 */
async function createInAppNotification(notification) {
  try {
    // Create in-app notification record
    const inAppNotification = new Notification({
      userId: notification.userId,
      type: 'IN_APP',
      title: notification.title,
      content: notification.content,
      metadata: notification.metadata,
      status: 'SENT' // Considered sent once created in DB
    });

    await inAppNotification.save();

    return {
      success: true,
      notificationId: inAppNotification._id
    };
  } catch (error) {
    console.error('In-app notification service error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all in-app notifications for a specific user
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, offset, etc.)
 * @returns {Promise<Array>} - List of notifications
 */
async function getUserNotifications(userId, options = {}) {
  const { limit = 10, offset = 0 } = options;
  
  try {
    const notifications = await Notification.find({ 
      userId,
      type: 'IN_APP' 
    })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
    
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
}

module.exports = {
  createInAppNotification,
  getUserNotifications
}; 