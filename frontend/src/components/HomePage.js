import React, { useState, useEffect } from 'react';
import { searchBooks } from '../utils/openLibraryApi';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveBookInteraction } from '../actions/bookActions';
import BookRecommendations from './BookRecommendations';

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  // Fetch popular books on component mount
  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const results = await searchBooks('popular books');
        setBooks(results);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch books. Please try again later.');
        setLoading(false);
      }
    };

    fetchPopularBooks();
  }, []);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchBooks(searchQuery);
      setBooks(results);
    } catch (err) {
      setError('Failed to search books. Please try again later.');
    }
    setLoading(false);
  };

  // Handle book click
  const handleBookClick = async (book) => {
    if (userInfo) {
      // Save interaction to database
      await dispatch(saveBookInteraction({
        bookId: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        interactionType: 'view'
      }));
    }
    navigate(`/book/${book.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for books..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading books...</p>
        </div>
      ) : (
        <>
          {/* Popular Books Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Popular Books</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  className="cursor-pointer transform transition-transform hover:scale-105"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-book-cover.jpg';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{book.title}</h3>
                      <p className="text-gray-600 mb-2">{book.author}</p>
                      {book.firstPublishYear && (
                        <p className="text-sm text-gray-500">Published: {book.firstPublishYear}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommendations Section */}
          {userInfo && (
            <>
              <BookRecommendations type="hybrid" />
              <BookRecommendations type="content" />
              <BookRecommendations type="collaborative" />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage; 