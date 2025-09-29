import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AuthContext from './AuthContext';

// Create social context
const SocialContext = createContext();

// Mock comments data
const initialComments = {
  '1': [
    {
      id: 'c1',
      bookId: '1',
      userId: 'user1',
      userName: 'John Doe',
      userImage: 'https://via.placeholder.com/40',
      content: 'One of the greatest classics of all time. The symbolism is incredible.',
      likes: 15,
      date: '2023-05-20T12:30:00Z',
      replies: [
        {
          id: 'r1',
          userId: 'user2',
          userName: 'Jane Smith',
          userImage: 'https://via.placeholder.com/40',
          content: 'I agree! The green light is such a powerful symbol.',
          likes: 7,
          date: '2023-05-20T14:45:00Z'
        },
        {
          id: 'r2',
          userId: 'user3',
          userName: 'Mike Johnson',
          userImage: 'https://via.placeholder.com/40',
          content: 'What did you think about the ending though?',
          likes: 3,
          date: '2023-05-21T09:15:00Z'
        }
      ]
    },
    {
      id: 'c2',
      bookId: '1',
      userId: 'user4',
      userName: 'Sarah Williams',
      userImage: 'https://via.placeholder.com/40',
      content: 'I had to read this in high school and hated it, but reading it again as an adult gave me a whole new appreciation.',
      likes: 22,
      date: '2023-05-25T16:20:00Z',
      replies: []
    }
  ],
  '2': [
    {
      id: 'c3',
      bookId: '2',
      userId: 'user5',
      userName: 'Robert Brown',
      userImage: 'https://via.placeholder.com/40',
      content: 'A powerful examination of racial injustice. Still relevant today.',
      likes: 30,
      date: '2023-05-18T11:10:00Z',
      replies: [
        {
          id: 'r3',
          userId: 'user6',
          userName: 'Emily Johnson',
          userImage: 'https://via.placeholder.com/40',
          content: 'Absolutely, the themes are timeless.',
          likes: 12,
          date: '2023-05-18T13:05:00Z'
        }
      ]
    }
  ],
  '4': [
    {
      id: 'c4',
      bookId: '4',
      userId: 'user7',
      userName: 'David Wilson',
      userImage: 'https://via.placeholder.com/40',
      content: 'Orwell was ahead of his time. So many parallels to modern surveillance culture.',
      likes: 41,
      date: '2023-05-10T10:25:00Z',
      replies: []
    }
  ]
};

// Mock user reactions (likes, bookmarks, etc.)
const initialUserReactions = {
  comments: {
    liked: ['c1', 'c4'],
    reported: []
  },
  books: {
    liked: ['1', '4', '8'],
    shared: ['2', '4']
  }
};

