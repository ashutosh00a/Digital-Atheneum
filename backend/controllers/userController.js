import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import Book from '../models/Book.js';
import path from 'path';
import fs from 'fs';
import { uploadToS3, deleteFromS3, getS3Url } from '../utils/s3.js';
import jwt from 'jsonwebtoken';

// Add this password validation helper function
const validatePasswordComplexity = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Log the incoming request data (excluding password)
    console.log('Registration attempt:', { name, email });

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide all required fields: name, email, and password');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    // Validate password complexity
    const passwordValidation = validatePasswordComplexity(password);
    if (!passwordValidation.isValid) {
      res.status(400);
      throw new Error(passwordValidation.errors.join('. '));
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', { email });
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    // Create new user with explicit error handling
    let user;
    try {
      user = await User.create({
        name,
        email,
        password,
      });
      console.log('User created successfully:', { userId: user._id, email: user.email });
    } catch (createError) {
      console.error('Error creating user:', createError);
      res.status(500);
      throw new Error('Failed to create user. Please try again.');
    }

    // Verify the user was created and has an ID
    if (!user || !user._id) {
      console.error('User creation failed - no user or ID returned');
      res.status(500);
      throw new Error('Failed to create user. Please try again.');
    }

    // Generate tokens
    const tokens = generateToken(user._id);
    
    // Set cookies for tokens
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    // Send response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt:', { email });

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('Login failed - user not found:', { email });
      res.status(404);
      throw new Error('User not found. Please check your email or register if you are a new user.');
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Login failed - invalid password:', { email });
      res.status(401);
      throw new Error('Invalid password. Please try again.');
    }

    // Generate tokens
    const tokens = generateToken(user._id);
    
    console.log('Login successful:', { userId: user._id, email: user.email });
    
    // Set cookies for tokens
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(error.statusCode || 401);
    throw new Error(error.message || 'Login failed. Please try again.');
  }
});

// @desc    Refresh access token
// @route   POST /api/users/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error('Refresh token is required');
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    // Generate new tokens
    const tokens = generateToken(user._id);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      ...tokens
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401);
    throw new Error('Invalid refresh token');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update basic info
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    // Update address if provided
    if (req.body.address) {
      const addressData = typeof req.body.address === 'string' 
        ? JSON.parse(req.body.address) 
        : req.body.address;

      user.address = {
        street: addressData.street || '',
        city: addressData.city || '',
        state: addressData.state || '',
        country: addressData.country || '',
        zipCode: addressData.zipCode || '',
      };
    }
    
    // Handle profile picture upload
    if (req.file) {
      try {
        // Delete old profile picture from S3 if it exists and is not the default placeholder
        if (user.profilePicture && !user.profilePicture.includes('placeholder.com')) {
          await deleteFromS3(user.profilePicture);
        }
        
        // Upload new profile picture to S3
        const fileUrl = await uploadToS3(req.file, 'profile-pictures');
        user.profilePicture = fileUrl;
      } catch (error) {
        console.error('Error handling profile picture:', error);
        throw new Error('Failed to update profile picture');
      }
    }

    const updatedUser = await user.save();

    // Generate new token
    const token = generateToken(updatedUser._id);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      profilePicture: updatedUser.profilePicture,
      address: updatedUser.address,
      token,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user email preferences
// @route   PUT /api/users/preferences/email
// @access  Private
const updateUserEmailPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.preferences.emailNotifications = req.body.emailNotifications !== undefined 
      ? req.body.emailNotifications 
      : user.preferences.emailNotifications;

    const updatedUser = await user.save();

    res.json({
      preferences: updatedUser.preferences,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user reading preferences (theme, font size)
// @route   PUT /api/users/preferences/reading
// @access  Private
const updateUserReadingPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.preferences.theme = req.body.theme || user.preferences.theme;
    user.preferences.fontSize = req.body.fontSize || user.preferences.fontSize;

    const updatedUser = await user.save();

    res.json({
      preferences: updatedUser.preferences,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add book to favorites
// @route   POST /api/users/favorites
// @access  Private
const addFavoriteBook = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.favoriteBooks.includes(bookId)) {
    res.status(400);
    throw new Error('Book already in favorites');
  }

  user.favoriteBooks.push(bookId);
  await user.save();

  res.status(201).json({
    favoriteBooks: user.favoriteBooks,
  });
});

// @desc    Remove book from favorites
// @route   DELETE /api/users/favorites/:bookId
// @access  Private
const removeFavoriteBook = asyncHandler(async (req, res) => {
  const bookId = req.params.bookId;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.favoriteBooks.includes(bookId)) {
    res.status(400);
    throw new Error('Book not in favorites');
  }

  user.favoriteBooks = user.favoriteBooks.filter(
    (id) => id.toString() !== bookId
  );
  await user.save();

  res.json({
    favoriteBooks: user.favoriteBooks,
  });
});

