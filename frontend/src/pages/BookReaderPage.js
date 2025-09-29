import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Row, Col, Card, Alert, Tooltip, OverlayTrigger, ButtonGroup, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import Loader from '../components/Loader';
import Message from '../components/Message';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import ThemeContext from '../utils/ThemeContext';
import ReadingHistoryContext from '../utils/ReadingHistoryContext';
import BookmarkContext from '../utils/BookmarkContext';
import { useSelector } from 'react-redux';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const BookReaderPage = () => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [progressUpdated, setProgressUpdated] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [currentHighlightColor, setCurrentHighlightColor] = useState('yellow');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Use refs to track if component is mounted
  const isMounted = useRef(true);
  // Use ref to track the last saved page to prevent unnecessary saves
  const lastSavedPage = useRef(1);
  const contentRef = useRef(null);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { updateReadingProgress, getReadingProgress } = useContext(ReadingHistoryContext);
  const { 
    addBookmark, 
    addHighlight, 
    getBookmarksByType, 
    getBookmarkCount,
    openBookmarkPanel
  } = useContext(BookmarkContext);
  
  const { userInfo } = useSelector((state) => state.user);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  // Cleanup on unmount  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
    
  // Initial book load and auth check
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        // Get book details
        const { data: bookData } = await axios.get(`/api/books/${id}`, config);
        
        if (bookData) {
          setBook(bookData);
          setTotalPages(bookData.pageCount);
          setPdfUrl(bookData.pdfUrl);
          
          // Check for previous reading progress
          const savedProgress = getReadingProgress(id);
          if (savedProgress && savedProgress.progress) {
            setCurrentPage(savedProgress.progress);
            lastSavedPage.current = savedProgress.progress;
          }
        } else {
          setError('Book not found or unable to load book data.');
        }
      } catch (error) {
        console.error('Error loading book:', error);
        setError(error.response?.data?.message || 'Failed to load book. Please try again later.');
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    fetchBook();
  }, [id, navigate, userInfo, getReadingProgress]);

  // Load highlights for the current page
  useEffect(() => {
    if (!book || !isMounted.current) return;
    
    const loadHighlights = async () => {
      try {
        // Get highlights for current page
        const highlights = await getBookmarksByType(id, 'highlight');
        const pageHighlights = highlights.filter(h => h.page === currentPage);
        
        // Apply highlights to content
        if (contentRef.current && pageHighlights.length > 0) {
          setTimeout(() => {
            applyHighlights(pageHighlights);
          }, 100);
        }
      } catch (error) {
        console.error('Error loading highlights:', error);
      }
    };
    
    loadHighlights();
  }, [book, currentPage, id, getBookmarksByType]);
  
  // Apply highlights to text content
  const applyHighlights = (highlights) => {
    if (!contentRef.current) return;
    
    // Get all text nodes
    const textContent = contentRef.current.textContent;
    
    // For each highlight, find and apply it
    highlights.forEach(highlight => {
      if (!highlight.text || !highlight.position) return;
      
      const colorClass = getColorClass(highlight.color);
      
      // Find text position (this is a simplified approach - in a real app, 
      // you would need more robust text search with context)
      const range = document.createRange();
      const textNodes = [];
      
      // Get all text nodes in the content
      const walker = document.createTreeWalker(
        contentRef.current,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }
      
      // Find start position (simplified)
      try {
        let textStart = textContent.indexOf(highlight.text);
        if (textStart >= 0) {
          // Find which text node contains this start position
          let currentPos = 0;
          let startNode = null;
          let startOffset = 0;
          let endNode = null;
          let endOffset = 0;
          
          for (let i = 0; i < textNodes.length; i++) {
            const node = textNodes[i];
            const nodeLength = node.textContent.length;
            
            // Check if the start position is in this node
            if (!startNode && textStart >= currentPos && textStart < (currentPos + nodeLength)) {
              startNode = node;
              startOffset = textStart - currentPos;
            }
            
            // Check if the end position is in this node
            const textEnd = textStart + highlight.text.length;
            if (!endNode && textEnd > currentPos && textEnd <= (currentPos + nodeLength)) {
              endNode = node;
              endOffset = textEnd - currentPos;
              break;
            }
            
            currentPos += nodeLength;
          }
          
          if (startNode && endNode) {
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            
            // Apply highlight styles
            const highlightSpan = document.createElement('span');
            highlightSpan.className = `highlight-${colorClass}`;
            highlightSpan.dataset.highlightId = highlight.id;
            
            try {
              range.surroundContents(highlightSpan);
            } catch (e) {
              console.error('Error applying highlight:', e);
            }
          }
        }
      } catch (e) {
        console.error('Error processing highlight:', e);
      }
    });
  };
  
  // Get Bootstrap color class from highlight color
  const getColorClass = (color) => {
    switch (color) {
      case 'yellow': return 'warning';
      case 'green': return 'success';
      case 'blue': return 'primary';
      case 'red': return 'danger';
      case 'purple': return 'info';
      default: return 'warning';
    }
  };
  
  // Debounced progress saving
  useEffect(() => {
    if (!book || !isMounted.current) return;
    
    // Don't save if the page hasn't changed from the last saved value
    if (currentPage === lastSavedPage.current) return;
    
    // Use a timeout to debounce rapid page changes
    const saveTimeout = setTimeout(() => {
      if (!isMounted.current) return;
      
      try {
        updateReadingProgress(id, currentPage, totalPages);
        lastSavedPage.current = currentPage;
        
        if (isMounted.current) {
          setProgressUpdated(true);
          // Hide the success message after 2 seconds
          setTimeout(() => {
            if (isMounted.current) {
              setProgressUpdated(false);
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error saving reading progress:', error);
      }
    }, 500); // 500ms debounce delay
    
    return () => clearTimeout(saveTimeout);
  }, [book, currentPage, id, totalPages, updateReadingProgress]);
  
  // Text selection handling
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection.toString().length > 0) {
        setSelectedText(selection.toString());
        
        // Get selection position for highlight menu
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionPosition({
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY,
        });
        setShowHighlightMenu(true);
      } else {
        setSelectedText('');
        setShowHighlightMenu(false);
      }
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);
  
  const handleCreateHighlight = (color) => {
    if (!selectedText) return;
    
    try {
      addHighlight(id, {
        text: selectedText,
        page: currentPage,
        color,
        position: selectionPosition,
      });
      
      setShowHighlightMenu(false);
      setSelectedText('');
    } catch (error) {
      console.error('Error creating highlight:', error);
    }
  };
  
  const handleAddBookmark = () => {
    try {
      addBookmark(id, {
        page: currentPage,
        title: `Page ${currentPage}`,
        type: 'bookmark',
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };
  
  const safeNavigate = (path) => {
    if (isMounted.current) {
      navigate(path);
    }
  };
  
  const handleNextPage = (e) => {
    e.preventDefault();
    if (currentPage < pageCount) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const handlePreviousPage = (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleZoomIn = (e) => {
    e.preventDefault();
    setZoom(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = (e) => {
    e.preventDefault();
    setZoom(prev => Math.max(prev - 10, 50));
  };
  
  const handleDownload = (e) => {
    e.preventDefault();
    if (book && book.pdfUrl) {
      window.open(book.pdfUrl, '_blank');
    }
  };
  
  // Function to save reading progress
  const saveReadingProgress = async () => {
    try {
      setIsSaving(true);
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      };

      await axios.put(
        '/api/users/reading-progress',
        {
          bookId: id,
          progress: (currentPage / pageCount) * 100,
          lastReadPage: currentPage,
        },
        config
      );
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving reading progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Set up auto-save timer when preferences or current page changes
  useEffect(() => {
    if (userInfo?.preferences?.autoSave && currentPage > 0) {
      // Clear existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        saveReadingProgress();
      }, userInfo.preferences.autoSaveInterval * 60 * 1000); // Convert minutes to milliseconds

      setAutoSaveTimer(timer);

      // Cleanup timer on unmount or when dependencies change
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [currentPage, userInfo?.preferences?.autoSave, userInfo?.preferences?.autoSaveInterval]);

  // Save progress when manually changing pages
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (userInfo?.preferences?.autoSave) {
      saveReadingProgress();
    }
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key) {
        case 'ArrowRight':
          handleNextPage(e);
          break;
        case 'ArrowLeft':
          handlePreviousPage(e);
          break;
        case '+':
          handleZoomIn(e);
          break;
        case '-':
          handleZoomOut(e);
          break;
        case 'b':
          handleAddBookmark();
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, pageCount]);
  
  const renderHighlightColorButton = (color, icon, tooltip) => (
    <OverlayTrigger
      key={color}
      placement="top"
      overlay={<Tooltip>{tooltip}</Tooltip>}
    >
      <Button
        variant="outline-secondary"
        size="sm"
        className="me-1"
        onClick={() => handleCreateHighlight(color)}
      >
        <i className={`fas ${icon}`} style={{ color }}></i>
      </Button>
    </OverlayTrigger>
  );
  
  return (
    <div className={`book-reader ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="reader-header">
        <Link to={`/book/${id}`} className="btn btn-light">
          <i className="fas fa-arrow-left"></i> Back to Book
        </Link>
        
        <div className="d-flex align-items-center">
          <ButtonGroup className="me-2">
            <Button variant="outline-secondary" onClick={handleZoomOut}>
              <i className="fas fa-search-minus"></i>
            </Button>
            <Button variant="outline-secondary" onClick={handleZoomIn}>
              <i className="fas fa-search-plus"></i>
            </Button>
          </ButtonGroup>
          
          <ButtonGroup className="me-2">
            <Button variant="outline-secondary" onClick={handlePreviousPage} disabled={currentPage === 1}>
              <i className="fas fa-chevron-left"></i>
            </Button>
            <input
              type="number"
              min="1"
              max={pageCount}
              value={currentPage}
              onChange={(e) => handlePageChange(parseInt(e.target.value))}
              className="form-control text-center"
              style={{ width: '60px' }}
            />
            <Button variant="outline-secondary" onClick={handleNextPage} disabled={currentPage === pageCount}>
              <i className="fas fa-chevron-right"></i>
            </Button>
          </ButtonGroup>
          
          <Button variant="outline-secondary" onClick={handleAddBookmark}>
            <i className="fas fa-bookmark"></i>
          </Button>
          
          <Button variant="outline-secondary" onClick={handleDownload}>
            <i className="fas fa-download"></i>
          </Button>
          
          <div className="ms-3 d-flex align-items-center">
            {isSaving ? (
              <span className="text-muted me-2">
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </span>
            ) : lastSaved ? (
              <span className="text-muted me-2">
                <i className="fas fa-check"></i> Saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      
      <div className="reading-progress-container">
        <ProgressBar 
          now={(currentPage / pageCount) * 100} 
          label={`${Math.round((currentPage / pageCount) * 100)}%`}
          className="mb-2"
        />
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div className="reader-content" ref={contentRef}>
          <Document
            file={pdfUrl}
            loading={<Loader />}
            error={<Message variant="danger">Failed to load PDF. Please try again later.</Message>}
          >
            <Page
              pageNumber={currentPage}
              scale={zoom / 100}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      )}
      
      {progressUpdated && (
        <Alert variant="success" className="progress-alert">
          Reading progress saved
        </Alert>
      )}
      
      {showHighlightMenu && selectedText && (
        <div
          className="highlight-menu"
          style={{
            position: 'absolute',
            left: selectionPosition.x,
            top: selectionPosition.y,
            zIndex: 1000,
          }}
        >
          <ButtonGroup>
            {renderHighlightColorButton('yellow', 'fa-highlighter', 'Yellow')}
            {renderHighlightColorButton('green', 'fa-highlighter', 'Green')}
            {renderHighlightColorButton('blue', 'fa-highlighter', 'Blue')}
            {renderHighlightColorButton('red', 'fa-highlighter', 'Red')}
            {renderHighlightColorButton('purple', 'fa-highlighter', 'Purple')}
          </ButtonGroup>
        </div>
      )}
      
      <KeyboardShortcuts />
    </div>
  );
};

export default BookReaderPage; 