import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AuthContext from './AuthContext';

// Create bookmark context
const BookmarkContext = createContext();

// Export context as default export
export default BookmarkContext;

// Mock initial bookmarks data
const initialBookmarks = {
  '1': [
    {
      id: 'bm1',
      bookId: '1',
      userId: 'user1',
      page: 42,
      position: { x: 0.25, y: 0.65 },
      type: 'bookmark',
      color: 'blue',
      text: '',
      createdAt: '2023-05-15T14:30:00Z'
    },
    {
      id: 'hl1',
      bookId: '1',
      userId: 'user1',
      page: 56,
      position: { x: 0.3, y: 0.45 },
      type: 'highlight',
      color: 'yellow',
      text: 'Gatsby believed in the green light, the orgastic future that year by year recedes before us.',
      createdAt: '2023-05-16T10:15:00Z'
    },
    {
      id: 'nt1',
      bookId: '1',
      userId: 'user1',
      page: 56,
      position: { x: 0.3, y: 0.45 },
      type: 'note',
      color: 'green',
      text: 'This quote perfectly captures the theme of the American Dream.',
      createdAt: '2023-05-16T10:16:00Z',
      relatedTo: 'hl1'
    }
  ],
  '4': [
    {
      id: 'bm2',
      bookId: '4',
      userId: 'user1',
      page: 78,
      position: { x: 0.5, y: 0.35 },
      type: 'bookmark',
      color: 'red',
      text: '',
      createdAt: '2023-05-20T16:45:00Z'
    },
    {
      id: 'hl2',
      bookId: '4',
      userId: 'user1',
      page: 101,
      position: { x: 0.2, y: 0.4 },
      type: 'highlight',
      color: 'orange',
      text: 'Big Brother is watching you.',
      createdAt: '2023-05-21T09:30:00Z'
    }
  ]
};

