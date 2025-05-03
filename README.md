# Real-Time Notification System

A flexible, real-time notification system built with Node.js, Express, and Socket.IO. This system allows you to send, receive, and manage notifications in real-time across web applications.

## Features

- **Real-time notifications** using Socket.IO
- **Multiple notification types**: welcome, message, task, system, and custom notifications
- **User-specific notifications** with room-based targeting
- **System-wide broadcasts** for announcements
- **REST API** for managing notifications
- **In-memory storage** (easily adaptable for database integration)
- **Demo UI** for testing and showcasing functionality
- **Event-driven architecture** for easy extension

## Architecture

The system is designed with an event-driven architecture, making it easy to extend and add new notification types. The main components are:

1. **Express Server**: Handles API requests and serves the demo UI
2. **Socket.IO**: Manages real-time communication with clients
3. **Event Emitter**: Centralizes notification events
4. **Notification Model**: Manages notification data (in-memory for simplicity)
5. **Demo UI**: Provides a way to test and visualize the system

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/2sipping0/notification-system.git
   cd notification-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (or use the provided sample):
   ```
   PORT=3000
   CORS_ORIGIN=http://localhost:3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Notifications API

| Method | Endpoint                        | Description                            |
|--------|--------------------------------|----------------------------------------|
| GET    | `/api/notifications`            | Get all notifications                  |
| GET    | `/api/notifications/:userId`    | Get notifications for a specific user  |
| POST   | `/api/notifications`            | Create a new notification              |
| PUT    | `/api/notifications/:id`        | Mark a notification as read            |
| DELETE | `/api/notifications/:id`        | Delete a notification                  |
| DELETE | `/api/notifications/user/:userId` | Delete all notifications for a user  |

### Demo Events API

| Method | Endpoint                      | Description                      |
|--------|------------------------------|----------------------------------|
| POST   | `/api/demo/events/register`   | Trigger a user registration event |
| POST   | `/api/demo/events/message`    | Trigger a new message event      |
| POST   | `/api/demo/events/task`       | Trigger a task assignment event  |
| POST   | `/api/demo/events/maintenance` | Trigger a system maintenance event |

## Socket.IO Events

### Client to Server

| Event       | Data                          | Description                             |
|-------------|------------------------------ |------------------------------------------|
| `register`  | `userId` (string)             | Register a socket with a specific user ID |

### Server to Client

| Event                | Data                                 | Description                          |
|----------------------|--------------------------------------|--------------------------------------|
| `notification:new`   | Notification object                  | Sent when a user-specific notification is created |
| `notification:system` | Notification object                 | Sent when a system-wide notification is created |

## Notification Object Structure

```javascript
{
  id: string,           // Unique notification ID
  userId: string|null,  // User ID (null for system-wide)
  type: string,         // Notification type (welcome, message, task, system, etc.)
  title: string,        // Notification title
  message: string,      // Notification message
  read: boolean,        // Read status
  createdAt: string,    // ISO date string
  metadata: object      // Additional metadata (optional)
}
```

## Event Types

The system currently supports the following event types:

- `user:registered` - When a user registers
- `message:new` - When a user receives a new message
- `task:assigned` - When a task is assigned to a user
- `system:maintenance` - When system maintenance is scheduled

## Extending the System

### Adding a New Notification Type

1. Add a new event handler in `events/notificationEvents.js`:

```javascript
notificationEvents.on('new:event', (data) => {
  // Create notification object
  const newNotification = {
    id: `new_event_${Date.now()}`,
    userId: data.userId,
    type: 'new_type',
    title: 'New Event Title',
    message: `New event message: ${data.someData}`,
    read: false,
    createdAt: new Date().toISOString(),
    metadata: {
      // Any additional data
    }
  };
  
  // Emit to specific user
  io.to(`user:${data.userId}`).emit('notification:new', newNotification);
});
```

2. Add a new trigger endpoint in `server.js` or create a dedicated route file:

```javascript
app.post('/api/demo/events/new-event', (req, res) => {
  const payload = req.body;
  
  notificationEvents.emit('new:event', {
    userId: payload.userId,
    someData: payload.someData
  });
  
  res.status(200).json({ success: true, eventType: 'new:event' });
});
```

### Database Integration

To persist notifications, you can modify the `models/Notification.js` file to use a database like MongoDB, PostgreSQL, or MySQL instead of in-memory storage.

Example with MongoDB/Mongoose:

1. Install mongoose:
   ```bash
   npm install mongoose
   ```

2. Create a schema in `models/Notification.js`:
   ```javascript
   const mongoose = require('mongoose');

   const notificationSchema = new mongoose.Schema({
     userId: String,
     type: String,
     title: String,
     message: String,
     read: { type: Boolean, default: false },
     createdAt: { type: Date, default: Date.now },
     metadata: Object
   });

   module.exports = mongoose.model('Notification', notificationSchema);
   ```

3. Update the controller methods to use Mongoose methods instead of the current in-memory functions.

## Testing

The system includes Jest tests for the notification model:

```bash
npm test
```

## License

MIT


---

Feel free to contribute or provide feedback!# notification-system
