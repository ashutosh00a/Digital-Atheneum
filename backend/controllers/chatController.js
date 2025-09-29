import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

// @desc    Get user's chat
// @route   GET /api/chat
// @access  Private
const getUserChat = asyncHandler(async (req, res) => {
  // Find or create chat for user
  let chat = await Chat.findOne({ user: req.user._id });

  if (!chat) {
    chat = await Chat.create({
      user: req.user._id,
      messages: [
        {
          sender: 'system',
          content: 'Welcome to BookClub support! How can we help you today?',
        },
      ],
    });
  }

  // Update user's lastActive
  await User.findByIdAndUpdate(
    req.user._id,
    { lastActive: Date.now() },
    { new: true }
  );

  res.json(chat);
});

// @desc    Add a message to the chat
// @route   POST /api/chat/message
// @access  Private
const addMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Message content is required');
  }

  // Find or create chat
  let chat = await Chat.findOne({ user: req.user._id });

  if (!chat) {
    chat = await Chat.create({
      user: req.user._id,
      messages: [
        {
          sender: 'system',
          content: 'Welcome to BookClub support! How can we help you today?',
        },
      ],
    });
  }

  // Add user message
  chat.messages.push({
    sender: 'user',
    content,
  });

  // Save chat
  await chat.save();

  // Generate auto-response (in a real app, this would be more sophisticated)
  const autoResponses = [
    'Thanks for your message! Our team will get back to you soon.',
    'We appreciate your inquiry and will respond shortly.',
    'Your message has been received. A team member will review it soon.',
    'Thanks for reaching out! We typically respond within 24 hours.',
  ];

  const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];

  // Add system auto-response
  chat.messages.push({
    sender: 'system',
    content: randomResponse,
  });

  // Save with auto-response
  await chat.save();

  res.status(201).json(chat);
});

// @desc    Clear chat history
// @route   DELETE /api/chat
// @access  Private
const clearChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ user: req.user._id });

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Reset messages with a welcome message
  chat.messages = [
    {
      sender: 'system',
      content: 'Chat history has been cleared. How can we help you today?',
    },
  ];

  await chat.save();

  res.json({ message: 'Chat cleared', chat });
});

// @desc    Get all chats (admin only)
// @route   GET /api/chat/all
// @access  Private/Admin
const getAllChats = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Chat.countDocuments({});
  
  const chats = await Chat.find({})
    .populate('user', 'name email profileImage')
    .sort({ lastUpdated: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    chats,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  });
});

// @desc    Get user chat for admin
// @route   GET /api/chat/user/:userId
// @access  Private/Admin
const getUserChatAdmin = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ user: req.params.userId }).populate(
    'user',
    'name email profileImage'
  );

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  res.json(chat);
});

// @desc    Add admin message to user chat
// @route   POST /api/chat/user/:userId/message
// @access  Private/Admin
const addAdminMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Message content is required');
  }

  // Find the user's chat
  let chat = await Chat.findOne({ user: req.params.userId });

  if (!chat) {
    // Create a new chat if it doesn't exist
    chat = await Chat.create({
      user: req.params.userId,
      messages: [
        {
          sender: 'system',
          content: 'Welcome to BookClub support! How can we help you today?',
        },
      ],
    });
  }

  // Add admin message
  chat.messages.push({
    sender: 'admin',
    content,
  });

  // Mark all user messages as read
  chat.messages.forEach((message) => {
    if (message.sender === 'user' && !message.read) {
      message.read = true;
    }
  });

  await chat.save();

  // Create notification for user about new message
  await Notification.create({
    recipient: req.params.userId,
    sender: req.user._id,
    type: 'system',
    title: 'New Message from Support',
    message: 'You have a new message from the BookClub support team',
    link: '/account/support',
  });

  res.status(201).json(chat);
});

// @desc    Get or create chat between two users
// @route   POST /api/chat
// @access  Private
const accessChat = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Access or create chat' });
});

// @desc    Get all chats for a user
// @route   GET /api/chat
// @access  Private
const fetchChats = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Get all user chats' });
});

// @desc    Get chat by ID
// @route   GET /api/chat/:id
// @access  Private
const getChatById = asyncHandler(async (req, res) => {
  res.status(200).json({ message: `Get chat ${req.params.id}` });
});

// @desc    Create a group chat
// @route   POST /api/chat/group
// @access  Private
const createGroupChat = asyncHandler(async (req, res) => {
  res.status(201).json({ message: 'Create group chat' });
});

// @desc    Rename group chat
// @route   PUT /api/chat/group/:id
// @access  Private
const renameGroupChat = asyncHandler(async (req, res) => {
  res.status(200).json({ message: `Rename group chat ${req.params.id}` });
});

// @desc    Add user to group chat
// @route   PUT /api/chat/group/:id/add
// @access  Private
const addToGroupChat = asyncHandler(async (req, res) => {
  res.status(200).json({ message: `Add user to group chat ${req.params.id}` });
});

// @desc    Remove user from group chat
// @route   PUT /api/chat/group/:id/remove
// @access  Private
const removeFromGroupChat = asyncHandler(async (req, res) => {
  res.status(200).json({ message: `Remove user from group chat ${req.params.id}` });
});

// @desc    Send message
// @route   POST /api/chat/message
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  res.status(201).json({ message: 'Send message' });
});

// @desc    Get all messages for a chat
// @route   GET /api/chat/:chatId/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  res.status(200).json({ message: `Get messages for chat ${req.params.chatId}` });
});

export {
  getUserChat,
  addMessage,
  clearChat,
  getAllChats,
  getUserChatAdmin,
  addAdminMessage,
  accessChat,
  fetchChats,
  getChatById,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
  sendMessage,
  getMessages,
}; 