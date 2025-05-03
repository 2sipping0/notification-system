/**
 * Service for handling notification operations
 */
const notificationService = {
    /**
     * Send a notification to a specific user
     * @param {Object} io - Socket.io instance
     * @param {string} userId - User ID
     * @param {Object} notification - Notification object
     */
    sendToUser: (io, userId, notification) => {
      io.to(`user:${userId}`).emit('notification:new', notification);
    },
  
    /**
     * Broadcast a notification to all connected users
     * @param {Object} io - Socket.io instance
     * @param {Object} notification - Notification object
     */
    broadcast: (io, notification) => {
      io.emit('notification:system', notification);
    },
  
    /**
     * Send notifications to a list of users
     * @param {Object} io - Socket.io instance
     * @param {Array} userIds - Array of user IDs
     * @param {Object} notification - Notification object
     */
    sendToUsers: (io, userIds, notification) => {
      userIds.forEach(userId => {
        io.to(`user:${userId}`).emit('notification:new', {
          ...notification,
          userId
        });
      });
    }
  };
  
  module.exports = notificationService;