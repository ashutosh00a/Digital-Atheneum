import express from 'express';
import { 
  getUserChat, 
  addMessage, 
  clearChat, 
  getAllChats, 
  getUserChatAdmin,
  addAdminMessage
} from '../controllers/chatController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.route('/')
  .get(protect, getUserChat)
  .delete(protect, clearChat);

router.post('/message', protect, addMessage);

// Admin routes
router.get('/all', protect, admin, getAllChats);
router.get('/user/:userId', protect, admin, getUserChatAdmin);
router.post('/user/:userId/message', protect, admin, addAdminMessage);

export default router; 