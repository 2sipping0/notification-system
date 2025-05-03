const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

/**
 * Get all notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with notifications
 */
exports.getAllNotifications = (req, res) => {
  try {
    const notifications = Notification.getAll();
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting all notifications:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get notifications for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with user's notifications
 */
exports.getUserNotifications = (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const notifications = Notification.getByUserId(userId);
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created notification
 */
exports.createNotification = (req, res) => {
  try {
    const { userId, type, title, message, metadata } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ 
        message: 'Type, title, and message are required' 
      });
    }

    const notification = Notification.create({
      userId,
      type,
      title,
      message,
      metadata
    });

    // If notification is for a specific user, emit via socket.io
    if (userId) {
      const io = req.app.get('io');
      notificationService.sendToUser(io, userId, notification);
    } else {
      // System-wide notification
      const io = req.app.get('io');
      notificationService.broadcast(io, notification);
    }

    return res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Mark a notification as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated notification
 */
exports.markAsRead = (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = Notification.markAsRead(id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success status
 */
exports.deleteNotification = (req, res) => {
  try {
    const { id } = req.params;
    
    const success = Notification.delete(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete all notifications for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success status
 */
exports.deleteUserNotifications = (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const deletedCount = Notification.deleteByUserId(userId);

    return res.status(200).json({ 
      message: `${deletedCount} notifications deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting user notifications:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};