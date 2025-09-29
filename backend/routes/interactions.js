import express from 'express';
import {
  saveInteraction,
  getUserInteractions,
  updateInteractionStatus,
  getReadingHistory,
  getFavoriteBooks,
} from '../controllers/userInteractionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, saveInteraction)
  .get(protect, getUserInteractions);

router.route('/:id')
  .put(protect, updateInteractionStatus);

router.get('/history', protect, getReadingHistory);
router.get('/favorites', protect, getFavoriteBooks);

export default router; 