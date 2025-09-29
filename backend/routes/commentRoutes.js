import express from 'express';
import { 
  createComment, 
  getReviewComments, 
  getBookComments, 
  getCommentReplies, 
  updateComment,
  deleteComment,
  likeComment,
  getUserComments
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/review/:reviewId', getReviewComments);
router.get('/book/:bookId', getBookComments);
router.get('/:commentId/replies', getCommentReplies);

// Protected routes
router.route('/')
  .post(protect, createComment);

router.route('/user')
  .get(protect, getUserComments);

router.route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

router.post('/:id/like', protect, likeComment);

export default router; 