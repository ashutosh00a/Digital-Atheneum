import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import BookCard from '../components/BookCard';
import Loader from '../components/Loader';
import Message from '../components/Message';

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('search') || '';

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Only include keyword parameter if there's a search query
        const url = searchQuery ? `/books?keyword=${searchQuery}&limit=50` : '/books?limit=50';
        const { data } = await api.get(url);
        
        // Handle direct array response
        if (data && Array.isArray(data)) {
          setBooks(data);
        } else {
          setBooks([]);
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        setBooks([]);
        setError(error.response?.data?.message || 'Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery]);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome to Digital Athenaeum</h1>
        <p className="lead">Discover and read your favorite books online</p>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {searchQuery && (
            <h2 className="mb-4">
              Search Results for "{searchQuery}"
            </h2>
          )}

          {!books || books.length === 0 ? (
            <Message>No books found. Try adjusting your search criteria.</Message>
          ) : (
            <Row>
              {books.map((book) => (
                <Col key={book._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                  <BookCard book={book} />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage; 