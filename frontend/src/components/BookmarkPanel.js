import React, { useState, useContext, useEffect } from 'react';
import { Offcanvas, Tab, Tabs, ListGroup, Button, Form, Badge, Accordion, Dropdown as BSDropdown, Modal as BSModal } from 'react-bootstrap';
import ThemeContext from '../utils/ThemeContext';
import BookmarkContext from '../utils/BookmarkContext';
import ChatPanel from './ChatPanel';

const BookmarkPanel = ({ show, onHide, bookId, currentPage }) => {
  const { theme } = useContext(ThemeContext);
  const { 
    getBookmarksByType, 
    deleteBookmark, 
    getRelatedNotes, 
    exportBookmarks, 
    importBookmarks,
    clearBookmarks,
    addNote,
    changeColor
  } = useContext(BookmarkContext);
  
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [newNote, setNewNote] = useState('');
  const [selectedBookmarkId, setSelectedBookmarkId] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);
  
  // Chat panel state
  const [showChatPanel, setShowChatPanel] = useState(false);
  
  // Load bookmarks and highlights when component mounts or currentPage changes
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const bookmarksData = await getBookmarksByType(bookId, 'bookmark');
        const highlightsData = await getBookmarksByType(bookId, 'highlight');
        const notesData = await getBookmarksByType(bookId, 'note');
        
        setBookmarks(bookmarksData);
        setHighlights(highlightsData);
        setNotes(notesData);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };
    
    if (show) {
      loadBookmarks();
    }
  }, [bookId, getBookmarksByType, show, currentPage]);
  
  // Handle bookmark deletion
  const handleDeleteBookmark = async (bookmarkId, type) => {
    try {
      await deleteBookmark(bookmarkId);
      
      // Update the appropriate list based on bookmark type
      if (type === 'bookmark') {
        setBookmarks(bookmarks.filter(bookmark => bookmark.id !== bookmarkId));
      } else if (type === 'highlight') {
        setHighlights(highlights.filter(highlight => highlight.id !== bookmarkId));
      } else if (type === 'note') {
        setNotes(notes.filter(note => note.id !== bookmarkId));
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };
  
  // Handle bookmark click - navigating to the page
  const handleBookmarkClick = (page) => {
    // In a real app, this would navigate to the specific page in the book reader
    console.log(`Navigating to page ${page}`);
    onHide(); // Close the panel
  };
  
  // Handle adding a note to a bookmark or highlight
  const handleAddNote = async () => {
    if (!selectedBookmarkId || !newNote.trim()) return;
    
    try {
      const updatedNote = await addNote(selectedBookmarkId, newNote);
      
      // Find the bookmark and update the related notes
      const bookmarkType = bookmarks.find(b => b.id === selectedBookmarkId) ? 'bookmark' :
                          highlights.find(h => h.id === selectedBookmarkId) ? 'highlight' : null;
      
      if (bookmarkType === 'bookmark') {
        const updatedBookmarks = bookmarks.map(bookmark => 
          bookmark.id === selectedBookmarkId ? { ...bookmark, hasNote: true } : bookmark
        );
        setBookmarks(updatedBookmarks);
      } else if (bookmarkType === 'highlight') {
        const updatedHighlights = highlights.map(highlight => 
          highlight.id === selectedBookmarkId ? { ...highlight, hasNote: true } : highlight
        );
        setHighlights(updatedHighlights);
      }
      
      // Add the new note to notes list
      setNotes([...notes, updatedNote]);
      
      // Reset note form
      setNewNote('');
      setSelectedBookmarkId(null);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  
  // Handle color change for bookmark/highlight
  const handleColorChange = async (bookmarkId, color) => {
    try {
      await changeColor(bookmarkId, color);
      
      // Update the appropriate list based on bookmark type
      const inBookmarks = bookmarks.find(b => b.id === bookmarkId);
      if (inBookmarks) {
        const updatedBookmarks = bookmarks.map(bookmark => 
          bookmark.id === bookmarkId ? { ...bookmark, color } : bookmark
        );
        setBookmarks(updatedBookmarks);
      } else {
        const updatedHighlights = highlights.map(highlight => 
          highlight.id === bookmarkId ? { ...highlight, color } : highlight
        );
        setHighlights(updatedHighlights);
      }
    } catch (error) {
      console.error('Error changing color:', error);
    }
  };
  
  // Handle export bookmarks
  const handleExportBookmarks = async () => {
    try {
      const data = await exportBookmarks(bookId);
      setExportData(JSON.stringify(data, null, 2));
      setShowImportExport(true);
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
    }
  };
  
  // Handle import bookmarks
  const handleImportBookmarks = async () => {
    try {
      if (!importData.trim()) return;
      
      const parsedData = JSON.parse(importData);
      await importBookmarks(bookId, parsedData);
      
      // Reload bookmarks after import
      const bookmarksData = await getBookmarksByType(bookId, 'bookmark');
      const highlightsData = await getBookmarksByType(bookId, 'highlight');
      const notesData = await getBookmarksByType(bookId, 'note');
      
      setBookmarks(bookmarksData);
      setHighlights(highlightsData);
      setNotes(notesData);
      
      setImportData('');
      setShowImportExport(false);
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      alert('Invalid import data format. Please check your JSON.');
    }
  };
  
  // Handle clear all bookmarks
  const handleClearAllBookmarks = async () => {
    try {
      await clearBookmarks(bookId);
      setBookmarks([]);
      setHighlights([]);
      setNotes([]);
      setShowConfirmClear(false);
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get the color class for a bookmark/highlight
  const getColorClass = (color) => {
    switch (color) {
      case 'red': return 'danger';
      case 'blue': return 'primary';
      case 'green': return 'success';
      case 'yellow': return 'warning';
      case 'purple': return 'purple';
      default: return 'secondary';
    }
  };
  
  // Handle dropdown item click to stop event propagation
  const handleDropdownItemClick = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };
  
  // New dropdown toggle component that works with Bootstrap's dropdown
  const CustomToggle = React.forwardRef(({ children, onClick, variant, className, size }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      {children}
    </Button>
  ));
  
  // Custom menu component to prevent clicks from closing the panel
  const CustomMenu = React.forwardRef(
    ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
      return (
        <div
          ref={ref}
          style={style}
          className={className}
          aria-labelledby={labeledBy}
          onClick={e => e.stopPropagation()}
        >
          <ul className="list-unstyled mb-0">
            {children}
          </ul>
        </div>
      );
    },
  );
  
  return (
    <>
      <Offcanvas 
        show={show} 
        onHide={onHide} 
        placement="end"
        className={theme === 'dark' ? 'bg-dark text-light' : ''}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Reading Tools</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-0"
            justify
          >
            <Tab eventKey="bookmarks" title={`Bookmarks (${bookmarks.length})`}>
              <div className="p-2 border-bottom d-flex justify-content-end">
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="me-2"
                  onClick={() => setShowConfirmClear(true)}
                  disabled={bookmarks.length === 0}
                >
                  <i className="fas fa-trash-alt me-1"></i> Clear All
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={handleExportBookmarks}
                >
                  <i className="fas fa-download me-1"></i> Export
                </Button>
              </div>
              
              {bookmarks.length > 0 ? (
                <ListGroup variant="flush">
                  {bookmarks.map(bookmark => (
                    <ListGroup.Item 
                      key={bookmark.id}
                      action
                      onClick={() => handleBookmarkClick(bookmark.page)}
                      className={`${theme === 'dark' ? 'list-group-item-dark' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-bold">
                            <Badge bg={getColorClass(bookmark.color)} className="me-2">
                              <i className="fas fa-bookmark me-1"></i>Page {bookmark.page}
                            </Badge>
                            {bookmark.hasNote && <Badge bg="info"><i className="fas fa-sticky-note me-1"></i>Has Note</Badge>}
                          </div>
                          <small className="text-muted d-block mt-1">{formatDate(bookmark.createdAt)}</small>
                        </div>
                        <div className="d-flex">
                          <BSDropdown className="me-2" align="end">
                            <BSDropdown.Toggle 
                              as={CustomToggle}
                              variant={theme === 'dark' ? 'dark' : 'light'} 
                              id={`color-dropdown-${bookmark.id}`}
                              size="sm"
                              className="py-0 px-1"
                            >
                              <i className="fas fa-palette"></i>
                            </BSDropdown.Toggle>
                            <BSDropdown.Menu 
                              as={CustomMenu}
                              className={theme === 'dark' ? 'dropdown-menu-dark' : ''}
                            >
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => handleColorChange(bookmark.id, 'red'))}>
                                <Badge bg="danger" className="me-2">&nbsp;</Badge> Red
                              </BSDropdown.Item>
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => handleColorChange(bookmark.id, 'blue'))}>
                                <Badge bg="primary" className="me-2">&nbsp;</Badge> Blue
                              </BSDropdown.Item>
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => handleColorChange(bookmark.id, 'green'))}>
                                <Badge bg="success" className="me-2">&nbsp;</Badge> Green
                              </BSDropdown.Item>
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => handleColorChange(bookmark.id, 'yellow'))}>
                                <Badge bg="warning" className="me-2">&nbsp;</Badge> Yellow
                              </BSDropdown.Item>
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => handleColorChange(bookmark.id, 'purple'))}>
                                <Badge bg="info" className="me-2">&nbsp;</Badge> Purple
                              </BSDropdown.Item>
                            </BSDropdown.Menu>
                          </BSDropdown>
                          <BSDropdown align="end">
                            <BSDropdown.Toggle 
                              as={CustomToggle}
                              variant={theme === 'dark' ? 'dark' : 'light'} 
                              id={`action-dropdown-${bookmark.id}`}
                              size="sm"
                              className="py-0 px-1"
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </BSDropdown.Toggle>
                            <BSDropdown.Menu 
                              as={CustomMenu}
                              className={theme === 'dark' ? 'dropdown-menu-dark' : ''}
                            >
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => {
                                setSelectedBookmarkId(bookmark.id);
                                setActiveTab('addNote');
                              })}>
                                <i className="fas fa-plus me-2"></i> Add Note
                              </BSDropdown.Item>
                              <BSDropdown.Item 
                                onClick={(e) => handleDropdownItemClick(e, () => handleDeleteBookmark(bookmark.id, 'bookmark'))}
                                className="text-danger"
                              >
                                <i className="fas fa-trash-alt me-2"></i> Delete
                              </BSDropdown.Item>
                            </BSDropdown.Menu>
                          </BSDropdown>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center p-4">
                  <i className="fas fa-bookmark text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3">No bookmarks yet</p>
                  <p className="text-muted small">Tap the bookmark icon while reading to add bookmarks</p>
                </div>
              )}
            </Tab>
            
            <Tab eventKey="highlights" title={`Highlights (${highlights.length})`}>
              {highlights.length > 0 ? (
                <ListGroup variant="flush">
                  {highlights.map(highlight => (
                    <ListGroup.Item 
                      key={highlight.id}
                      action
                      onClick={() => handleBookmarkClick(highlight.page)}
                      className={`${theme === 'dark' ? 'list-group-item-dark' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-bold">
                            <Badge bg={getColorClass(highlight.color)} className="me-2">
                              <i className="fas fa-highlighter me-1"></i>Page {highlight.page}
                            </Badge>
                            {highlight.hasNote && <Badge bg="info"><i className="fas fa-sticky-note me-1"></i>Has Note</Badge>}
                          </div>
                          <div className="mt-2 p-2 border-start" style={{ borderColor: `var(--bs-${getColorClass(highlight.color)}) !important`, borderWidth: '3px' }}>
                            {highlight.text}
                          </div>
                          <small className="text-muted d-block mt-1">{formatDate(highlight.createdAt)}</small>
                        </div>
                        <div className="d-flex">
                          <BSDropdown className="me-2" align="end">
                            <BSDropdown.Toggle 
                              as={CustomToggle}
                              variant={theme === 'dark' ? 'dark' : 'light'} 
                              id={`color-dropdown-${highlight.id}`}
                              size="sm"
                              className="py-0 px-1"
                            >
                              <i className="fas fa-palette"></i>
                            </BSDropdown.Toggle>
                            <BSDropdown.Menu 
                              as={CustomMenu}
                              className={theme === 'dark' ? 'dropdown-menu-dark' : ''}
                            >
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => handleColorChange(highlight.id, 'red'))}>
                                <Badge bg="danger" className="me-2">&nbsp;</Badge> Red
                              </BSDropdown.Item>
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => handleColorChange(highlight.id, 'blue'))}>
                                <Badge bg="primary" className="me-2">&nbsp;</Badge> Blue
                              </BSDropdown.Item>
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => handleColorChange(highlight.id, 'green'))}>
                                <Badge bg="success" className="me-2">&nbsp;</Badge> Green
                              </BSDropdown.Item>
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => handleColorChange(highlight.id, 'yellow'))}>
                                <Badge bg="warning" className="me-2">&nbsp;</Badge> Yellow
                              </BSDropdown.Item>
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => handleColorChange(highlight.id, 'purple'))}>
                                <Badge bg="info" className="me-2">&nbsp;</Badge> Purple
                              </BSDropdown.Item>
                            </BSDropdown.Menu>
                          </BSDropdown>
                          <BSDropdown align="end">
                            <BSDropdown.Toggle 
                              as={CustomToggle}
                              variant={theme === 'dark' ? 'dark' : 'light'} 
                              id={`action-dropdown-${highlight.id}`}
                              size="sm"
                              className="py-0 px-1"
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </BSDropdown.Toggle>
                            <BSDropdown.Menu 
                              as={CustomMenu}
                              className={theme === 'dark' ? 'dropdown-menu-dark' : ''}
                            >
                              <BSDropdown.Item onClick={(e) => handleDropdownItemClick(e, () => {
                                setSelectedBookmarkId(highlight.id);
                                setActiveTab('addNote');
                              })}>
                                <i className="fas fa-plus me-2"></i> Add Note
                              </BSDropdown.Item>
                              <BSDropdown.Item 
                                onClick={(e) => handleDropdownItemClick(e, () => handleDeleteBookmark(highlight.id, 'highlight'))}
                                className="text-danger"
                              >
                                <i className="fas fa-trash-alt me-2"></i> Delete
                              </BSDropdown.Item>
                            </BSDropdown.Menu>
                          </BSDropdown>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center p-4">
                  <i className="fas fa-highlighter text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3">No highlights yet</p>
                  <p className="text-muted small">Select text while reading to highlight important passages</p>
                </div>
              )}
            </Tab>
            
            <Tab eventKey="notes" title={`Notes (${notes.length})`}>
              {notes.length > 0 ? (
                <ListGroup variant="flush">
                  {notes.map(note => (
                    <ListGroup.Item 
                      key={note.id}
                      action
                      onClick={() => handleBookmarkClick(note.page)}
                      className={`${theme === 'dark' ? 'list-group-item-dark' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-bold">
                            <Badge bg="info" className="me-2">
                              <i className="fas fa-sticky-note me-1"></i>Page {note.page}
                            </Badge>
                            {note.parentType && (
                              <Badge bg={note.parentType === 'bookmark' ? 'secondary' : 'warning'}>
                                <i className={`fas fa-${note.parentType === 'bookmark' ? 'bookmark' : 'highlighter'} me-1`}></i>
                                {note.parentType.charAt(0).toUpperCase() + note.parentType.slice(1)}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 p-2 bg-opacity-10 bg-info rounded">
                            {note.text}
                          </div>
                          <small className="text-muted d-block mt-1">{formatDate(note.createdAt)}</small>
                        </div>
                        <Button 
                          variant="link" 
                          className="p-0 text-danger" 
                          onClick={() => handleDeleteBookmark(note.id, 'note')}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center p-4">
                  <i className="fas fa-sticky-note text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3">No notes yet</p>
                  <p className="text-muted small">Add notes to bookmarks or highlights to remember important details</p>
                </div>
              )}
            </Tab>
            
            <Tab eventKey="addNote" title="Add Note">
              <div className="p-3">
                <h5 className="mb-3">Add Note</h5>
                
                {selectedBookmarkId ? (
                  <Form>
                    <Form.Group className="mb-3" controlId="noteText">
                      <Form.Label>Your Note</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Type your note here..."
                        className={theme === 'dark' ? 'bg-dark text-light' : ''}
                      />
                    </Form.Group>
                    
                    <div className="d-flex justify-content-between">
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setSelectedBookmarkId(null);
                          setNewNote('');
                          setActiveTab('bookmarks');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                      >
                        Save Note
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="text-center p-4">
                    <p>Select a bookmark or highlight first to add a note.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => setActiveTab('bookmarks')}
                    >
                      View Bookmarks
                    </Button>
                  </div>
                )}
              </div>
            </Tab>
            
            <Tab eventKey="import" title="Import/Export">
              <div className="p-3">
                <h5 className="mb-3">Import & Export</h5>
                
                <Accordion defaultActiveKey={showImportExport ? '0' : null}>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Export Bookmarks</Accordion.Header>
                    <Accordion.Body>
                      <p className="mb-3">Export all your bookmarks, highlights, and notes for this book.</p>
                      
                      {exportData ? (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Control
                              as="textarea"
                              rows={10}
                              value={exportData}
                              readOnly
                              className={`${theme === 'dark' ? 'bg-dark text-light' : ''} code-font`}
                            />
                          </Form.Group>
                          <div className="d-flex justify-content-end">
                            <Button 
                              variant="primary"
                              onClick={() => {
                                navigator.clipboard.writeText(exportData);
                                alert('Export data copied to clipboard!');
                              }}
                            >
                              <i className="fas fa-copy me-2"></i>Copy to Clipboard
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button 
                          variant="primary"
                          onClick={handleExportBookmarks}
                        >
                          <i className="fas fa-download me-2"></i>Export
                        </Button>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                  
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Import Bookmarks</Accordion.Header>
                    <Accordion.Body>
                      <p className="mb-3">Import bookmarks, highlights, and notes from exported JSON data.</p>
                      
                      <Form.Group className="mb-3">
                        <Form.Control
                          as="textarea"
                          rows={10}
                          value={importData}
                          onChange={(e) => setImportData(e.target.value)}
                          placeholder="Paste exported JSON data here..."
                          className={`${theme === 'dark' ? 'bg-dark text-light' : ''} code-font`}
                        />
                      </Form.Group>
                      
                      <div className="d-flex justify-content-end">
                        <Button 
                          variant="secondary"
                          className="me-2"
                          onClick={() => setImportData('')}
                        >
                          Clear
                        </Button>
                        <Button 
                          variant="primary"
                          onClick={handleImportBookmarks}
                          disabled={!importData.trim()}
                        >
                          <i className="fas fa-upload me-2"></i>Import
                        </Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>
            </Tab>
          </Tabs>
        </Offcanvas.Body>
        
        {/* Confirm Clear Modal */}
        <BSModal
          show={showConfirmClear}
          onHide={() => setShowConfirmClear(false)}
          centered
          className={theme === 'dark' ? 'dark-modal' : ''}
        >
          <BSModal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <BSModal.Title>Confirm Delete</BSModal.Title>
          </BSModal.Header>
          <BSModal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <p>Are you sure you want to delete all bookmarks, highlights, and notes for this book? This action cannot be undone.</p>
          </BSModal.Body>
          <BSModal.Footer className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <Button variant="secondary" onClick={() => setShowConfirmClear(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearAllBookmarks}>
              Delete All
            </Button>
          </BSModal.Footer>
        </BSModal>
      </Offcanvas>
      
      {/* Chat Panel - Side panel for chat */}
      <ChatPanel 
        show={showChatPanel} 
        onHide={() => setShowChatPanel(false)} 
      />
    </>
  );
};

export default BookmarkPanel; 