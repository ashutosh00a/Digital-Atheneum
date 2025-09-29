import express from 'express';
import {
  getOverviewStats,
  getGenreStats,
  getUserStats,
  getReadingTrends,
  getVerificationStats,
} from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require admin access
router.use(protect, admin);

router.get('/overview', getOverviewStats);
router.get('/genres', getGenreStats);
router.get('/users', getUserStats);
router.get('/trends', getReadingTrends);
router.get('/verification', getVerificationStats);

export default router; 