import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';
import User from '../models/userModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = file.mimetype === 'application/pdf' ? 'uploads/pdfs' : 'uploads/covers';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and WebP files are allowed.'));
    }
  }
}).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    console.log('Fetching books...');
    const { keyword, limit = 50 } = req.query;
    const query = keyword
      ? {
          $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { author: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
          ],
        }
      : {};

    console.log('Query:', query);
    const books = await Book.find(query).limit(Number(limit));
    console.log('Found books:', books.length);

    const formattedBooks = books.map((book) => ({
      id: book._id,
      title: book.title,
      author: book.author,
      description: book.description,
      genre: book.genre,
      coverImage: book.coverImage || '/images/default-cover.jpg',
      pdfUrl: book.pdfUrl,
      totalPages: book.pageCount,
      isbn: book.isbn,
      publishedDate: book.publicationYear,
      publisher: book.publisher,
      language: book.language,
      featured: book.features?.isBestseller || false,
      isFree: true,
      tags: book.tags,
      ratings: book.ratings,
      availability: book.availability,
      stock: book.stock,
      reviews: book.reviews,
      relatedBooks: book.relatedBooks,
      updatedAt: book.updatedAt,
    }));

    console.log('Formatted books:', formattedBooks.length);
    res.json(formattedBooks);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = asyncHandler(async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
});

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
const searchBooks = asyncHandler(async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const books = await Book.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.json({ books });
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ message: 'Error searching books', error: error.message });
  }
});

// @desc    Get books by genre
// @route   GET /api/books/genre/:genre
// @access  Public
const getBooksByGenre = asyncHandler(async (req, res) => {
  try {
    const books = await Book.find({ genre: req.params.genre })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ books });
  } catch (error) {
    console.error('Error fetching books by genre:', error);
    res.status(500).json({ message: 'Error fetching books by genre', error: error.message });
  }
});

// @desc    Get books by author
// @route   GET /api/books/author/:author
// @access  Public
const getBooksByAuthor = asyncHandler(async (req, res) => {
  try {
    const books = await Book.find({ author: req.params.author })
      .sort({ publicationYear: -1 });

    res.json({ books });
  } catch (error) {
    console.error('Error fetching books by author:', error);
    res.status(500).json({ message: 'Error fetching books by author', error: error.message });
  }
});

// @desc    Get new releases
// @route   GET /api/books/new-releases
// @access  Public
const getNewReleases = asyncHandler(async (req, res) => {
  try {
    const books = await Book.find({ 'features.isNewRelease': true })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ books });
  } catch (error) {
    console.error('Error fetching new releases:', error);
    res.status(500).json({ message: 'Error fetching new releases', error: error.message });
  }
});

// @desc    Get bestsellers
// @route   GET /api/books/bestsellers
// @access  Public
const getBestsellers = asyncHandler(async (req, res) => {
  try {
    const books = await Book.find({ 'features.isBestseller': true })
      .sort({ 'ratings.average': -1 })
      .limit(10);

    res.json({ books });
  } catch (error) {
    console.error('Error fetching bestsellers:', error);
    res.status(500).json({ message: 'Error fetching bestsellers', error: error.message });
  }
});

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
const createBook = asyncHandler(async (req, res) => {
  try {
    const book = new Book(req.body);
    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Error creating book', error: error.message });
  }
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    Object.assign(book, req.body);
    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    await book.deleteOne();
    res.json({ message: 'Book removed' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
});

// @desc    Upload book files (PDF and cover image)
// @route   POST /api/books/upload
// @access  Private/Admin
const uploadBookFiles = asyncHandler(async (req, res) => {
  if (!req.files) {
    res.status(400);
    throw new Error('No files uploaded');
  }

  const { pdf, coverImage } = req.files;
  const fileUrls = {};

  if (pdf && pdf[0]) {
    fileUrls.pdfUrl = `/uploads/${pdf[0].filename}`;
  }

  if (coverImage && coverImage[0]) {
    fileUrls.coverImage = `/uploads/${coverImage[0].filename}`;
  }

  res.json(fileUrls);
});

// @desc    Get top rated books
// @route   GET /api/books/top
// @access  Public
const getTopBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ rating: { $gt: 0 } })
    .sort({ rating: -1 })
    .limit(10)
    .populate('reviews');

  res.json(books);
});

