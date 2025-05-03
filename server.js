require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import routes and events
const notificationRoutes = require('./routes/notifications');
const { setupEvents, notificationEvents } = require('./events/notificationEvents');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Set up notification events
setupEvents(io);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Make io accessible to our route handlers
app.set('io', io);

// Routes
app.use('/api/notifications', notificationRoutes);

// Demo routes to trigger events
app.post('/api/demo/events/:eventType', (req, res) => {
  const { eventType } = req.params;
  const payload = req.body;
  
  switch (eventType) {
    case 'register':
      notificationEvents.emit('user:registered', {
        userId: payload.userId,
        username: payload.username || 'User'
      });
      break;
    case 'message':
      notificationEvents.emit('message:new', {
        userId: payload.userId,
        senderName: payload.senderName || 'Someone',
        messageId: payload.messageId || 'msg_' + Date.now()
      });
      break;
    case 'task':
      notificationEvents.emit('task:assigned', {
        userId: payload.userId,
        taskId: payload.taskId || 'task_' + Date.now(),
        taskName: payload.taskName || 'New Task'
      });
      break;
    case 'maintenance':
      notificationEvents.emit('system:maintenance', {
        message: payload.message || 'Scheduled maintenance',
        scheduledTime: payload.scheduledTime || new Date(Date.now() + 86400000).toISOString()
      });
      break;
    default:
      return res.status(400).json({ error: 'Unknown event type' });
  }
  
  res.status(200).json({ success: true, eventType });
});

// Basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Associate this socket with a user ID
  socket.on('register', (userId) => {
    console.log(`User ${userId} registered with socket ${socket.id}`);
    socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});