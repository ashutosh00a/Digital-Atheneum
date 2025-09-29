import express from 'express';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  updateNotificationPreferences,
  getNotificationPreferences
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.route('/')
  .get(protect, getUserNotifications);

router.put('/:id/read', protect, markNotificationAsRead);
router.put('/read-all', protect, markAllNotificationsAsRead);
router.delete('/:id', protect, deleteNotification);

// Notification preferences
router.route('/preferences')
  .get(protect, getNotificationPreferences)
  .put(protect, updateNotificationPreferences);

export default router; 