export const SocialProvider = ({ children }) => {
  const [comments, setComments] = useState({});
  const [userReactions, setUserReactions] = useState(initialUserReactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { currentUser } = useContext(AuthContext);
  const isLoggedIn = !!currentUser;
  
  // Initialize social data on mount
  useEffect(() => {
    // Load comments
    const loadComments = () => {
      try {
        const storedComments = localStorage.getItem('comments');
        if (storedComments) {
          setComments(JSON.parse(storedComments));
        } else {
          setComments(initialComments);
          localStorage.setItem('comments', JSON.stringify(initialComments));
        }
      } catch (error) {
        console.error('Error loading comments:', error);
        setComments(initialComments);
      }
    };
    
    // Load user reactions
    const loadUserReactions = () => {
      try {
        const storedReactions = localStorage.getItem('userReactions');
        if (storedReactions) {
          setUserReactions(JSON.parse(storedReactions));
        } else {
          localStorage.setItem('userReactions', JSON.stringify(initialUserReactions));
        }
      } catch (error) {
        console.error('Error loading user reactions:', error);
      }
    };
    
    loadComments();
    loadUserReactions();
  }, []);
  
  // Get comments for a specific book
  const getBookComments = useCallback((bookId) => {
    return comments[bookId] || [];
  }, [comments]);
  
  // Add a new comment to a book
  const addComment = useCallback((bookId, content) => {
    if (!isLoggedIn) {
      setError('You must be logged in to comment');
      return null;
    }
    
    try {
      const newComment = {
        id: `c${uuidv4()}`,
        bookId,
        userId: currentUser?._id || 'anonymous',
        userName: currentUser?.name || 'Anonymous',
        userImage: currentUser?.profileImage || 'https://via.placeholder.com/40',
        content,
        likes: 0,
        date: new Date().toISOString(),
        replies: []
      };
      
      setComments(prev => {
        const updatedComments = { 
          ...prev,
          [bookId]: [newComment, ...(prev[bookId] || [])]
        };
        
        localStorage.setItem('comments', JSON.stringify(updatedComments));
        return updatedComments;
      });
      
      return newComment.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
      return null;
    }
  }, [currentUser, isLoggedIn]);
  
  // Add a reply to a comment
  const addReply = useCallback((bookId, commentId, content) => {
    if (!isLoggedIn) {
      setError('You must be logged in to reply');
      return null;
    }
    
    try {
      const newReply = {
        id: `r${uuidv4()}`,
        userId: currentUser?._id || 'anonymous',
        userName: currentUser?.name || 'Anonymous',
        userImage: currentUser?.profileImage || 'https://via.placeholder.com/40',
        content,
        likes: 0,
        date: new Date().toISOString()
      };
      
      setComments(prev => {
        const bookComments = [...(prev[bookId] || [])];
        const commentIndex = bookComments.findIndex(c => c.id === commentId);
        
        if (commentIndex >= 0) {
          const updatedComment = {
            ...bookComments[commentIndex],
            replies: [...bookComments[commentIndex].replies, newReply]
          };
          
          bookComments[commentIndex] = updatedComment;
          
          const updatedComments = {
            ...prev,
            [bookId]: bookComments
          };
          
          localStorage.setItem('comments', JSON.stringify(updatedComments));
          return updatedComments;
        }
        
        return prev;
      });
      
      return newReply.id;
    } catch (error) {
      console.error('Error adding reply:', error);
      setError('Failed to add reply');
      return null;
    }
  }, [currentUser, isLoggedIn]);
  
  // Delete a comment
  const deleteComment = useCallback((bookId, commentId) => {
    try {
      setComments(prev => {
        if (!prev[bookId]) return prev;
        
        const updatedBookComments = prev[bookId].filter(comment => comment.id !== commentId);
        const updatedComments = {
          ...prev,
          [bookId]: updatedBookComments
        };
        
        localStorage.setItem('comments', JSON.stringify(updatedComments));
        return updatedComments;
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
      return false;
    }
  }, []);
  
  // Delete a reply
  const deleteReply = useCallback((bookId, commentId, replyId) => {
    try {
      setComments(prev => {
        if (!prev[bookId]) return prev;
        
        const bookComments = [...prev[bookId]];
        const commentIndex = bookComments.findIndex(c => c.id === commentId);
        
        if (commentIndex >= 0) {
          const updatedComment = {
            ...bookComments[commentIndex],
            replies: bookComments[commentIndex].replies.filter(r => r.id !== replyId)
          };
          
          bookComments[commentIndex] = updatedComment;
          
          const updatedComments = {
            ...prev,
            [bookId]: bookComments
          };
          
          localStorage.setItem('comments', JSON.stringify(updatedComments));
          return updatedComments;
        }
        
        return prev;
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting reply:', error);
      setError('Failed to delete reply');
      return false;
    }
  }, []);
  
  // Like a comment
  const likeComment = useCallback((bookId, commentId) => {
    if (!isLoggedIn) {
      setError('You must be logged in to like a comment');
      return false;
    }
    
    try {
      // Check if user already liked this comment
      const hasLiked = userReactions.comments.liked.includes(commentId);
      
      // Update user reactions first
      setUserReactions(prev => {
        const updatedLiked = hasLiked
          ? prev.comments.liked.filter(id => id !== commentId)
          : [...prev.comments.liked, commentId];
        
        const updatedReactions = {
          ...prev,
          comments: {
            ...prev.comments,
            liked: updatedLiked
          }
        };
        
        localStorage.setItem('userReactions', JSON.stringify(updatedReactions));
        return updatedReactions;
      });
      
      // Update comment likes count
      setComments(prev => {
        if (!prev[bookId]) return prev;
        
        const bookComments = [...prev[bookId]];
        const commentIndex = bookComments.findIndex(c => c.id === commentId);
        
        if (commentIndex >= 0) {
          const likeChange = hasLiked ? -1 : 1;
          const updatedComment = {
            ...bookComments[commentIndex],
            likes: Math.max(0, bookComments[commentIndex].likes + likeChange)
          };
          
          bookComments[commentIndex] = updatedComment;
          
          const updatedComments = {
            ...prev,
            [bookId]: bookComments
          };
          
          localStorage.setItem('comments', JSON.stringify(updatedComments));
          return updatedComments;
        }
        
        return prev;
      });
      
      return true;
    } catch (error) {
      console.error('Error liking comment:', error);
      setError('Failed to like comment');
      return false;
    }
  }, [isLoggedIn, userReactions.comments.liked]);
  
  // Like a reply
  const likeReply = useCallback((bookId, commentId, replyId) => {
    if (!isLoggedIn) {
      setError('You must be logged in to like a reply');
      return false;
    }
    
    try {
      // Check if user already liked this reply
      const hasLiked = userReactions.comments.liked.includes(replyId);
      
      // Update user reactions first
      setUserReactions(prev => {
        const updatedLiked = hasLiked
          ? prev.comments.liked.filter(id => id !== replyId)
          : [...prev.comments.liked, replyId];
        
        const updatedReactions = {
          ...prev,
          comments: {
            ...prev.comments,
            liked: updatedLiked
          }
        };
        
        localStorage.setItem('userReactions', JSON.stringify(updatedReactions));
        return updatedReactions;
      });
      
      // Update reply likes count
      setComments(prev => {
        if (!prev[bookId]) return prev;
        
        const bookComments = [...prev[bookId]];
        const commentIndex = bookComments.findIndex(c => c.id === commentId);
        
        if (commentIndex >= 0) {
          const comment = bookComments[commentIndex];
          const replyIndex = comment.replies.findIndex(r => r.id === replyId);
          
          if (replyIndex >= 0) {
            const likeChange = hasLiked ? -1 : 1;
            const updatedReplies = [...comment.replies];
            updatedReplies[replyIndex] = {
              ...updatedReplies[replyIndex],
              likes: Math.max(0, updatedReplies[replyIndex].likes + likeChange)
            };
            
            const updatedComment = {
              ...comment,
              replies: updatedReplies
            };
            
            bookComments[commentIndex] = updatedComment;
            
            const updatedComments = {
              ...prev,
              [bookId]: bookComments
            };
            
            localStorage.setItem('comments', JSON.stringify(updatedComments));
            return updatedComments;
          }
        }
        
        return prev;
      });
      
      return true;
    } catch (error) {
      console.error('Error liking reply:', error);
      setError('Failed to like reply');
      return false;
    }
  }, [isLoggedIn, userReactions.comments.liked]);
  
  // Report a comment
  const reportComment = useCallback((bookId, commentId, reason) => {
    if (!isLoggedIn) {
      setError('You must be logged in to report a comment');
      return false;
    }
    
    try {
      setUserReactions(prev => {
        // Add to reported comments
        const updatedReactions = {
          ...prev,
          comments: {
            ...prev.comments,
            reported: [...prev.comments.reported, commentId]
          }
        };
        
        localStorage.setItem('userReactions', JSON.stringify(updatedReactions));
        return updatedReactions;
      });
      
      // In a real app, would send report to backend
      console.log(`Comment ${commentId} reported: ${reason}`);
      
      return true;
    } catch (error) {
      console.error('Error reporting comment:', error);
      setError('Failed to report comment');
      return false;
    }
  }, [isLoggedIn]);
  
  // Share a book via social media
  const shareBook = useCallback((bookId, platform) => {
    try {
      // Track that user shared this book
      setUserReactions(prev => {
        if (prev.books.shared.includes(bookId)) {
          return prev;
        }
        
        const updatedReactions = {
          ...prev,
          books: {
            ...prev.books,
            shared: [...prev.books.shared, bookId]
          }
        };
        
        localStorage.setItem('userReactions', JSON.stringify(updatedReactions));
        return updatedReactions;
      });
      
      // In a real app, would generate proper share links
      const shareUrls = {
        facebook: `https://facebook.com/sharer/sharer.php?u=${window.location.origin}/book/${bookId}`,
        twitter: `https://twitter.com/intent/tweet?url=${window.location.origin}/book/${bookId}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.origin}/book/${bookId}`
      };
      
      if (platform && shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sharing book:', error);
      setError('Failed to share book');
      return false;
    }
  }, []);
  
  // Get comment count for a book
  const getCommentCount = useCallback((bookId) => {
    const bookComments = comments[bookId] || [];
    let totalCount = bookComments.length;
    
    // Add reply counts
    bookComments.forEach(comment => {
      totalCount += comment.replies.length;
    });
    
    return totalCount;
  }, [comments]);
  
  // Check if user has liked a comment/reply
  const hasLiked = useCallback((id) => {
    return userReactions.comments.liked.includes(id);
  }, [userReactions.comments.liked]);
  
  // Check if user has reported a comment
  const hasReported = useCallback((id) => {
    return userReactions.comments.reported.includes(id);
  }, [userReactions.comments.reported]);
  
  return (
    <SocialContext.Provider
      value={{
        comments,
        userReactions,
        loading,
        error,
        getBookComments,
        addComment,
        addReply,
        deleteComment,
        deleteReply,
        likeComment,
        likeReply,
        reportComment,
        shareBook,
        getCommentCount,
        hasLiked,
        hasReported
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export default SocialContext; 