// Export provider component as named export
export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  
  const { currentUser } = useContext(AuthContext);
  const isLoggedIn = !!currentUser;
  
  // Initialize bookmarks on mount
  useEffect(() => {
    const loadBookmarks = () => {
      try {
        setLoading(true);
        const storedBookmarks = localStorage.getItem('bookmarks');
        
        if (storedBookmarks) {
          setBookmarks(JSON.parse(storedBookmarks));
        } else {
          setBookmarks(initialBookmarks);
          localStorage.setItem('bookmarks', JSON.stringify(initialBookmarks));
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        setError('Failed to load bookmarks');
        setBookmarks(initialBookmarks);
      } finally {
        setLoading(false);
      }
    };
    
    loadBookmarks();
  }, []);
  
  // Get bookmarks for a specific book
  const getBookBookmarks = useCallback((bookId) => {
    return bookmarks[bookId] || [];
  }, [bookmarks]);
  
  // Add a bookmark
  const addBookmark = useCallback((bookId, page, position) => {
    if (!isLoggedIn) {
      setError('You must be logged in to add bookmarks');
      return null;
    }
    
    try {
      const newBookmark = {
        id: `bm${uuidv4()}`,
        bookId,
        userId: currentUser?._id || 'anonymous',
        page,
        position,
        type: 'bookmark',
        color: 'blue',
        text: '',
        createdAt: new Date().toISOString()
      };
      
      setBookmarks(prev => {
        const updatedBookmarks = {
          ...prev,
          [bookId]: [...(prev[bookId] || []), newBookmark]
        };
        
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
        return updatedBookmarks;
      });
      
      return newBookmark.id;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      setError('Failed to add bookmark');
      return null;
    }
  }, [currentUser, isLoggedIn]);
  
  // Add a highlight
  const addHighlight = useCallback((bookId, page, position, text, color = 'yellow') => {
    if (!isLoggedIn) {
      setError('You must be logged in to add highlights');
      return null;
    }
    
    try {
      const newHighlight = {
        id: `hl${uuidv4()}`,
        bookId,
        userId: currentUser?._id || 'anonymous',
        page,
        position,
        type: 'highlight',
        color,
        text,
        createdAt: new Date().toISOString()
      };
      
      setBookmarks(prev => {
        const updatedBookmarks = {
          ...prev,
          [bookId]: [...(prev[bookId] || []), newHighlight]
        };
        
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
        return updatedBookmarks;
      });
      
      return newHighlight.id;
    } catch (error) {
      console.error('Error adding highlight:', error);
      setError('Failed to add highlight');
      return null;
    }
  }, [currentUser, isLoggedIn]);
  
  // Add a note (can be standalone or attached to a highlight)
  const addNote = useCallback((bookId, page, position, text, relatedTo = null, color = 'green') => {
    if (!isLoggedIn) {
      setError('You must be logged in to add notes');
      return null;
    }
    
    try {
      const newNote = {
        id: `nt${uuidv4()}`,
        bookId,
        userId: currentUser?._id || 'anonymous',
        page,
        position,
        type: 'note',
        color,
        text,
        createdAt: new Date().toISOString(),
        relatedTo
      };
      
      setBookmarks(prev => {
        const updatedBookmarks = {
          ...prev,
          [bookId]: [...(prev[bookId] || []), newNote]
        };
        
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
        return updatedBookmarks;
      });
      
      return newNote.id;
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note');
      return null;
    }
  }, [currentUser, isLoggedIn]);
  
  // Update a bookmark, highlight, or note
  const updateBookmark = useCallback((bookId, bookmarkId, updates) => {
    try {
      setBookmarks(prev => {
        if (!prev[bookId]) return prev;
        
        const bookmarksForBook = [...prev[bookId]];
        const bookmarkIndex = bookmarksForBook.findIndex(b => b.id === bookmarkId);
        
        if (bookmarkIndex >= 0) {
          bookmarksForBook[bookmarkIndex] = {
            ...bookmarksForBook[bookmarkIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          
          const updatedBookmarks = {
            ...prev,
            [bookId]: bookmarksForBook
          };
          
          localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
          return updatedBookmarks;
        }
        
        return prev;
      });
      
      return true;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      setError('Failed to update bookmark');
      return false;
    }
  }, []);
  
  // Delete a bookmark, highlight, or note
  const deleteBookmark = useCallback((bookId, bookmarkId) => {
    try {
      setBookmarks(prev => {
        if (!prev[bookId]) return prev;
        
        // If deleting a highlight, also delete related notes
        let bookmarksForBook = [...prev[bookId]];
        const bookmark = bookmarksForBook.find(b => b.id === bookmarkId);
        
        if (bookmark && bookmark.type === 'highlight') {
          // Filter out related notes
          bookmarksForBook = bookmarksForBook.filter(b => b.relatedTo !== bookmarkId);
        }
        
        // Filter out the bookmark itself
        bookmarksForBook = bookmarksForBook.filter(b => b.id !== bookmarkId);
        
        const updatedBookmarks = {
          ...prev,
          [bookId]: bookmarksForBook
        };
        
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
        return updatedBookmarks;
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      setError('Failed to delete bookmark');
      return false;
    }
  }, []);
  
  // Change bookmark color
  const changeColor = useCallback((bookId, bookmarkId, newColor) => {
    return updateBookmark(bookId, bookmarkId, { color: newColor });
  }, [updateBookmark]);
  
  // Get bookmarks by type
  const getBookmarksByType = useCallback((bookId, type) => {
    const bookmarksForBook = bookmarks[bookId] || [];
    return bookmarksForBook.filter(b => b.type === type);
  }, [bookmarks]);
  
  // Get notes related to a highlight
  const getRelatedNotes = useCallback((highlightId) => {
    const allBookmarks = Object.values(bookmarks).flat();
    return allBookmarks.filter(b => b.relatedTo === highlightId);
  }, [bookmarks]);
  
  // Export all bookmarks for a book
  const exportBookmarks = useCallback((bookId) => {
    try {
      const bookmarksToExport = bookmarks[bookId] || [];
      
      if (bookmarksToExport.length === 0) {
        setError('No bookmarks to export');
        return null;
      }
      
      // Create an export object
      const exportData = {
        bookId,
        bookmarks: bookmarksToExport,
        exportedAt: new Date().toISOString()
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // In a real app, would allow file download
      // For now, just return the JSON string
      return jsonString;
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
      setError('Failed to export bookmarks');
      return null;
    }
  }, [bookmarks]);
  
  // Import bookmarks from JSON
  const importBookmarks = useCallback((jsonString) => {
    try {
      if (!isLoggedIn) {
        setError('You must be logged in to import bookmarks');
        return false;
      }
      
      const importData = JSON.parse(jsonString);
      
      if (!importData.bookId || !Array.isArray(importData.bookmarks)) {
        setError('Invalid import data format');
        return false;
      }
      
      const { bookId, bookmarks: importedBookmarks } = importData;
      
      // Add current user ID to imported bookmarks
      const processedBookmarks = importedBookmarks.map(bookmark => ({
        ...bookmark,
        userId: currentUser?._id || 'anonymous',
        importedAt: new Date().toISOString()
      }));
      
      setBookmarks(prev => {
        const existingBookmarks = prev[bookId] || [];
        const updatedBookmarks = {
          ...prev,
          [bookId]: [...existingBookmarks, ...processedBookmarks]
        };
        
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
        return updatedBookmarks;
      });
      
      return true;
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      setError('Failed to import bookmarks');
      return false;
    }
  }, [currentUser, isLoggedIn]);
  
  // Clear all bookmarks for a book
  const clearBookmarks = useCallback((bookId) => {
    try {
      setBookmarks(prev => {
        const updatedBookmarks = { ...prev };
        delete updatedBookmarks[bookId];
        
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
        return updatedBookmarks;
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      setError('Failed to clear bookmarks');
      return false;
    }
  }, []);
  
  // Get bookmark count for a book
  const getBookmarkCount = useCallback((bookId) => {
    return (bookmarks[bookId] || []).length;
  }, [bookmarks]);
  
  // Get all bookmarks across all books
  const getAllBookmarks = useCallback(() => {
    return Object.entries(bookmarks).map(([bookId, bookmarkList]) => ({
      bookId,
      bookmarks: bookmarkList
    }));
  }, [bookmarks]);
  
  // New function to show bookmark panel with specific book and page
  const openBookmarkPanel = (bookId, page) => {
    setCurrentBookId(bookId);
    setCurrentPageNum(page || 1);
    setShowPanel(true);
  };
  
  // Function to hide the panel
  const closeBookmarkPanel = () => {
    setShowPanel(false);
  };
  
  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        loading,
        error,
        showPanel,
        currentBookId,
        currentPageNum,
        getBookBookmarks,
        addBookmark,
        addHighlight,
        addNote,
        updateBookmark,
        deleteBookmark,
        changeColor,
        getBookmarksByType,
        getRelatedNotes,
        exportBookmarks,
        importBookmarks,
        clearBookmarks,
        getBookmarkCount,
        getAllBookmarks,
        openBookmarkPanel,
        closeBookmarkPanel
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}; 