// @desc    Add bookmark
// @route   POST /api/users/bookmarks
// @access  Private
const addBookmark = asyncHandler(async (req, res) => {
  const { bookId, page, note } = req.body;
  
  if (!bookId || !page) {
    res.status(400);
    throw new Error('Book ID and page are required');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if bookmark already exists at that page
  const existingBookmark = user.bookmarks.find(
    (bookmark) => bookmark.book.toString() === bookId && bookmark.page === page
  );

  if (existingBookmark) {
    // Update existing bookmark
    existingBookmark.note = note;
    existingBookmark.createdAt = Date.now();
  } else {
    // Add new bookmark
    user.bookmarks.push({
      book: bookId,
      page,
      note,
    });
  }

  await user.save();

  res.status(201).json({
    bookmarks: user.bookmarks,
  });
});

// @desc    Update bookmark
// @route   PUT /api/users/bookmarks/:bookmarkId
// @access  Private
const updateBookmark = asyncHandler(async (req, res) => {
  const { page, note } = req.body;
  const bookmarkId = req.params.bookmarkId;
  
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const bookmark = user.bookmarks.id(bookmarkId);

  if (!bookmark) {
    res.status(404);
    throw new Error('Bookmark not found');
  }

  bookmark.page = page || bookmark.page;
  bookmark.note = note !== undefined ? note : bookmark.note;
  bookmark.createdAt = Date.now();

  await user.save();

  res.json({
    bookmarks: user.bookmarks,
  });
});

// @desc    Remove bookmark
// @route   DELETE /api/users/bookmarks/:bookmarkId
// @access  Private
const removeBookmark = asyncHandler(async (req, res) => {
  const bookmarkId = req.params.bookmarkId;
  
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.bookmarks = user.bookmarks.filter(
    (bookmark) => bookmark._id.toString() !== bookmarkId
  );

  await user.save();

  res.json({
    bookmarks: user.bookmarks,
  });
});

// @desc    Update reading progress
// @route   PUT /api/users/reading-progress
// @access  Private
const updateReadingProgress = asyncHandler(async (req, res) => {
  const { bookId, progress, lastReadPage } = req.body;
  
  if (!bookId) {
    res.status(400);
    throw new Error('Book ID is required');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Find existing progress or create new entry
  const progressEntry = user.readingProgress.find(
    (entry) => entry.book.toString() === bookId
  );

  if (progressEntry) {
    progressEntry.progress = progress || progressEntry.progress;
    progressEntry.lastReadPage = lastReadPage || progressEntry.lastReadPage;
    progressEntry.lastReadAt = Date.now();
  } else {
    user.readingProgress.push({
      book: bookId,
      progress: progress || 0,
      lastReadPage: lastReadPage || 0,
    });
  }

  await user.save();

  res.json({
    readingProgress: user.readingProgress,
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user preferences
// @route   GET /api/users/preferences
// @access  Private
const getUserPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('preferences');
  res.json(user.preferences);
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updateUserPreferences = asyncHandler(async (req, res) => {
  const { emailNotifications, theme, language, readingHistory } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.preferences = {
    emailNotifications: emailNotifications ?? user.preferences.emailNotifications,
    theme: theme ?? user.preferences.theme,
    language: language ?? user.preferences.language,
    readingHistory: readingHistory ?? user.preferences.readingHistory,
  };

  const updatedUser = await user.save();
  res.json(updatedUser.preferences);
});

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Forgot password functionality' });
});

// @desc    Reset password
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Reset password functionality' });
});

// @desc    Verify email
// @route   GET /api/users/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Email verification functionality' });
});

// @desc    Resend verification email
// @route   POST /api/users/verify/resend
// @access  Public
const resendVerificationEmail = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Resend verification email functionality' });
});

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Update password functionality' });
});

// @desc    Toggle user status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Toggle user status functionality' });
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Get user stats functionality' });
});

// @desc    Get user reading history
// @route   GET /api/users/reading-history
// @access  Private
const getUserReadingHistory = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Get user reading history functionality' });
});

// @desc    Update user reading progress
// @route   PUT /api/users/reading-history
// @access  Private
const updateUserReadingProgress = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Update user reading progress functionality' });
});

// @desc    Get user bookmarks
// @route   GET /api/users/bookmarks
// @access  Private
const getUserBookmarks = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Get user bookmarks functionality' });
});

// @desc    Toggle bookmark
// @route   POST /api/users/bookmarks
// @access  Private
const toggleBookmark = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Toggle bookmark functionality' });
});

// @desc    Get user notification settings
// @route   GET /api/users/notification-settings
// @access  Private
const getUserNotificationSettings = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Get user notification settings functionality' });
});

// @desc    Update notification settings
// @route   PUT /api/users/notification-settings
// @access  Private
const updateNotificationSettings = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Update notification settings functionality' });
});

// @desc    Get signed URL for profile picture upload
// @route   POST /api/users/profile/picture/upload-url
// @access  Private
const getProfilePictureUploadUrl = async (req, res) => {
  try {
    const { fileType } = req.body;
    
    if (!fileType) {
      res.status(400);
      throw new Error('File type is required');
    }

    const file = {
      originalname: `profile-${Date.now()}.${fileType.split('/')[1]}`,
      mimetype: fileType,
    };

    const uploadData = await uploadToS3(file);
    
    res.json({
      uploadUrl: uploadData.url,
      key: uploadData.key,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile picture
// @route   PUT /api/users/profile/picture
// @access  Private
const updateProfilePicture = async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      res.status(400);
      throw new Error('Image key is required');
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Delete old profile picture if exists
    if (user.profilePicture?.key) {
      await deleteFromS3(user.profilePicture.key);
    }

    // Update user's profile picture
    user.profilePicture = {
      key,
      url: getS3Url(key),
    };

    await user.save();

    res.json({
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getUserPreferences,
  updateUserPreferences,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  updatePassword,
  toggleUserStatus,
  getUserStats,
  getUserReadingHistory,
  updateUserReadingProgress,
  getUserBookmarks,
  toggleBookmark,
  getUserNotificationSettings,
  updateNotificationSettings,
  refreshToken,
  getProfilePictureUploadUrl,
  updateProfilePicture
}; 