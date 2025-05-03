const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications
 * @access  Public
 */
router.get('/', notificationController.getAllNotifications);

/**
 * @route   GET /api/notifications/:userId
 * @desc    Get notifications for a specific user
 * @access  Public
 */
router.get('/:userId', notificationController.getUserNotifications);

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification
 * @access  Public
 */
router.post('/', notificationController.createNotification);

/**
 * @route   PUT /api/notifications/:id
 * @desc    Mark a notification as read
 * @access  Public
 */
router.put('/:id', notificationController.markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Public
 */
router.delete('/:id', notificationController.deleteNotification);

/**
 * @route   DELETE /api/notifications/user/:userId
 * @desc    Delete all notifications for a user
 * @access  Public
 */
router.delete('/user/:userId', notificationController.deleteUserNotifications);

module.exports = router;