import asyncHandler from 'express-async-handler';
import Review from '../models/reviewModel.js';
import Book from '../models/Book.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { bookId, rating, title, content } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check if user already reviewed this book
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    book: bookId,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Book already reviewed');
  }

  const review = await Review.create({
    user: req.user._id,
    book: bookId,
    rating,
    title,
    content,
  });

  // Create notification for book owner
  if (book.user.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: book.user,
      sender: req.user._id,
      type: 'new_review',
      title: 'New Review',
      message: `${req.user.name} reviewed your book "${book.title}"`,
      book: bookId,
      review: review._id,
    });
  }

  res.status(201).json(review);
});

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { content: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const count = await Review.countDocuments({ ...keyword });
  const reviews = await Review.find({ ...keyword })
    .populate('user', 'name profileImage')
    .populate('book', 'title coverImage')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ reviews, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name profileImage')
    .populate('book', 'title coverImage');

  if (review) {
    res.json(review);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this review');
  }

  review.rating = req.body.rating || review.rating;
  review.title = req.body.title || review.title;
  review.content = req.body.content || review.content;
  review.isEdited = true;

  const updatedReview = await review.save();
  res.json(updatedReview);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this review');
  }

  await review.deleteOne();
  res.json({ message: 'Review removed' });
});

// @desc    Like/Unlike a review
// @route   POST /api/reviews/:id/like
// @access  Private
const likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const alreadyLiked = review.likes.includes(req.user._id);

  if (alreadyLiked) {
    review.likes = review.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
  } else {
    review.likes.push(req.user._id);
  }

  await review.save();
  res.json(review);
});

// @desc    Get featured reviews
// @route   GET /api/reviews/featured
// @access  Public
const getFeaturedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ isFeatured: true })
    .populate('user', 'name profileImage')
    .populate('book', 'title coverImage')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(reviews);
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user/reviews
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate('book', 'title coverImage')
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markReviewHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.isHelpful += 1;
  await review.save();

  res.json(review);
});

// @desc    Mark review as not helpful
// @route   POST /api/reviews/:id/not-helpful
// @access  Private
const markReviewNotHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.isNotHelpful += 1;
  await review.save();

  res.json(review);
});

export {
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
}; 