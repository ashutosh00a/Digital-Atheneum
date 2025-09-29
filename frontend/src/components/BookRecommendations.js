import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveBookInteraction } from '../actions/bookActions';

const BookRecommendations = ({ type = 'hybrid', bookId = null }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userInfo) return;

      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userInfo._id,
            book_id: bookId,
            n_recommendations: 6,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        setError('Failed to load recommendations');
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userInfo, bookId]);

  const handleBookClick = async (book) => {
    if (userInfo) {
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

  if (!userInfo) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">
        {type === 'hybrid' ? 'Recommended for You' :
         type === 'content' ? 'Similar Books' :
         'Popular in Your Network'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading recommendations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendations.map((book) => (
            <div
              key={book.id}
              onClick={() => handleBookClick(book)}
              className="cursor-pointer transform transition-transform hover:scale-105"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-book-cover.jpg';
                  }}
                />
                <div className="p-3">
                  <h3 className="text-sm font-semibold mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-1">{book.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookRecommendations; 