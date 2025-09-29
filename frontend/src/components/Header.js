import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeContext from '../utils/ThemeContext';
import AuthContext from '../utils/AuthContext';
import NotificationContext from '../utils/NotificationContext';
import NotificationCenter from './NotificationCenter';
import { Form, Dropdown, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import logo from '../assets/logo.png';
import api from '../utils/api';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { userInfo, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const isLoggedIn = userInfo && userInfo.token;
  const isAdmin = isLoggedIn && userInfo.role === 'admin';

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search books based on search term
  useEffect(() => {
    const searchBooks = async () => {
      if (searchTerm.trim()) {
        try {
          const { data } = await api.get(`/books?keyword=${searchTerm}`);
          setSearchResults(data.slice(0, 5)); // Limit to 5 results
          setShowSearchDropdown(true);
        } catch (error) {
          console.error('Error searching books:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    };

    const debounceTimer = setTimeout(searchBooks, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setShowSearchDropdown(false);
    setShowSearchModal(false);
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleSearchIconClick = () => {
    setShowSearchModal(true);
    setTimeout(() => {
      const modalSearchInput = document.getElementById('modal-search-input');
      if (modalSearchInput) modalSearchInput.focus();
    }, 300);
  };

  const handleSearchItemClick = (bookId) => {
    setShowSearchDropdown(false);
    setShowSearchModal(false);
    navigate(`/book/${bookId}`);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleFavoritesClick = () => {
    navigate('/favorites');
  };
  
  const handleReadingHistoryClick = () => {
    navigate('/reading-history');
  };

  const handleNotificationsClick = () => {
    setShowNotifications(true);
  };

  return (
    <header>
      <nav className={`navbar navbar-expand-lg ${theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}>
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img
              src={logo}
              alt="Digital Athenaeum Logo"
              className="me-2"
              style={{ height: '40px' }}
            />
            <span className="d-none d-sm-inline">Digital Athenaeum</span>
          </Link>
          
          {/* Hamburger menu button with search icon beside it */}
          <div className="d-flex align-items-center">
            {/* Search icon for mobile - visible only on small screens */}
            <button 
              className={`btn btn-sm ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'} d-lg-none me-2`}
              onClick={handleSearchIconClick}
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </button>
            
            {/* Notification icon for mobile */}
            {isLoggedIn && (
              <button 
                className={`btn btn-sm ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'} d-lg-none me-2 position-relative`}
                onClick={handleNotificationsClick}
                aria-label="Notifications"
              >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount > 9 ? '9+' : unreadCount}
                    <span className="visually-hidden">unread notifications</span>
                  </span>
                )}
              </button>
            )}
            
            {/* Chat button for mobile */}
            {isLoggedIn && (
              <Link 
                to="/chat" 
                className={`btn btn-sm ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'} d-lg-none me-2`}
                aria-label="Chat"
              >
                <i className="fas fa-comment-dots"></i>
              </Link>
            )}
            
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
              aria-controls="navbarContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
          
          {/* Collapsible content */}
          <div className="collapse navbar-collapse" id="navbarContent">
            {/* Search container - visible only on larger screens */}
            <div className="search-container mx-auto position-relative d-none d-lg-block" ref={searchRef} style={{ maxWidth: '400px' }}>
              <Form onSubmit={handleSearch} className="d-flex w-100">
                <Form.Control
                  type="search"
                  placeholder="Search books..."
                  className="me-2 search-input"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    background: theme === 'dark' ? 'var(--input-bg)' : 'var(--input-bg)',
                    color: 'var(--input-text)'
                  }}
                />
                <Button variant={theme === 'dark' ? 'outline-light' : 'outline-dark'} type="submit">
                  <i className="fas fa-search"></i>
                </Button>
              </Form>
              
              {/* Search results dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div 
                  className={`search-results-dropdown ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    borderRadius: '0.25rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginTop: '0.25rem',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
                  }}
                >
                  {searchResults.map(book => (
                    <div 
                      key={book._id} 
                      className={`search-result-item d-flex align-items-center p-2 ${theme === 'dark' ? 'search-result-dark' : 'search-result-light'}`}
                      onClick={() => handleSearchItemClick(book._id)}
                      style={{
                        cursor: 'pointer',
                        borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #eee',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#444' : '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                      }}
                    >
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className="me-2" 
                        style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="fw-bold">{book.title}</div>
                        <div className="text-muted small">{book.author}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Navigation items */}
            <ul className="navbar-nav ms-auto">
              {/* Theme toggle */}
              <li className="nav-item">
                <button
                  className={`btn btn-sm ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'}`}
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
                </button>
              </li>
              
              {/* User menu */}
              {isLoggedIn ? (
                <>
                  {/* Notification icon for desktop */}
                  <li className="nav-item">
                    <button 
                      className={`btn btn-sm ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'} position-relative`}
                      onClick={handleNotificationsClick}
                      aria-label="Notifications"
                    >
                      <i className="fas fa-bell"></i>
                      {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {unreadCount > 9 ? '9+' : unreadCount}
                          <span className="visually-hidden">unread notifications</span>
                        </span>
                      )}
                    </button>
                  </li>
                  
                  {/* Chat button for desktop */}
                  <li className="nav-item">
                    <Link 
                      to="/chat" 
                      className={`btn btn-sm ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'}`}
                      aria-label="Chat"
                    >
                      <i className="fas fa-comment-dots"></i>
                    </Link>
                  </li>
                  
                  {/* User dropdown */}
                  <li className="nav-item dropdown">
                    <Dropdown>
                      <Dropdown.Toggle 
                        variant={theme === 'dark' ? 'outline-light' : 'outline-dark'}
                        id="user-dropdown"
                        className="btn-sm"
                      >
                        <i className="fas fa-user-circle me-1"></i>
                        {userInfo.name}
                      </Dropdown.Toggle>
                      
                      <Dropdown.Menu 
                        className={theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}
                        style={{
                          border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd'
                        }}
                      >
                        <Dropdown.Item onClick={handleProfileClick}>
                          <i className="fas fa-user me-2"></i>
                          Profile
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleFavoritesClick}>
                          <i className="fas fa-heart me-2"></i>
                          Favorites
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleReadingHistoryClick}>
                          <i className="fas fa-history me-2"></i>
                          Reading History
                        </Dropdown.Item>
                        {isAdmin && (
                          <Dropdown.Item as={Link} to="/admin">
                            <i className="fas fa-cog me-2"></i>
                            Admin Panel
                          </Dropdown.Item>
                        )}
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt me-2"></i>
                          Logout
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link 
                      to="/login" 
                      className={`btn btn-sm ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'} me-2`}
                    >
                      Sign In
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      to="/register" 
                      className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-primary'}`}
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      
      {/* Search Modal */}
      <Modal
        show={showSearchModal}
        onHide={() => setShowSearchModal(false)}
        centered
        className={theme === 'dark' ? 'dark-modal' : ''}
      >
        <Modal.Header closeButton>
          <Modal.Title>Search Books</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSearch}>
            <Form.Group>
              <Form.Control
                id="modal-search-input"
                type="search"
                placeholder="Search by title, author, or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  background: theme === 'dark' ? 'var(--input-bg)' : 'var(--input-bg)',
                  color: 'var(--input-text)'
                }}
              />
            </Form.Group>
          </Form>
          
          {/* Search results in modal */}
          {searchResults.length > 0 && (
            <div className="mt-3">
              {searchResults.map(book => (
                <div 
                  key={book._id}
                  className={`search-result-item d-flex align-items-center p-2 ${theme === 'dark' ? 'search-result-dark' : 'search-result-light'}`}
                  onClick={() => handleSearchItemClick(book._id)}
                  style={{
                    cursor: 'pointer',
                    borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #eee',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#444' : '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <img 
                    src={book.coverImage} 
                    alt={book.title} 
                    className="me-2" 
                    style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                  />
                  <div>
                    <div className="fw-bold">{book.title}</div>
                    <div className="text-muted small">{book.author}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
      
      {/* Notification Center */}
      <NotificationCenter 
        show={showNotifications} 
        onHide={() => setShowNotifications(false)} 
      />
    </header>
  );
};

export default Header; 