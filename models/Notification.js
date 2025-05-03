/**
 * Since this is a simple in-memory implementation without a database,
 * we'll create a simple model class to represent notifications.
 * In a real application, you would use a database model (e.g., with MongoDB/Mongoose)
 */

// In-memory store for notifications
const notifications = [];

class Notification {
  /**
   * Create a new notification
   * @param {Object} data - Notification data
   * @param {string} data.userId - User ID (null for system-wide)
   * @param {string} data.type - Notification type (welcome, message, task, system)
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {Object} [data.metadata] - Additional metadata
   * @returns {Object} Created notification
   */
  static create(data) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      read: false,
      createdAt: new Date().toISOString(),
      metadata: data.metadata || {}
    };

    notifications.push(notification);
    return notification;
  }

  /**
   * Get all notifications
   * @returns {Array} All notifications
   */
  static getAll() {
    return [...notifications];
  }

  /**
   * Get notifications for a specific user
   * @param {string} userId - User ID
   * @returns {Array} User notifications
   */
  static getByUserId(userId) {
    return notifications.filter(
      notification => notification.userId === userId || notification.userId === null
    );
  }

  /**
   * Get a notification by ID
   * @param {string} id - Notification ID
   * @returns {Object|null} Notification or null if not found
   */
  static getById(id) {
    return notifications.find(notification => notification.id === id) || null;
  }

  /**
   * Update a notification
   * @param {string} id - Notification ID
   * @param {Object} data - Updated data
   * @returns {Object|null} Updated notification or null if not found
   */
  static update(id, data) {
    const index = notifications.findIndex(notification => notification.id === id);
    if (index === -1) return null;

    const updatedNotification = {
      ...notifications[index],
      ...data,
      id: notifications[index].id // Ensure ID doesn't change
    };

    notifications[index] = updatedNotification;
    return updatedNotification;
  }

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   * @returns {Object|null} Updated notification or null if not found
   */
  static markAsRead(id) {
    return this.update(id, { read: true });
  }

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @returns {boolean} Success status
   */
  static delete(id) {
    const index = notifications.findIndex(notification => notification.id === id);
    if (index === -1) return false;

    notifications.splice(index, 1);
    return true;
  }

  /**
   * Delete all notifications for a user
   * @param {string} userId - User ID
   * @returns {number} Number of deleted notifications
   */
  static deleteByUserId(userId) {
    const initialLength = notifications.length;
    const newNotifications = notifications.filter(
      notification => notification.userId !== userId
    );
    
    const deletedCount = initialLength - newNotifications.length;
    notifications.length = 0;
    notifications.push(...newNotifications);
    
    return deletedCount;
  }
}

module.exports = Notification;