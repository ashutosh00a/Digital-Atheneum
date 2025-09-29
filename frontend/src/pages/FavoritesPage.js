import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ThemeContext from '../utils/ThemeContext';
import FavoritesContext from '../utils/FavoritesContext';

const FavoritesPage = () => {
  const { favorites, loading, removeFromFavorites } = useContext(FavoritesContext);
  const [error, setError] = React.useState(null);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;
  
  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate('/login');
      return;
    }
  }, [navigate, userInfo]);
  
  const handleRemoveFromFavorites = async (bookId) => {
    try {
      removeFromFavorites(bookId);
    } catch (error) {
      setError('Failed to remove book from favorites');
    }
  };
  
  return (
    <div className={`favorites-page ${theme === 'dark' ? 'favorites-dark' : 'favorites-light'}`}>
      <div className="page-header">
        <h1>My Favorite Books</h1>
        <p className="lead">Your personal collection of favorite books</p>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : favorites.length === 0 ? (
        <div className="text-center my-5">
          <i className="fas fa-heart fa-4x text-muted mb-3"></i>
          <h3>You don't have any favorite books yet</h3>
          <p className="lead">Explore our library and add books to your favorites</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/')}
            className="mt-3"
          >
            Browse Books
          </Button>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <Card className="favorites-stats p-3">
                <h5><i className="fas fa-heart me-2 text-danger"></i> You have {favorites.length} favorite books</h5>
              </Card>
            </Col>
          </Row>
          
          <Row>
            {favorites.map(book => (
              <Col lg={3} md={6} sm={12} key={book._id} className="mb-4">
                <Card className="h-100 favorite-book-card">
                  <div className="favorite-book-actions">
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="remove-favorite"
                      onClick={() => handleRemoveFromFavorites(book._id)}
                    >
                      <i className="fas fa-heart-broken"></i>
                    </Button>
                  </div>
                  <Card.Img 
                    variant="top" 
                    src={book.coverImage} 
                    className="book-cover" 
                  />
                  <Card.Body>
                    <Card.Title as="h5">{book.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {book.author}
                    </Card.Subtitle>
                    <div className="d-flex align-items-center mb-2">
                      <div className="rating me-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span key={index}>
                            <i className={
                              index + 1 <= Math.floor(book.rating)
                                ? 'fas fa-star'
                                : index + 0.5 < book.rating
                                ? 'fas fa-star-half-alt'
                                : 'far fa-star'
                            }></i>
                          </span>
                        ))}
                      </div>
                      <span>{book.rating}</span>
                    </div>
                    <Badge bg="secondary" className="mb-2">
                      {book.category}
                    </Badge>
                    <Card.Text className="book-description-short mt-2">
                      {book.description ? book.description.substring(0, 100) + '...' : 'No description available.'}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-between">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate(`/book/${book._id}`)}
                    >
                      Details
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => navigate(`/book/${book._id}/read`)}
                    >
                      <i className="fas fa-book-reader me-1"></i> Read
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default FavoritesPage;
