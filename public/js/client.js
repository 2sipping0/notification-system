// Create custom notification
createNotificationBtn.addEventListener('click', () => {
    if (!currentUserId) {
      alert('Please register first');
      return;
    }
    
    const type = notificationTypeSelect.value;
    const title = notificationTitleInput.value.trim();
    const message = notificationMessageInput.value.trim();
    
    if (!title || !message) {
      alert('Please enter both title and message');
      return;
    }
    
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUserId,
        type,
        title,
        message
      })
    })
      .then(response => response.json())
      .then(data => {
        // Clear form
        notificationTitleInput.value = '';
        notificationMessageInput.value = '';
        
        // Show success message
        showLocalNotification({
          type: 'success',
          title: 'Notification Created',
          message: 'Your custom notification has been created',
          createdAt: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error('Error creating notification:', error);
      });
  });
  
  // Event listeners for utility buttons
  clearAllBtn.addEventListener('click', clearAllNotifications);
  markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
  
  // Socket event listeners
  socket.on('connect', () => {
    console.log('Connected to socket server');
  });
  
  socket.on('notification:new', (notification) => {
    console.log('New notification received:', notification);
    
    // Add to notifications array
    notifications.unshift(notification);
    
    // Update UI
    renderNotifications();
    
    // Play sound or show browser notification if needed
    // This is where you would add browser notifications
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
      
      browserNotification.onclick = () => {
        window.focus();
      };
    }
  });
  
  socket.on('notification:system', (notification) => {
    console.log('System notification received:', notification);
    
    // Add to notifications array
    notifications.unshift(notification);
    
    // Update UI
    renderNotifications();
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
  });
  
  // Request browser notification permission on page load
  document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  });
  // Show local notification (not saved to server)
  function showLocalNotification(data) {
    const tempNotification = {
      id: `local_${Date.now()}`,
      ...data,
      read: false
    };
    
    // Add to beginning of array
    notifications.unshift(tempNotification);
    renderNotifications();
    
    // Remove after 5 seconds
    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== tempNotification.id);
      renderNotifications();
    }, 5000);
  }
  
  // Trigger registration welcome notification
  triggerRegisterBtn.addEventListener('click', () => {
    if (!currentUserId) {
      alert('Please register first');
      return;
    }
    
    const username = usernameInput.value.trim() || 'User';
    
    fetch('/api/demo/events/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, username })
    })
      .then(response => response.json())
      .then(() => {
        showLocalNotification({
          type: 'info',
          title: 'Event Triggered',
          message: `Welcome event triggered for ${username}`,
          createdAt: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error('Error triggering welcome event:', error);
      });
  });
  
  // Trigger new message notification
  triggerMessageBtn.addEventListener('click', () => {
    if (!currentUserId) {
      alert('Please register first');
      return;
    }
    
    const senderName = senderNameInput.value.trim() || 'Someone';
    
    fetch('/api/demo/events/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: currentUserId, 
        senderName,
        messageId: `msg_${Date.now()}`
      })
    })
      .then(response => response.json())
      .then(() => {
        showLocalNotification({
          type: 'info',
          title: 'Event Triggered',
          message: `Message event triggered from ${senderName}`,
          createdAt: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error('Error triggering message event:', error);
      });
  });
  
  // Trigger task assignment notification
  triggerTaskBtn.addEventListener('click', () => {
    if (!currentUserId) {
      alert('Please register first');
      return;
    }
    
    const taskName = taskNameInput.value.trim() || 'New Task';
    
    fetch('/api/demo/events/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: currentUserId, 
        taskName,
        taskId: `task_${Date.now()}`
      })
    })
      .then(response => response.json())
      .then(() => {
        showLocalNotification({
          type: 'info',
          title: 'Event Triggered',
          message: `Task assignment event triggered for "${taskName}"`,
          createdAt: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error('Error triggering task event:', error);
      });
  });
  
  // Trigger system maintenance notification
  triggerMaintenanceBtn.addEventListener('click', () => {
    const message = maintenanceMsgInput.value.trim() || 'Scheduled maintenance';
    
    fetch('/api/demo/events/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message,
        scheduledTime: new Date(Date.now() + 86400000).toISOString()
      })
    })
      .then(response => response.json())
      .then(() => {
        showLocalNotification({
          type: 'info',
          title: 'Event Triggered',
          message: `System maintenance event triggered: "${message}"`,
          createdAt: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error('Error triggering maintenance event:', error);
      });
  });
  // Render notifications in DOM
  function renderNotifications() {
    if (!notifications.length) {
      notificationsContainer.innerHTML = '<div class="empty-state">No notifications yet</div>';
      return;
    }
  
    // Sort notifications by date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
    notificationsContainer.innerHTML = '';
    notifications.forEach(notification => {
      const notificationEl = createNotificationElement(notification);
      notificationsContainer.appendChild(notificationEl);
    });
  }
  
  // Create notification DOM element
  function createNotificationElement(notification) {
    const { id, type, title, message, read, createdAt } = notification;
    
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification-item type-${type} ${read ? 'read' : 'unread'}`;
    notificationEl.dataset.id = id;
    
    const formattedDate = new Date(createdAt).toLocaleString();
    
    notificationEl.innerHTML = `
      <div class="title">${title}</div>
      <div class="message">${message}</div>
      <div class="meta">
        <span class="date">${formattedDate}</span>
        <span class="type">${type}</span>
      </div>
      <div class="actions">
        <button class="mark-read-btn" title="Mark as ${read ? 'unread' : 'read'}">
          ${read ? '◯' : '●'}
        </button>
        <button class="delete-btn" title="Delete">✕</button>
      </div>
    `;
    
    // Add event listeners
    const markReadBtn = notificationEl.querySelector('.mark-read-btn');
    markReadBtn.addEventListener('click', () => {
      toggleNotificationReadStatus(id);
    });
    
    const deleteBtn = notificationEl.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      deleteNotification(id);
    });
    
    return notificationEl;
  }
  
  // Toggle notification read status
  function toggleNotificationReadStatus(id) {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        // Update notification in local array
        const index = notifications.findIndex(n => n.id === id);
        notifications[index] = data;
        renderNotifications();
      })
      .catch(error => {
        console.error('Error updating notification:', error);
      });
  }
  
  // Delete notification
  function deleteNotification(id) {
    fetch(`/api/notifications/${id}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(() => {
        // Remove from local array
        notifications = notifications.filter(n => n.id !== id);
        renderNotifications();
      })
      .catch(error => {
        console.error('Error deleting notification:', error);
      });
  }
  
  // Delete all notifications for current user
  function clearAllNotifications() {
    if (!currentUserId) return;
    
    fetch(`/api/notifications/user/${currentUserId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(() => {
        notifications = [];
        renderNotifications();
      })
      .catch(error => {
        console.error('Error clearing notifications:', error);
      });
  }
  
  // Mark all notifications as read
  function markAllNotificationsAsRead() {
    if (!notifications.length) return;
    
    // Since we don't have a bulk update endpoint, we'll update each notification
    const unreadNotifications = notifications.filter(n => !n.read);
    
    Promise.all(
      unreadNotifications.map(notification => 
        fetch(`/api/notifications/${notification.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        })
      )
    )
      .then(() => {
        // Update all notifications as read in local array
        notifications = notifications.map(n => ({ ...n, read: true }));
        renderNotifications();
      })
      .catch(error => {
        console.error('Error marking all as read:', error);
      });
  }// Initialize socket connection
  const socket = io();
  
  // DOM Elements
  const userIdInput = document.getElementById('userId');
  const registerBtn = document.getElementById('registerBtn');
  const usernameInput = document.getElementById('username');
  const triggerRegisterBtn = document.getElementById('triggerRegisterBtn');
  const senderNameInput = document.getElementById('senderName');
  const triggerMessageBtn = document.getElementById('triggerMessageBtn');
  const taskNameInput = document.getElementById('taskName');
  const triggerTaskBtn = document.getElementById('triggerTaskBtn');
  const maintenanceMsgInput = document.getElementById('maintenanceMsg');
  const triggerMaintenanceBtn = document.getElementById('triggerMaintenanceBtn');
  const notificationTypeSelect = document.getElementById('notificationType');
  const notificationTitleInput = document.getElementById('notificationTitle');
  const notificationMessageInput = document.getElementById('notificationMessage');
  const createNotificationBtn = document.getElementById('createNotificationBtn');
  const notificationsContainer = document.getElementById('notifications');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  
  // State management
  let currentUserId = null;
  let notifications = [];
  
  // Register user
  registerBtn.addEventListener('click', () => {
    const userId = userIdInput.value.trim();
    if (!userId) {
      alert('Please enter a valid user ID');
      return;
    }
  
    currentUserId = userId;
    socket.emit('register', userId);
  
    // Fetch existing notifications for this user
    fetchUserNotifications(userId);
  
    // Update UI
    registerBtn.textContent = 'Registered';
    registerBtn.disabled = true;
    userIdInput.disabled = true;
    notificationsContainer.innerHTML = '<div class="empty-state">Loading notifications...</div>';
  
    // Show success notification
    showLocalNotification({
      type: 'success',
      title: 'Successfully registered',
      message: `You are now registered with user ID: ${userId}`,
      createdAt: new Date().toISOString()
    });
  });
  
  // Fetch user notifications from API
  function fetchUserNotifications(userId) {
    fetch(`/api/notifications/${userId}`)
      .then(response => response.json())
      .then(data => {
        notifications = data;
        renderNotifications();
      })
      .catch(error => {
        console.error('Error fetching notifications:', error);
        notificationsContainer.innerHTML = '<div class="empty-state">Error loading notifications. Please try again.</div>';
      });
  }