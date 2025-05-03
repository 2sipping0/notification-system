const EventEmitter = require('events');

// Create an event emitter for notifications
const notificationEvents = new EventEmitter();

// Setup notification events
function setupEvents(io) {
  // Handle user registration events
  notificationEvents.on('user:registered', (data) => {
    console.log('User registered event:', data);
    const { userId, username } = data;
    
    // Create welcome notification
    const welcomeNotification = {
      id: `welcome_${Date.now()}`,
      userId,
      type: 'welcome',
      title: 'Welcome to the platform!',
      message: `Hello ${username}, welcome to our platform.`,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    // Emit to specific user
    io.to(`user:${userId}`).emit('notification:new', welcomeNotification);
  });

  // Handle new message events
  notificationEvents.on('message:new', (data) => {
    console.log('New message event:', data);
    const { userId, senderName, messageId } = data;
    
    // Create message notification
    const messageNotification = {
      id: `msg_notif_${Date.now()}`,
      userId,
      type: 'message',
      title: 'New Message',
      message: `You have a new message from ${senderName}`,
      read: false,
      createdAt: new Date().toISOString(),
      metadata: {
        messageId,
        senderName
      }
    };
    
    // Emit to specific user
    io.to(`user:${userId}`).emit('notification:new', messageNotification);
  });

  // Handle task assignment events
  notificationEvents.on('task:assigned', (data) => {
    console.log('Task assigned event:', data);
    const { userId, taskId, taskName } = data;
    
    // Create task notification
    const taskNotification = {
      id: `task_notif_${Date.now()}`,
      userId,
      type: 'task',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskName}`,
      read: false,
      createdAt: new Date().toISOString(),
      metadata: {
        taskId,
        taskName
      }
    };
    
    // Emit to specific user
    io.to(`user:${userId}`).emit('notification:new', taskNotification);
  });

  // Handle system maintenance events
  notificationEvents.on('system:maintenance', (data) => {
    console.log('System maintenance event:', data);
    const { message, scheduledTime } = data;
    
    // Create maintenance notification
    const maintenanceNotification = {
      id: `maintenance_${Date.now()}`,
      type: 'system',
      title: 'Scheduled Maintenance',
      message,
      read: false,
      createdAt: new Date().toISOString(),
      scheduledTime
    };
    
    // Emit to all connected clients
    io.emit('notification:system', maintenanceNotification);
  });
}

module.exports = {
  setupEvents,
  notificationEvents
};