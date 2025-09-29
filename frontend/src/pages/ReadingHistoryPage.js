import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Button, Table, Modal, Badge } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ThemeContext from '../utils/ThemeContext';
import ReadingHistoryContext from '../utils/ReadingHistoryContext';

const ReadingHistoryPage = () => {
  const [historyWithBooks, setHistoryWithBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { 
    readingHistory, 
    loading: historyLoading, 
    deleteHistoryEntry, 
    clearAllHistory,
    getHistoryWithBookDetails,
    loadReadingHistory
  } = useContext(ReadingHistoryContext);
  
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;
  
  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate('/login');
      return;
    }
  }, [userInfo, navigate]);

  // Process history data when it's available
  useEffect(() => {
    const processHistory = async () => {
      try {
        setLoading(true);
        if (!historyLoading) {
          // Get combined history and book data
          const historyData = getHistoryWithBookDetails();
          setHistoryWithBooks(historyData);
          setError(null);
        }
      } catch (err) {
        console.error('Error processing reading history:', err);
        setError('Failed to load reading history data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    processHistory();
  }, [historyLoading, getHistoryWithBookDetails]);
  
  const handleDeleteEntry = (bookId) => {
    setDeleteBookId(bookId);
    setShowDeleteModal(true);
  };
  
  const confirmDeleteEntry = () => {
    try {
      const success = deleteHistoryEntry(deleteBookId);
      if (success) {
        // Refresh history data
        loadReadingHistory();
      } else {
        setError('Failed to delete entry. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('An error occurred while deleting the entry.');
    } finally {
      setShowDeleteModal(false);
    }
  };
  
  const handleClearHistory = () => {
    setShowClearModal(true);
  };
  
  const confirmClearHistory = () => {
    try {
      const success = clearAllHistory();
      if (!success) {
        setError('Failed to clear history. Please try again.');
      }
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('An error occurred while clearing the history.');
    } finally {
      setShowClearModal(false);
    }
  };
  
  const handleContinueReading = (bookId) => {
    try {
      navigate(`/book/${bookId}/read`);
    } catch (err) {
      console.error('Error navigating to reader:', err);
      setError('Could not open the book reader. Please try again.');
    }
  };
  
  const handleViewBookDetails = (bookId) => {
    try {
      navigate(`/book/${bookId}`);
    } catch (err) {
      console.error('Error navigating to book details:', err);
      setError('Could not view book details. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };
  
  const getProgressColor = (percent) => {
    if (percent < 25) return 'danger';
    if (percent < 50) return 'warning';
    if (percent < 75) return 'info';
    if (percent < 100) return 'primary';
    return 'success';
  };
  
  // Sort history by last read date
  const sortedHistory = [...historyWithBooks].sort((a, b) => 
    new Date(b.lastReadAt) - new Date(a.lastReadAt)
  );
  
  // Calculate statistics
  const completedBooks = sortedHistory.filter(item => item.percentComplete === 100).length;
  const lastReadDate = sortedHistory.length > 0 ? sortedHistory[0].lastReadAt : null;
  
  return (
    <div className={`reading-history-page ${theme === 'dark' ? 'history-dark' : 'history-light'}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Reading History</h1>
          <p className="text-muted">Track your reading progress across all books</p>
        </div>
        
        <div className="d-flex">
          <Link to="/" className="btn btn-outline-primary me-2">
            <i className="fas fa-book me-1"></i> Browse Books
          </Link>
          {sortedHistory.length > 0 && (
            <Button variant="danger" onClick={handleClearHistory}>
              <i className="fas fa-trash-alt me-1"></i> Clear All History
            </Button>
          )}
        </div>
      </div>
      
      {error && <Message variant="danger">{error}</Message>}
      
      {loading || historyLoading ? (
        <Loader />
      ) : sortedHistory.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <i className="fas fa-book-reader fa-4x text-muted mb-3"></i>
            <h3>No Reading History</h3>
            <p className="lead">You haven't started reading any books yet</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/')}
              className="mt-3"
            >
              Browse Books
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Row className="mb-4">
              <Col md={4}>
                <Card className="bg-light">
                  <Card.Body>
                    <h5><i className="fas fa-book me-2"></i> Books Read</h5>
                    <h2>{sortedHistory.length}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="bg-light">
                  <Card.Body>
                    <h5><i className="fas fa-bookmark me-2"></i> Completed Books</h5>
                    <h2>{completedBooks}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="bg-light">
                  <Card.Body>
                    <h5><i className="fas fa-clock me-2"></i> Last Read</h5>
                    <h6>{lastReadDate ? formatDate(lastReadDate) : 'N/A'}</h6>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Started</th>
                  <th>Last Read</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((historyItem) => (
                  <tr key={historyItem.bookId}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={historyItem.book.coverImage.url} 
                          alt={historyItem.book.title} 
                          style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                          className="me-3"
                        />
                        <div>
                          <h6 className="mb-0">{historyItem.book.title}</h6>
                          <small className="text-muted">{historyItem.book.author}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {formatDate(historyItem.startedAt)}
                    </td>
                    <td>
                      {formatDate(historyItem.lastReadAt)}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress me-2" style={{ width: '100px', height: '10px' }}>
                          <div 
                            className={`progress-bar bg-${getProgressColor(historyItem.percentComplete)}`} 
                            role="progressbar" 
                            style={{ width: `${historyItem.percentComplete}%` }} 
                            aria-valuenow={historyItem.percentComplete} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <span>
                          {historyItem.progress} / {historyItem.pageCount} pages
                          <Badge 
                            bg={getProgressColor(historyItem.percentComplete)} 
                            className="ms-2"
                          >
                            {historyItem.percentComplete}%
                          </Badge>
                        </span>
                      </div>
                    </td>
                    <td>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleContinueReading(historyItem.bookId)}
                        title="Continue Reading"
                      >
                        <i className="fas fa-book-reader"></i>
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleViewBookDetails(historyItem.bookId)}
                        title="View Book Details"
                      >
                        <i className="fas fa-info-circle"></i>
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteEntry(historyItem.bookId)}
                        title="Delete History Entry"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Reading History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the reading history for this book? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteEntry}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Clear All Confirmation Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Clear All Reading History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to clear your entire reading history? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmClearHistory}>
            Clear All
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReadingHistoryPage; 