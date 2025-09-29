import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Report from '../models/Report.js';
import Warning from '../models/Warning.js';
import ModerationSettings from '../models/ModerationSettings.js';

// @desc    Get moderation settings
// @route   GET /api/moderation/settings
// @access  Private/Admin
const getModerationSettings = asyncHandler(async (req, res) => {
  const settings = await ModerationSettings.findOne();
  res.json(settings);
});

// @desc    Update moderation settings
// @route   PUT /api/moderation/settings
// @access  Private/Admin
const updateModerationSettings = asyncHandler(async (req, res) => {
  const settings = await ModerationSettings.findOne();

  if (settings) {
    settings.autoModeration = {
      ...settings.autoModeration,
      ...req.body.autoModeration,
    };
    settings.reviewSettings = {
      ...settings.reviewSettings,
      ...req.body.reviewSettings,
    };
    settings.userSettings = {
      ...settings.userSettings,
      ...req.body.userSettings,
    };
    settings.notificationSettings = {
      ...settings.notificationSettings,
      ...req.body.notificationSettings,
    };

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } else {
    res.status(404);
    throw new Error('Moderation settings not found');
  }
});

// @desc    Get all reports
// @route   GET /api/moderation/reports
// @access  Private/Moderator
const getReports = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { reason: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const count = await Report.countDocuments({ ...keyword });
  const reports = await Report.find({ ...keyword })
    .populate('reporter', 'name email')
    .populate('reportedItem')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ reports, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get report by ID
// @route   GET /api/moderation/reports/:id
// @access  Private/Moderator
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('reporter', 'name email')
    .populate('reportedItem');

  if (report) {
    res.json(report);
  } else {
    res.status(404);
    throw new Error('Report not found');
  }
});

// @desc    Update report status
// @route   PUT /api/moderation/reports/:id
// @access  Private/Moderator
const updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (report) {
    report.status = req.body.status || report.status;
    report.resolution = req.body.resolution || report.resolution;
    report.resolvedBy = req.user._id;
    report.resolvedAt = Date.now();

    const updatedReport = await report.save();
    res.json(updatedReport);
  } else {
    res.status(404);
    throw new Error('Report not found');
  }
});

// @desc    Issue warning to user
// @route   POST /api/moderation/warnings
// @access  Private/Moderator
const issueWarning = asyncHandler(async (req, res) => {
  const { userId, reason, description, severity, expiresAt } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const warning = await Warning.create({
    user: userId,
    reason,
    description,
    severity,
    expiresAt,
  });

  res.status(201).json(warning);
});

// @desc    Get user warnings
// @route   GET /api/moderation/warnings/:userId
// @access  Private/Moderator
const getUserWarnings = asyncHandler(async (req, res) => {
  const warnings = await Warning.find({ user: req.params.userId })
    .sort({ createdAt: -1 });

  res.json(warnings);
});

// @desc    Suspend user
// @route   POST /api/moderation/suspend/:userId
// @access  Private/Admin
const suspendUser = asyncHandler(async (req, res) => {
  const { duration, reason } = req.body;

  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isSuspended = true;
  user.suspensionReason = reason;
  user.suspensionExpires = Date.now() + duration * 24 * 60 * 60 * 1000; // Convert days to milliseconds

  const updatedUser = await user.save();
  res.json(updatedUser);
});

// @desc    Ban user
// @route   POST /api/moderation/ban/:userId
// @access  Private/Admin
const banUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isBanned = true;
  user.banReason = reason;
  user.bannedAt = Date.now();

  const updatedUser = await user.save();
  res.json(updatedUser);
});

// @desc    Remove content
// @route   DELETE /api/moderation/content/:type/:id
// @access  Private/Moderator
const removeContent = asyncHandler(async (req, res) => {
  const { type, id } = req.params;

  let content;
  switch (type) {
    case 'book':
      content = await Book.findById(id);
      break;
    case 'review':
      content = await Review.findById(id);
      break;
    case 'comment':
      content = await Comment.findById(id);
      break;
    default:
      res.status(400);
      throw new Error('Invalid content type');
  }

  if (!content) {
    res.status(404);
    throw new Error('Content not found');
  }

  await content.deleteOne();
  res.json({ message: 'Content removed successfully' });
});

export {
  getModerationSettings,
  updateModerationSettings,
  getReports,
  getReportById,
  updateReport,
  issueWarning,
  getUserWarnings,
  suspendUser,
  banUser,
  removeContent,
}; 