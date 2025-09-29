import React, { createContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create notification context
const NotificationContext = createContext();

// Mock notifications data
const initialNotifications = [
  {
    id: '1',
    type: 'newArrival',
    title: 'New Book Added',
    message: 'The Silent Patient by Alex Michaelides is now available in our library.',
    isRead: false,
    date: '2023-06-10T10:30:00Z',
    bookId: '13'
  },
  {
    id: '2',
    type: 'system',
    title: 'Account Update',
    message: 'Your account has been successfully updated.',
    isRead: true,
    date: '2023-06-09T14:15:00Z'
  },
  {
    id: '3',
    type: 'comment',
    title: 'New Comment on Your Review',
    message: 'David commented on your review of 1984: "Great insights into the book\'s themes!"',
    isRead: false,
    date: '2023-06-08T09:45:00Z',
    bookId: '4'
  },
  {
    id: '4',
    type: 'newArrival',
    title: 'New Book from Favorite Author',
    message: 'J.K. Rowling has released a new book. Check it out now!',
    isRead: false,
    date: '2023-06-07T16:20:00Z',
    bookId: '14'
  }
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState({
    newArrivals: true,
    comments: true,
    systemUpdates: true,
    weeklyNewsletter: false,
    authorUpdates: true
  });
  
  // Initialize notifications on mount
  useEffect(() => {
    // Try to load from localStorage first
    const loadNotifications = () => {
      try {
        const storedNotifications = localStorage.getItem('notifications');
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications);
          setNotifications(parsedNotifications);
          setUnreadCount(parsedNotifications.filter(notification => !notification.isRead).length);
        } else {
          // Use mock data if no localStorage data
          setNotifications(initialNotifications);
          setUnreadCount(initialNotifications.filter(notification => !notification.isRead).length);
          localStorage.setItem('notifications', JSON.stringify(initialNotifications));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications(initialNotifications);
        setUnreadCount(initialNotifications.filter(notification => !notification.isRead).length);
      }
    };
    
    // Load email preferences
    const loadEmailPreferences = () => {
      try {
        const storedPreferences = localStorage.getItem('emailPreferences');
        if (storedPreferences) {
          setEmailPreferences(JSON.parse(storedPreferences));
        } else {
          localStorage.setItem('emailPreferences', JSON.stringify(emailPreferences));
        }
      } catch (error) {
        console.error('Error loading email preferences:', error);
      }
    };
    
    loadNotifications();
    loadEmailPreferences();
  }, []);
  
  // Toggle notification panel
  const toggleNotifications = useCallback(() => {
    setIsNotificationOpen(prev => !prev);
  }, []);
  
  // Add a new notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: uuidv4(),
      isRead: false,
      date: new Date().toISOString(),
      ...notification
    };
    
    setNotifications(prev => {
      const updatedNotifications = [newNotification, ...prev];
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });
    
    setUnreadCount(prev => prev + 1);
    
    // Return notification ID for possible future reference
    return newNotification.id;
  }, []);
  
  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => {
      const updatedNotifications = prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      );
      
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updatedNotifications = prev.map(notification => ({
        ...notification,
        isRead: true
      }));
      
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });
    
    setUnreadCount(0);
  }, []);
  
  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notificationToDelete = prev.find(n => n.id === notificationId);
      const updatedNotifications = prev.filter(notification => notification.id !== notificationId);
      
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      // Update unread count if we're deleting an unread notification
      if (notificationToDelete && !notificationToDelete.isRead) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      
      return updatedNotifications;
    });
  }, []);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify([]));
  }, []);
  
  // Update email preferences
  const updateEmailPreferences = useCallback((preferences) => {
    setEmailPreferences(prev => {
      const updatedPreferences = { ...prev, ...preferences };
      localStorage.setItem('emailPreferences', JSON.stringify(updatedPreferences));
      return updatedPreferences;
    });
  }, []);
  
  // Subscribe to author updates
  const subscribeToAuthor = useCallback((authorName) => {
    // This would interact with a backend in a real app
    // For now, just simulate a new notification
    addNotification({
      type: 'system',
      title: 'Author Subscription',
      message: `You are now subscribed to updates from ${authorName}.`
    });
    
    return true;
  }, [addNotification]);
  
  // Send test email notification
  const sendTestEmailNotification = useCallback(() => {
    // In a real app, this would call an API to send an actual email
    // For demo, just simulate it with a confirmation notification
    addNotification({
      type: 'system',
      title: 'Test Email Sent',
      message: 'A test email notification has been sent to your registered email address.'
    });
    
    return true;
  }, [addNotification]);
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isNotificationOpen,
        emailPreferences,
        toggleNotifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        updateEmailPreferences,
        subscribeToAuthor,
        sendTestEmailNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 