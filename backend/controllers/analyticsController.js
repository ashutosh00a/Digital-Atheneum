import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';
import User from '../models/userModel.js';

// @desc    Get overall statistics
// @route   GET /api/analytics/overview
// @access  Private/Admin
const getOverviewStats = asyncHandler(async (req, res) => {
  const totalBooks = await Book.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalReviews = await Book.aggregate([
    { $unwind: '$reviews' },
    { $count: 'total' },
  ]);
  const totalReads = await Book.aggregate([
    { $group: { _id: null, total: { $sum: '$readCount' } } },
  ]);

  const recentBooks = await Book.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title author createdAt');

  const popularBooks = await Book.find()
    .sort({ readCount: -1 })
    .limit(5)
    .select('title author readCount');

  const topRatedBooks = await Book.find()
    .sort({ rating: -1 })
    .limit(5)
    .select('title author rating');

  res.json({
    totalBooks,
    totalUsers,
    totalReviews: totalReviews[0]?.total || 0,
    totalReads: totalReads[0]?.total || 0,
    recentBooks,
    popularBooks,
    topRatedBooks,
  });
});

// @desc    Get genre statistics
// @route   GET /api/analytics/genres
// @access  Private/Admin
const getGenreStats = asyncHandler(async (req, res) => {
  const genreStats = await Book.aggregate([
    { $unwind: '$genre' },
    {
      $group: {
        _id: '$genre',
        count: { $sum: 1 },
        totalReads: { $sum: '$readCount' },
        avgRating: { $avg: '$rating' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json(genreStats);
});

// @desc    Get user activity statistics
// @route   GET /api/analytics/users
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const userStats = await User.aggregate([
    {
      $lookup: {
        from: 'books',
        localField: 'readingHistory.book',
        foreignField: '_id',
        as: 'readBooks',
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        role: 1,
        totalBooksRead: { $size: '$readingHistory' },
        totalReviews: { $size: '$reviews' },
        lastActive: { $max: '$readingHistory.lastRead' },
      },
    },
    { $sort: { totalBooksRead: -1 } },
    { $limit: 10 },
  ]);

  res.json(userStats);
});

// @desc    Get reading trends
// @route   GET /api/analytics/trends
// @access  Private/Admin
const getReadingTrends = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;
  const now = new Date();
  let startDate;

  switch (period) {
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default: // week
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  const readingTrends = await Book.aggregate([
    {
      $match: {
        'readingHistory.lastRead': { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$readingHistory.lastRead',
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(readingTrends);
});

// @desc    Get verification statistics
// @route   GET /api/analytics/verification
// @access  Private/Admin
const getVerificationStats = asyncHandler(async (req, res) => {
  const verificationStats = await Book.aggregate([
    {
      $group: {
        _id: '$verificationStatus',
        count: { $sum: 1 },
        avgProcessingTime: {
          $avg: {
            $subtract: ['$verifiedAt', '$createdAt'],
          },
        },
      },
    },
  ]);

  const recentVerifications = await Book.find({
    verifiedAt: { $exists: true },
  })
    .sort({ verifiedAt: -1 })
    .limit(10)
    .populate('user', 'name email')
    .populate('verifiedBy', 'name email');

  res.json({
    stats: verificationStats,
    recentVerifications,
  });
});

export {
  getOverviewStats,
  getGenreStats,
  getUserStats,
  getReadingTrends,
  getVerificationStats,
}; 