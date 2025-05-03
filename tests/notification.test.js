const Notification = require('../models/Notification');

describe('Notification Model', () => {
  // Clear notifications before each test
  beforeEach(() => {
    // Access and clear the private notifications array
    const notificationsArray = Notification.getAll();
    notificationsArray.length = 0;
  });

  describe('create', () => {
    test('should create a notification with required fields', () => {
      const data = {
        userId: 'user123',
        type: 'info',
        title: 'Test Title',
        message: 'Test Message'
      };

      const notification = Notification.create(data);

      expect(notification).toHaveProperty('id');
      expect(notification.userId).toBe(data.userId);
      expect(notification.type).toBe(data.type);
      expect(notification.title).toBe(data.title);
      expect(notification.message).toBe(data.message);
      expect(notification.read).toBe(false);
      expect(notification).toHaveProperty('createdAt');
      expect(notification).toHaveProperty('metadata');
    });

    test('should create a notification with metadata', () => {
      const data = {
        userId: 'user123',
        type: 'task',
        title: 'New Task',
        message: 'You need to complete this task',
        metadata: {
          taskId: 'task_123',
          priority: 'high'
        }
      };

      const notification = Notification.create(data);
      expect(notification.metadata).toEqual(data.metadata);
    });
  });

  describe('getAll', () => {
    test('should return all notifications', () => {
      const data1 = {
        userId: 'user1',
        type: 'info',
        title: 'Title 1',
        message: 'Message 1'
      };
      
      const data2 = {
        userId: 'user2',
        type: 'task',
        title: 'Title 2',
        message: 'Message 2'
      };

      Notification.create(data1);
      Notification.create(data2);

      const notifications = Notification.getAll();
      expect(notifications).toHaveLength(2);
    });
  });

  describe('getByUserId', () => {
    test('should return notifications for a specific user', () => {
      const userId = 'user123';
      
      // Create notifications for user123
      Notification.create({
        userId,
        type: 'info',
        title: 'Title 1',
        message: 'Message 1'
      });
      
      Notification.create({
        userId,
        type: 'task',
        title: 'Title 2',
        message: 'Message 2'
      });
      
      // Create notification for another user
      Notification.create({
        userId: 'another_user',
        type: 'info',
        title: 'Title 3',
        message: 'Message 3'
      });

      const userNotifications = Notification.getByUserId(userId);
      expect(userNotifications).toHaveLength(2);
      expect(userNotifications[0].userId).toBe(userId);
      expect(userNotifications[1].userId).toBe(userId);
    });

    test('should include system-wide notifications (null userId)', () => {
      const userId = 'user123';
      
      // Create user notification
      Notification.create({
        userId,
        type: 'info',
        title: 'User Title',
        message: 'User Message'
      });
      
      // Create system notification
      Notification.create({
        userId: null,
        type: 'system',
        title: 'System Title',
        message: 'System Message'
      });

      const userNotifications = Notification.getByUserId(userId);
      expect(userNotifications).toHaveLength(2);
      expect(userNotifications.some(n => n.type === 'system')).toBe(true);
    });
  });

  describe('markAsRead', () => {
    test('should mark a notification as read', () => {
      const notification = Notification.create({
        userId: 'user123',
        type: 'info',
        title: 'Test Title',
        message: 'Test Message'
      });

      expect(notification.read).toBe(false);
      
      const updatedNotification = Notification.markAsRead(notification.id);
      expect(updatedNotification.read).toBe(true);
      
      // Verify the notification is updated in storage
      const storedNotification = Notification.getById(notification.id);
      expect(storedNotification.read).toBe(true);
    });

    test('should return null for non-existent notification', () => {
      const result = Notification.markAsRead('non_existent_id');
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    test('should delete a notification', () => {
      const notification = Notification.create({
        userId: 'user123',
        type: 'info',
        title: 'Test Title',
        message: 'Test Message'
      });

      const success = Notification.delete(notification.id);
      expect(success).toBe(true);
      
      // Verify the notification is deleted
      const notificationExists = Notification.getById(notification.id);
      expect(notificationExists).toBeNull();
    });

    test('should return false for non-existent notification', () => {
      const success = Notification.delete('non_existent_id');
      expect(success).toBe(false);
    });
  });

  describe('deleteByUserId', () => {
    test('should delete all notifications for a user', () => {
      const userId = 'user123';
      
      // Create notifications for user123
      Notification.create({
        userId,
        type: 'info',
        title: 'Title 1',
        message: 'Message 1'
      });
      
      Notification.create({
        userId,
        type: 'task',
        title: 'Title 2',
        message: 'Message 2'
      });
      
      // Create notification for another user
      Notification.create({
        userId: 'another_user',
        type: 'info',
        title: 'Title 3',
        message: 'Message 3'
      });

      const deletedCount = Notification.deleteByUserId(userId);
      expect(deletedCount).toBe(2);
      
      // Verify the notifications are deleted
      const userNotifications = Notification.getByUserId(userId);
      expect(userNotifications).toHaveLength(0);
      
      // Verify other user's notifications are not deleted
      const allNotifications = Notification.getAll();
      expect(allNotifications).toHaveLength(1);
      expect(allNotifications[0].userId).toBe('another_user');
    });
  });
});