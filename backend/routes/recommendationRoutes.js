import express from 'express';
import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';
import User from '../models/userModel.js';

const router = express.Router();

// @desc    Get book recommendations for a user
// @route   GET /api/recommendations
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  // For now, return some popular books as recommendations
  const books = await Book.find()
    .sort({ 'ratings.average': -1 })
    .limit(10)
    .select('title author description coverImage genre ratings');

  res.json({
    success: true,
    recommendations: books
  });
}));

export default router; 