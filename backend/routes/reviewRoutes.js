import express from 'express';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  likeReview,
  getFeaturedReviews,
  getUserReviews,
  markReviewHelpful,
  markReviewNotHelpful
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/featured', getFeaturedReviews);
router.get('/:id', getReviewById);

// Protected routes
router.post('/', protect, createReview);
router.get('/user/reviews', protect, getUserReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.post('/:id/like', protect, likeReview);
router.post('/:id/helpful', protect, markReviewHelpful);
router.post('/:id/not-helpful', protect, markReviewNotHelpful);

export default router; 