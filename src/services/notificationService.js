const amqp = require('amqplib');
const config = require('../config/config');
const Notification = require('../models/notification');
const emailService = require('./emailService');
const smsService = require('./smsService');
const inAppService = require('./inAppService');

// Queue names
const NOTIFICATION_QUEUE = 'notification_queue';
const MAX_RETRIES = 3;

let channel;

/**
 * Initialize RabbitMQ connection and channel
 */
async function initializeQueue() {
  try {
    const connection = await amqp.connect(config.rabbitmq.url);
    channel = await connection.createChannel();
    
    // Ensure the queue exists
    await channel.assertQueue(NOTIFICATION_QUEUE, {
      durable: true, // Queue persists even if server restarts
    });
    
    console.log('RabbitMQ connection established');
    
    // Start consuming messages from the queue
    startConsumer();
  } catch (error) {
    console.error('Failed to initialize RabbitMQ:', error);
    // Retry connection after a delay
    setTimeout(initializeQueue, 5000);
  }
}

/**
 * Start consuming messages from the queue
 */
async function startConsumer() {
  try {
    await channel.consume(NOTIFICATION_QUEUE, async (message) => {
      if (message) {
        try {
          const notification = JSON.parse(message.content.toString());
          console.log(`Processing notification: ${notification._id}`);
          
          const result = await processNotification(notification);
          
          if (result.success) {
            // Acknowledge the message if processing was successful
            channel.ack(message);
          } else if (notification.retryCount < MAX_RETRIES) {
            // Retry the notification
            notification.retryCount += 1;
            await enqueueNotification(notification);
            channel.ack(message);
          } else {
            // Max retries reached, update notification as failed
            await Notification.findByIdAndUpdate(notification._id, { 
              status: 'FAILED',
              updatedAt: new Date()
            });
            channel.ack(message);
          }
        } catch (error) {
          console.error('Error processing message:', error);
          // Nack the message to requeue it for later processing
          channel.nack(message, false, true);
        }
      }
    });
  } catch (error) {
    console.error('Error setting up consumer:', error);
  }
}

/**
 * Enqueue a notification for processing
 * 
 * @param {Object} notification - The notification to be sent
 * @returns {Promise<Object>} - Queue operation result
 */
async function enqueueNotification(notification) {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    await channel.sendToQueue(
      NOTIFICATION_QUEUE,
      Buffer.from(JSON.stringify(notification)),
      { persistent: true }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error enqueueing notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process a notification based on its type
 * 
 * @param {Object} notification - The notification to process
 * @returns {Promise<Object>} - Processing result
 */
async function processNotification(notification) {
  try {
    let result;
    
    switch (notification.type) {
      case 'EMAIL':
        result = await emailService.sendEmail(notification);
        break;
      case 'SMS':
        result = await smsService.sendSMS(notification);
        break;
      case 'IN_APP':
        result = await inAppService.createInAppNotification(notification);
        break;
      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }
    
    if (result.success) {
      // Update notification status to SENT
      await Notification.findByIdAndUpdate(notification._id, { 
        status: 'SENT',
        updatedAt: new Date()
      });
    }
    
    return result;
  } catch (error) {
    console.error(`Error processing ${notification.type} notification:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Create and send a notification
 * 
 * @param {Object} notificationData - Data for the notification
 * @returns {Promise<Object>} - Created notification object
 */
async function createNotification(notificationData) {
  try {
    // Create notification in database
    const notification = new Notification({
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      content: notificationData.content,
      metadata: notificationData.metadata,
      status: 'PENDING'
    });
    
    await notification.save();
    
    // Enqueue for processing
    await enqueueNotification(notification.toObject());
    
    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get notifications for a specific user
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - List of user notifications
 */
async function getUserNotifications(userId, options = {}) {
  try {
    const { limit = 10, offset = 0, type } = options;
    
    const query = { userId };
    if (type) query.type = type;
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    return { success: true, notifications };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  initializeQueue,
  createNotification,
  getUserNotifications
}; 