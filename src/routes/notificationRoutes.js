const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Send notification endpoint
router.post('/notifications', notificationController.sendNotification);

// Get user notifications endpoint
router.get('/users/:id/notifications', notificationController.getUserNotifications);

module.exports = router; 