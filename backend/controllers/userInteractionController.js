import asyncHandler from 'express-async-handler';
import UserInteraction from '../models/userInteractionModel.js';

// @desc    Save user interaction with a book
// @route   POST /api/interactions
// @access  Private
const saveInteraction = asyncHandler(async (req, res) => {
  const { bookId, title, author, coverUrl, interactionType, metadata } = req.body;

  // Check if interaction already exists
  const existingInteraction = await UserInteraction.findOne({
    user: req.user._id,
    bookId,
    interactionType,
    status: 'active',
  });

  if (existingInteraction) {
    // Update existing interaction
    existingInteraction.metadata = {
      ...existingInteraction.metadata,
      ...metadata,
    };
    if (interactionType === 'read') {
      existingInteraction.metadata.lastReadAt = Date.now();
    }
    const updatedInteraction = await existingInteraction.save();
    res.json(updatedInteraction);
  } else {
    // Create new interaction
    const interaction = await UserInteraction.create({
      user: req.user._id,
      bookId,
      title,
      author,
      coverUrl,
      interactionType,
      metadata,
    });
    res.status(201).json(interaction);
  }
});

// @desc    Get user's interactions
// @route   GET /api/interactions
// @access  Private
const getUserInteractions = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const query = { user: req.user._id };

  if (type) query.interactionType = type;
  if (status) query.status = status;

  const interactions = await UserInteraction.find(query)
    .sort({ createdAt: -1 });

  res.json(interactions);
});

// @desc    Update interaction status
// @route   PUT /api/interactions/:id
// @access  Private
const updateInteractionStatus = asyncHandler(async (req, res) => {
  const interaction = await UserInteraction.findById(req.params.id);

  if (!interaction) {
    res.status(404);
    throw new Error('Interaction not found');
  }

  if (interaction.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this interaction');
  }

  interaction.status = req.body.status || interaction.status;
  interaction.metadata = {
    ...interaction.metadata,
    ...req.body.metadata,
  };

  const updatedInteraction = await interaction.save();
  res.json(updatedInteraction);
});

// @desc    Get user's reading history
// @route   GET /api/interactions/history
// @access  Private
const getReadingHistory = asyncHandler(async (req, res) => {
  const interactions = await UserInteraction.find({
    user: req.user._id,
    interactionType: 'read',
    status: 'active',
  })
    .sort({ 'metadata.lastReadAt': -1 })
    .limit(20);

  res.json(interactions);
});

// @desc    Get user's favorite books
// @route   GET /api/interactions/favorites
// @access  Private
const getFavoriteBooks = asyncHandler(async (req, res) => {
  const interactions = await UserInteraction.find({
    user: req.user._id,
    interactionType: 'favorite',
    status: 'active',
  })
    .sort({ createdAt: -1 });

  res.json(interactions);
});

export {
  saveInteraction,
  getUserInteractions,
  updateInteractionStatus,
  getReadingHistory,
  getFavoriteBooks,
}; 