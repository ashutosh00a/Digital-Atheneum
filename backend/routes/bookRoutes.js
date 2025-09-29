import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
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
  getRecommendedBooks
} from '../controllers/bookController.js';

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/genre/:genre', getBooksByGenre);
router.get('/author/:author', getBooksByAuthor);
router.get('/new-releases', getNewReleases);
router.get('/bestsellers', getBestsellers);
router.get('/:id', getBookById);

// Protected routes (admin only)
router.post('/', protect, createBook);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

// Protected routes
router.get('/recommended', protect, getRecommendedBooks);

export default router; 