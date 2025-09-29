import express from 'express';
import {
  getReports,
  createReport,
  updateReport,
  deleteReport,
  getWarnings,
  createWarning,
  updateWarning,
  deleteWarning,
  getModerationSettings,
  updateModerationSettings
} from '../controllers/moderationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Report routes
router.route('/reports')
  .get(protect, admin, getReports)
  .post(protect, createReport);

router.route('/reports/:id')
  .put(protect, admin, updateReport)
  .delete(protect, admin, deleteReport);

// Warning routes
router.route('/warnings')
  .get(protect, admin, getWarnings)
  .post(protect, admin, createWarning);

router.route('/warnings/:id')
  .put(protect, admin, updateWarning)
  .delete(protect, admin, deleteWarning);

// Moderation settings routes
router.route('/settings')
  .get(protect, admin, getModerationSettings)
  .put(protect, admin, updateModerationSettings);

export default router; 