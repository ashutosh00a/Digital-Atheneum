import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Get user notifications' });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  res.status(200).json({ message: `Mark notification ${req.params.id} as read` });
});

// @desc    Mark all notifications as read for a user
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Mark all notifications as read' });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  res.status(200).json({ message: `Delete notification ${req.params.id}` });
});

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Update notification preferences' });
});

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
const getNotificationPreferences = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Get notification preferences' });
});

// @desc    Create a notification (admin only)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = asyncHandler(async (req, res) => {
  const { user, title, message, type, bookId, reviewId, commentId, link } = req.body;

  const notification = new Notification({
    user,
    title,
    message,
    type: type || 'system',
    bookId,
    reviewId,
    commentId,
    link,
    date: Date.now(),
  });

  const createdNotification = await notification.save();
  res.status(201).json(createdNotification);
});

// @desc    Create a system notification for all users (admin only)
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, type, bookId, link } = req.body;

  // Get all user IDs
  const users = await User.find({ isActive: true }).select('_id');

  // Create notifications for all users
  const notifications = await Promise.all(
    users.map(async (user) => {
      return await Notification.create({
        user: user._id,
        title,
        message,
        type: type || 'system',
        bookId,
        link,
        date: Date.now(),
      });
    })
  );

  res.status(201).json({
    message: `Notification broadcast to ${notifications.length} users`,
    sample: notifications[0],
  });
});

export {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  updateNotificationPreferences,
  getNotificationPreferences,
  createNotification,
  broadcastNotification
}; 