// @desc    Get featured books
// @route   GET /api/books/featured
// @access  Public
const getFeaturedBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ featured: true })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('reviews');

  res.json(books);
});

// @desc    Get new arrivals
// @route   GET /api/books/new
// @access  Public
const getNewArrivals = asyncHandler(async (req, res) => {
  const books = await Book.find()
    .sort({ publishedDate: -1 })
    .limit(10)
    .populate('reviews');

  res.json(books);
});

// @desc    Get all book genres
// @route   GET /api/books/genres
// @access  Public
const getBookGenres = asyncHandler(async (req, res) => {
  const books = await Book.find();
  const genres = [...new Set(books.flatMap(book => book.genre))];
  res.json(genres);
});

// @desc    Get ML-based book recommendations
// @route   GET /api/books/recommended
// @access  Private
const getRecommendedBooks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('readingHistory.book');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's reading history and preferences
  const userHistory = user.readingHistory.map(history => ({
    bookId: history.book._id,
    genres: history.book.genre,
    rating: history.book.rating,
    readCount: history.readCount
  }));

  // Get genres from user's reading history with weights
  const genreWeights = {};
  userHistory.forEach(history => {
    history.genres.forEach(genre => {
      genreWeights[genre] = (genreWeights[genre] || 0) + 
        (history.rating * history.readCount);
    });
  });

  // Find books in the same genres that the user hasn't read
  const readBookIds = user.readingHistory.map(history => history.book._id);
  
  const recommendedBooks = await Book.find({
    _id: { $nin: readBookIds },
    genre: { $in: Object.keys(genreWeights) }
  })
    .sort({ rating: -1 })
    .limit(10)
    .populate('reviews');

  // Sort recommendations based on genre weights and book ratings
  const sortedRecommendations = recommendedBooks.sort((a, b) => {
    const aScore = a.genre.reduce((sum, genre) => sum + (genreWeights[genre] || 0), 0) * a.rating;
    const bScore = b.genre.reduce((sum, genre) => sum + (genreWeights[genre] || 0), 0) * b.rating;
    return bScore - aScore;
  });

  res.json(sortedRecommendations);
});

// @desc    Verify a book
// @route   PUT /api/books/:id/verify
// @access  Private/Admin
const verifyBook = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (status === 'approved') {
    book.verificationStatus = 'approved';
    book.verifiedBy = req.user._id;
    book.verifiedAt = Date.now();
    book.rejectionReason = undefined;
  } else if (status === 'rejected') {
    if (!rejectionReason) {
      res.status(400);
      throw new Error('Rejection reason is required');
    }
    book.verificationStatus = 'rejected';
    book.rejectionReason = rejectionReason;
    book.verifiedBy = req.user._id;
    book.verifiedAt = Date.now();
  } else {
    res.status(400);
    throw new Error('Invalid verification status');
  }

  const updatedBook = await book.save();
  res.json(updatedBook);
});

// @desc    Get pending books
// @route   GET /api/books/pending
// @access  Private/Admin
const getPendingBooks = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const count = await Book.countDocuments({ verificationStatus: 'pending' });
  
  const books = await Book.find({ verificationStatus: 'pending' })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate('user', 'name email');

  res.json({
    books,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  });
});

export {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  getBooksByGenre,
  getBooksByAuthor,
  getNewReleases,
  getBestsellers,
  uploadBookFiles,
  getTopBooks,
  getFeaturedBooks,
  getNewArrivals,
  getBookGenres,
  getRecommendedBooks,
  verifyBook,
  getPendingBooks
}; 