import asyncHandler from 'express-async-handler';
import Comment from '../models/commentModel.js';
import Book from '../models/Book.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { bookId, content, parentId } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  const comment = await Comment.create({
    user: req.user._id,
    book: bookId,
    content,
    parent: parentId,
  });

  // Create notification for book owner if comment is not from the owner
  if (book.user.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: book.user,
      sender: req.user._id,
      type: 'new_comment',
      title: 'New Comment',
      message: `${req.user.name} commented on your book "${book.title}"`,
      book: bookId,
      comment: comment._id,
    });
  }

  // If this is a reply, notify the parent comment's author
  if (parentId) {
    const parentComment = await Comment.findById(parentId);
    if (parentComment && parentComment.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: parentComment.user,
        sender: req.user._id,
        type: 'comment_reply',
        title: 'Comment Reply',
        message: `${req.user.name} replied to your comment`,
        book: bookId,
        comment: comment._id,
      });
    }
  }

  res.status(201).json(comment);
});

// @desc    Get comments for a book
// @route   GET /api/comments/book/:bookId
// @access  Public
const getBookComments = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Comment.countDocuments({ book: req.params.bookId });
  const comments = await Comment.find({ book: req.params.bookId })
    .populate('user', 'name profileImage')
    .populate({
      path: 'replies',
      populate: {
        path: 'user',
        select: 'name profileImage',
      },
    })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ comments, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get replies for a comment
// @route   GET /api/comments/:commentId/replies
// @access  Public
const getCommentReplies = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Comment.countDocuments({ parent: req.params.commentId });
  const replies = await Comment.find({ parent: req.params.commentId })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ replies, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get comments for a review
// @route   GET /api/comments/review/:reviewId
// @access  Public
const getReviewComments = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Comment.countDocuments({ review: req.params.reviewId });
  const comments = await Comment.find({ review: req.params.reviewId })
    .populate('user', 'name profileImage')
    .populate({
      path: 'replies',
      populate: {
        path: 'user',
        select: 'name profileImage',
      },
    })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ comments, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get user's comments
// @route   GET /api/comments/user
// @access  Private
const getUserComments = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Comment.countDocuments({ user: req.user._id });
  const comments = await Comment.find({ user: req.user._id })
    .populate('book', 'title coverImage')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ comments, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this comment');
  }

  comment.content = req.body.content || comment.content;
  comment.isEdited = true;

  const updatedComment = await comment.save();
  res.json(updatedComment);
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this comment');
  }

  // If it's a parent comment, delete all replies
  if (!comment.parent) {
    await Comment.deleteMany({ parent: comment._id });
  }

  await comment.deleteOne();
  res.json({ message: 'Comment removed' });
});

// @desc    Like/Unlike a comment
// @route   POST /api/comments/:id/like
// @access  Private
const likeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const alreadyLiked = comment.likes.includes(req.user._id);

  if (alreadyLiked) {
    comment.likes = comment.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
  } else {
    comment.likes.push(req.user._id);

    // Create notification for comment author if not the same user
    if (comment.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: comment.user,
        sender: req.user._id,
        type: 'comment_like',
        title: 'Comment Liked',
        message: `${req.user.name} liked your comment`,
        book: comment.book,
        comment: comment._id,
      });
    }
  }

  await comment.save();
  res.json(comment);
});

export {
  createComment,
  getBookComments,
  getCommentReplies,
  getReviewComments,
  getUserComments,
  updateComment,
  deleteComment,
  likeComment,
}; 