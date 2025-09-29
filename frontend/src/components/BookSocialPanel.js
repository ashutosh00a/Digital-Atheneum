import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Card, Dropdown } from 'react-bootstrap';
import ThemeContext from '../utils/ThemeContext';
import AuthContext from '../utils/AuthContext';
import SocialContext from '../utils/SocialContext';

const BookSocialPanel = ({ bookId, bookTitle }) => {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AuthContext);
  const { 
    getCommentsForBook, 
    addComment, 
    addReply,
    deleteComment,
    deleteReply,
    likeComment,
    likeReply,
    reportComment,
    shareBook,
    hasUserLikedComment,
    hasUserReportedComment
  } = useContext(SocialContext);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Load comments when component mounts
  useEffect(() => {
    const loadComments = async () => {
      try {
        const bookComments = await getCommentsForBook(bookId);
        setComments(bookComments);
        setLoading(false);
      } catch (error) {
        console.error('Error loading comments:', error);
        setLoading(false);
      }
    };
    
    loadComments();
  }, [bookId, getCommentsForBook]);
  
  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const comment = await addComment(bookId, newComment);
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  // Handle reply submission
  const handleReplySubmit = async (commentId) => {
    if (!replyText[commentId]?.trim()) return;
    
    try {
      const updatedComments = await addReply(bookId, commentId, replyText[commentId]);
      setComments(updatedComments);
      setReplyText({ ...replyText, [commentId]: '' });
      setShowReplyForm({ ...showReplyForm, [commentId]: false });
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };
  
  // Toggle reply form visibility
  const toggleReplyForm = (commentId) => {
    setShowReplyForm({ 
      ...showReplyForm, 
      [commentId]: !showReplyForm[commentId] 
    });
  };
  
  // Handle comment like
  const handleLike = async (commentId) => {
    try {
      const updatedComments = await likeComment(bookId, commentId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };
  
  // Handle reply like
  const handleReplyLike = async (commentId, replyId) => {
    try {
      const updatedComments = await likeReply(bookId, commentId, replyId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };
  
  // Handle comment delete
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const updatedComments = await deleteComment(bookId, commentId);
        setComments(updatedComments);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };
  
  // Handle reply delete
  const handleDeleteReply = async (commentId, replyId) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      try {
        const updatedComments = await deleteReply(bookId, commentId, replyId);
        setComments(updatedComments);
      } catch (error) {
        console.error('Error deleting reply:', error);
      }
    }
  };
  
  // Handle report comment
  const handleReportComment = async (commentId) => {
    try {
      const updatedComments = await reportComment(bookId, commentId);
      setComments(updatedComments);
      alert('Comment reported. Thank you for helping maintain our community standards.');
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };
  
  // Handle share
  const handleShare = async (platform) => {
    try {
      await shareBook(bookId, platform, bookTitle);
      alert(`Book shared on ${platform}!`);
    } catch (error) {
      console.error('Error sharing book:', error);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleString('en-US', options);
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (loading) {
    return <div className="text-center my-4">Loading comments...</div>;
  }
  
  return (
    <div className={`book-social-panel ${theme === 'dark' ? 'dark-theme' : ''}`}>
      {/* Share buttons */}
      <div className="share-buttons mb-4">
        <h5 className="mb-3">Share this book</h5>
        <div className="d-flex">
          <Button 
            variant="outline-primary" 
            className="me-2" 
            onClick={() => handleShare('facebook')}
          >
            <i className="fab fa-facebook-f me-2"></i>Facebook
          </Button>
          <Button 
            variant="outline-info" 
            className="me-2" 
            onClick={() => handleShare('twitter')}
          >
            <i className="fab fa-twitter me-2"></i>Twitter
          </Button>
          <Button 
            variant="outline-success" 
            onClick={() => handleShare('whatsapp')}
          >
            <i className="fab fa-whatsapp me-2"></i>WhatsApp
          </Button>
        </div>
      </div>
      
      {/* Comment form */}
      <h5 className="mb-3">Discussion ({comments.length} Comments)</h5>
      
      {currentUser ? (
        <Form onSubmit={handleCommentSubmit} className="mb-4">
          <Form.Group controlId="commentText">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={`${theme === 'dark' ? 'bg-dark text-light' : ''}`}
            />
          </Form.Group>
          <div className="d-flex justify-content-end mt-2">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </div>
        </Form>
      ) : (
        <Card className={`p-3 mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
          <p className="mb-2">Sign in to join the discussion.</p>
          <Button 
            variant="outline-primary" 
            href="/login" 
            size="sm"
          >
            Sign In
          </Button>
        </Card>
      )}
      
      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="comments-list">
          {comments.map(comment => (
            <Card 
              key={comment.id} 
              className={`mb-3 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}
            >
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div className="d-flex align-items-center mb-2">
                    <div 
                      className="avatar me-2"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: theme === 'dark' ? '#444' : '#e9e9e9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {comment.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="mb-0">{comment.user.name}</h6>
                      <small className={`${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
                        {formatDate(comment.createdAt)}
                      </small>
                    </div>
                  </div>
                  
                  <Dropdown align="end">
                    <Dropdown.Toggle 
                      variant={theme === 'dark' ? 'dark' : 'light'} 
                      id={`comment-dropdown-${comment.id}`}
                      size="sm"
                      className="no-arrow"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        boxShadow: 'none'
                      }}
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className={theme === 'dark' ? 'dropdown-menu-dark' : ''}>
                      {currentUser && comment.user.id === currentUser.userId && (
                        <Dropdown.Item onClick={() => handleDeleteComment(comment.id)}>
                          <i className="fas fa-trash-alt me-2 text-danger"></i> Delete
                        </Dropdown.Item>
                      )}
                      {currentUser && comment.user.id !== currentUser.userId && (
                        <Dropdown.Item 
                          onClick={() => handleReportComment(comment.id)}
                          disabled={hasUserReportedComment(comment.id)}
                        >
                          <i className="fas fa-flag me-2 text-warning"></i> 
                          {hasUserReportedComment(comment.id) ? 'Reported' : 'Report'}
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                
                <Card.Text className="mt-2">{comment.text}</Card.Text>
                
                <div className="comment-actions d-flex align-items-center mt-3">
                  <Button 
                    variant="link" 
                    className={`p-0 me-3 ${hasUserLikedComment(comment.id) ? 'text-primary' : theme === 'dark' ? 'text-light' : 'text-dark'}`} 
                    onClick={() => handleLike(comment.id)}
                  >
                    <i className={`${hasUserLikedComment(comment.id) ? 'fas' : 'far'} fa-thumbs-up me-1`}></i>
                    {comment.likes > 0 && comment.likes}
                  </Button>
                  
                  <Button 
                    variant="link" 
                    className={`p-0 ${theme === 'dark' ? 'text-light' : 'text-dark'}`} 
                    onClick={() => toggleReplyForm(comment.id)}
                  >
                    <i className="far fa-comment-alt me-1"></i>
                    Reply {comment.replies.length > 0 && `(${comment.replies.length})`}
                  </Button>
                </div>
                
                {/* Reply form */}
                {showReplyForm[comment.id] && currentUser && (
                  <div className="reply-form mt-3">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Write a reply..."
                      value={replyText[comment.id] || ''}
                      onChange={(e) => setReplyText({...replyText, [comment.id]: e.target.value})}
                      className={`${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                    />
                    <div className="d-flex justify-content-end mt-2">
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => toggleReplyForm(comment.id)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={!replyText[comment.id]?.trim()}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="replies mt-3">
                    {comment.replies.map(reply => (
                      <div 
                        key={reply.id} 
                        className={`reply p-2 mt-2 rounded ${theme === 'dark' ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}
                      >
                        <div className="d-flex justify-content-between">
                          <div className="d-flex align-items-center">
                            <div 
                              className="avatar-sm me-2"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: theme === 'dark' ? '#555' : '#e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {reply.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h6 className="mb-0 fs-6">{reply.user.name}</h6>
                              <small className={`${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
                                {formatDate(reply.createdAt)}
                              </small>
                            </div>
                          </div>
                          
                          {currentUser && reply.user.id === currentUser.userId && (
                            <Button 
                              variant="link" 
                              className="p-0 text-muted" 
                              onClick={() => handleDeleteReply(comment.id, reply.id)}
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          )}
                        </div>
                        
                        <p className="mt-1 mb-1">{reply.text}</p>
                        
                        <Button 
                          variant="link" 
                          className={`p-0 ${hasUserLikedComment(reply.id) ? 'text-primary' : theme === 'dark' ? 'text-light' : 'text-dark'}`} 
                          size="sm"
                          onClick={() => handleReplyLike(comment.id, reply.id)}
                        >
                          <i className={`${hasUserLikedComment(reply.id) ? 'fas' : 'far'} fa-thumbs-up me-1`}></i>
                          {reply.likes > 0 && reply.likes}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center my-4 py-4">
          <i className="far fa-comment-alt mb-3" style={{ fontSize: '2rem' }}></i>
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default BookSocialPanel; 