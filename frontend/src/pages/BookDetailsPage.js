import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Button, Card, Form, Tabs, Tab } from 'react-bootstrap';
import api from '../utils/api';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ThemeContext from '../utils/ThemeContext';
import FavoritesContext from '../utils/FavoritesContext';
import SocialContext from '../utils/SocialContext';
import BookmarkContext from '../utils/BookmarkContext';
import BookSocialPanel from '../components/BookSocialPanel';
import BookmarkPanel from '../components/BookmarkPanel';
import BookCard from '../components/BookCard';

const BookDetailsPage = () => {
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showBookmarkPanel, setShowBookmarkPanel] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { addToFavorites, removeFromFavorites, isInFavorites } = useContext(FavoritesContext);
  const { getBookmarkCount } = useContext(BookmarkContext);
  
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;
  
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        
        // Get book details
        const { data: bookData } = await api.get(`/books/${id}`);
        setBook(bookData);
        
        // Get related books
        if (bookData.relatedBooks && bookData.relatedBooks.length > 0) {
          const relatedBooksData = await Promise.all(
            bookData.relatedBooks.map(bookId => 
              api.get(`/books/${bookId}`)
            )
          );
          setRelatedBooks(relatedBooksData.map(res => res.data));
        }
        
        // Get ML-based recommendations if user is logged in
        if (userInfo?.token) {
          try {
            const { data: recommendedData } = await api.get('/books/recommended');
            // Filter out the current book from recommendations
            const filteredRecommendations = recommendedData.filter(rec => rec._id !== id);
            setRecommendedBooks(filteredRecommendations);
          } catch (error) {
            console.error('Error fetching recommendations:', error);
            setRecommendedBooks([]);
          }
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load book details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [id]); // Remove userInfo from dependencies to prevent loop
  
  const submitReviewHandler = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      alert('Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await api.post(
        `/books/${id}/reviews`,
        { rating, comment },
        config
      );
      
      setBook(data);
      setRating(0);
      setComment('');
      setSubmitting(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review.');
      setSubmitting(false);
    }
  };
  
  const handleReadBook = () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    navigate(`/book/${id}/read`);
  };
  
  const handleDownload = () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    if (book && book.pdfUrl) {
      window.open(book.pdfUrl, '_blank');
    }
  };
  
  const toggleFavorite = async () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    try {
      if (isInFavorites(id)) {
        await removeFromFavorites(id);
      } else {
        if (book) {
          const success = await addToFavorites({
            _id: book._id,
            title: book.title,
            author: book.author,
            coverImage: book.coverImage,
            rating: book.rating,
            numReviews: book.numReviews,
            genre: book.genre
          });
          
          if (!success) {
            console.error('Failed to add book to favorites');
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  
  const handleBookmarkPanelShow = () => {
    setShowBookmarkPanel(true);
  };
  
  const handleBookmarkPanelClose = () => {
    setShowBookmarkPanel(false);
  };
  
  const isFavorite = isInFavorites(id);
  const bookmarkCount = book ? getBookmarkCount(id) : 0;
  
  return (
    <div>
      <Link to="/" className="btn btn-light my-3">
        <i className="fas fa-arrow-left"></i> Back to Books
      </Link>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : book ? (
        <>
          <Row>
            <Col md={4}>
              <img 
                src={book.coverImage?.url || 'https://via.placeholder.com/300x450?text=No+Cover'} 
                alt={book.title} 
                className="img-fluid" 
              />
              
              <div className="d-grid gap-2 mt-3">
                {userInfo ? (
                  <>
                    <Button 
                      variant="primary" 
                      onClick={handleReadBook}
                      disabled={!book.pdfUrl}
                    >
                      <i className="fas fa-book-reader"></i> Read Book
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={handleDownload}
                      disabled={!book.pdfUrl}
                    >
                      <i className="fas fa-download"></i> Download
                    </Button>
                    <Button 
                      variant={isFavorite ? 'danger' : 'outline-danger'}
                      onClick={toggleFavorite}
                    >
                      <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i> {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Button>
                    <Button 
                      variant="outline-info" 
                      onClick={handleBookmarkPanelShow}
                    >
                      <i className="fas fa-bookmark me-1"></i> 
                      Reading Tools
                      {bookmarkCount > 0 && (
                        <span className="badge bg-info ms-2">{bookmarkCount}</span>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/login')}
                  >
                    <i className="fas fa-sign-in-alt"></i> Login to Read
                  </Button>
                )}
              </div>
            </Col>
            
            <Col md={8}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h2>{book.title}</h2>
                  <p className="text-muted">By {book.author}</p>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <Rating value={book.rating} text={`${book.numReviews} reviews`} />
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <h4>Genres</h4>
                  <div>
                    {book.genre.map((genre, index) => (
                      <span key={index} className="badge bg-secondary me-1">
                        {genre}
                      </span>
                    ))}
                  </div>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <h4>Description</h4>
                  <p className="book-description">{book.description}</p>
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
          
          <Row className="mt-4">
            <Col md={12}>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
                id="book-details-tabs"
              >
                <Tab eventKey="details" title="Details">
                  <div className="additional-details p-3">
                    <Row>
                      <Col md={6}>
                        <h4>Additional Information</h4>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <strong>ISBN:</strong> {book.isbn || 'N/A'}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Publication Year:</strong> {new Date(book.publicationYear).toLocaleDateString()}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Publisher:</strong> {book.publisher || 'N/A'}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Language:</strong> {book.language}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Pages:</strong> {book.pageCount}
                          </ListGroup.Item>
                        </ListGroup>
                      </Col>
                      <Col md={6}>
                        <h4>Tags</h4>
                        <div>
                          {book.tags && book.tags.map((tag, index) => (
                            <span key={index} className="badge bg-info me-1 mb-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Tab>
                
                <Tab eventKey="reviews" title="Reviews">
                  <div className="reviews p-3">
                    <ListGroup variant="flush">
                      {book.reviews.map((review) => (
                        <ListGroup.Item key={review._id}>
                          <strong>{review.name}</strong>
                          <Rating value={review.rating} />
                          <p>{review.comment}</p>
                          <small className="text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </ListGroup.Item>
                      ))}
                      <ListGroup.Item>
                        <h4>Write a Review</h4>
                        {userInfo ? (
                          <Form onSubmit={submitReviewHandler}>
                            <Form.Group controlId="rating" className="mb-3">
                              <Form.Label>Rating</Form.Label>
                              <Form.Select
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                              >
                                <option value="">Select...</option>
                                <option value="1">1 - Poor</option>
                                <option value="2">2 - Fair</option>
                                <option value="3">3 - Good</option>
                                <option value="4">4 - Very Good</option>
                                <option value="5">5 - Excellent</option>
                              </Form.Select>
                            </Form.Group>
                            <Form.Group controlId="comment" className="mb-3">
                              <Form.Label>Comment</Form.Label>
                              <Form.Control
                                as="textarea"
                                row="3"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                              ></Form.Control>
                            </Form.Group>
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={submitting}
                            >
                              Submit
                            </Button>
                          </Form>
                        ) : (
                          <Message>
                            Please <Link to="/login">sign in</Link> to write a review
                          </Message>
                        )}
                      </ListGroup.Item>
                    </ListGroup>
                  </div>
                </Tab>
                
                <Tab eventKey="related" title="Related Books">
                  <div className="related-books p-3">
                    <Row>
                      {relatedBooks.map((book) => (
                        <Col key={book._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                          <BookCard book={book} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Tab>

                {userInfo && recommendedBooks.length > 0 && (
                  <Tab eventKey="recommended" title="Recommended for You">
                    <div className="recommended-books p-3">
                      <h4>Based on Your Reading History</h4>
                      <Row>
                        {recommendedBooks.map((book) => (
                          <Col key={book._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                            <BookCard book={book} />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Tab>
                )}
              </Tabs>
            </Col>
          </Row>
          
          {/* Bookmark Panel */}
          <BookmarkPanel
            show={showBookmarkPanel}
            onHide={handleBookmarkPanelClose}
            bookId={id}
          />
          
          {/* Social Panel */}
          <BookSocialPanel book={book} />
        </>
      ) : null}
    </div>
  );
};

export default BookDetailsPage; 