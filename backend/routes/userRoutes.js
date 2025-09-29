import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getUserPreferences,
  updateUserPreferences,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  updatePassword,
  toggleUserStatus,
  getUserStats,
  getUserReadingHistory,
  updateUserReadingProgress,
  getUserBookmarks,
  toggleBookmark,
  getUserNotificationSettings,
  updateNotificationSettings,
  refreshToken,
  getProfilePictureUploadUrl,
  updateProfilePicture
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify/:token', verifyEmail);
router.post('/verify/resend', resendVerificationEmail);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profilePicture'), updateUserProfile);

router.route('/password')
  .put(protect, updatePassword);

router.route('/preferences')
  .get(protect, getUserPreferences)
  .put(protect, updateUserPreferences);

router.route('/reading-history')
  .get(protect, getUserReadingHistory)
  .put(protect, updateUserReadingProgress);

router.route('/bookmarks')
  .get(protect, getUserBookmarks)
  .post(protect, toggleBookmark);

router.route('/notification-settings')
  .get(protect, getUserNotificationSettings)
  .put(protect, updateNotificationSettings);

router
  .route('/profile/picture/upload-url')
  .post(protect, getProfilePictureUploadUrl);

router
  .route('/profile/picture')
  .put(protect, updateProfilePicture);

// Admin routes
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.route('/:id/status')
  .put(protect, admin, toggleUserStatus);

router.get('/stats', protect, admin, getUserStats);

export default router; 