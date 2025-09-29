import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Accordion, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeContext from '../utils/ThemeContext';
import SearchContext, { bookCategories, bookTags, languages } from '../utils/SearchContext';

const AdvancedSearch = ({ onCloseModal, isInModal = false }) => {
  const { theme } = useContext(ThemeContext);
  const { 
    searchTerm, 
    filters, 
    updateSearchTerm, 
    updateFilters, 
    resetFilters, 
    searchByCategory, 
    searchByTag,
    recentSearches,
    clearRecentSearches
  } = useContext(SearchContext);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Local state for form fields
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState({
    title: '',
    author: '',
    genre: '',
    publisher: '',
    yearPublished: '',
    rating: '',
    sortBy: 'title',
    sortOrder: 'asc'
  });
  
  // Selected filters for displaying badges
  const [selectedFilters, setSelectedFilters] = useState([]);
  
  // Initialize local state from context
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
    setLocalFilters({
      title: filters.title || '',
      author: filters.author || '',
      genre: filters.genre || '',
      publisher: filters.publisher || '',
      yearPublished: filters.yearPublished || '',
      rating: filters.rating || '',
      sortBy: filters.sortBy || 'title',
      sortOrder: filters.sortOrder || 'asc'
    });
    
    // Update selected filters for badges
    updateSelectedFiltersBadges();
  }, [searchTerm, filters]);
  
  // Update the selected filters badges
  const updateSelectedFiltersBadges = () => {
    const selected = [];
    
    if (filters.title) {
      selected.push({ type: 'title', value: filters.title });
    }
    
    if (filters.author) {
      selected.push({ type: 'author', value: filters.author });
    }
    
    if (filters.genre) {
      selected.push({ type: 'genre', value: filters.genre });
    }
    
    if (filters.publisher) {
      selected.push({ type: 'publisher', value: filters.publisher });
    }
    
    if (filters.yearPublished) {
      selected.push({ type: 'yearPublished', value: filters.yearPublished });
    }
    
    if (filters.rating) {
      selected.push({ type: 'rating', value: filters.rating });
    }
    
    if (filters.sortBy) {
      selected.push({ type: 'sortBy', value: filters.sortBy });
    }
    
    if (filters.sortOrder) {
      selected.push({ type: 'sortOrder', value: filters.sortOrder });
    }
    
    setSelectedFilters(selected);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update search context
    updateSearchTerm(localSearchTerm);
    updateFilters(localFilters);
    
    // Navigate to homepage with search params if not already there
    if (location.pathname !== '/') {
      navigate('/');
    }
    
    // Close modal if in modal mode
    if (isInModal && onCloseModal) {
      onCloseModal();
    }
  };
  
  // Handle filter reset
  const handleReset = () => {
    setLocalSearchTerm('');
    setLocalFilters({
      title: '',
      author: '',
      genre: '',
      publisher: '',
      yearPublished: '',
      rating: '',
      sortBy: 'title',
      sortOrder: 'asc'
    });
    resetFilters();
  };
  
  // Handle tag selection
  const handleTagSelection = (tag) => {
    setLocalFilters(prev => {
      const updated = { ...prev };
      
      if (tag.type === 'title') {
        updated.title = tag.value;
      } else if (tag.type === 'author') {
        updated.author = tag.value;
      } else if (tag.type === 'genre') {
        updated.genre = tag.value;
      } else if (tag.type === 'publisher') {
        updated.publisher = tag.value;
      } else if (tag.type === 'yearPublished') {
        updated.yearPublished = tag.value;
      } else if (tag.type === 'rating') {
        updated.rating = tag.value;
      } else if (tag.type === 'sortBy') {
        updated.sortBy = tag.value;
      } else if (tag.type === 'sortOrder') {
        updated.sortOrder = tag.value;
      }
      
      return updated;
    });
  };
  
  // Handle filter removal
  const handleRemoveFilter = (type, value) => {
    setLocalFilters(prev => {
      const updated = { ...prev };
      
      switch (type) {
        case 'title':
          updated.title = '';
          break;
        case 'author':
          updated.author = '';
          break;
        case 'genre':
          updated.genre = '';
          break;
        case 'publisher':
          updated.publisher = '';
          break;
        case 'yearPublished':
          updated.yearPublished = '';
          break;
        case 'rating':
          updated.rating = '';
          break;
        case 'sortBy':
          updated.sortBy = 'title';
          break;
        case 'sortOrder':
          updated.sortOrder = 'asc';
          break;
        default:
          break;
      }
      
      // Update context
      updateFilters(updated);
      
      return updated;
    });
  };
  
  // Handle recent search click
  const handleRecentSearchClick = (term) => {
    setLocalSearchTerm(term);
    updateSearchTerm(term);
    
    // Navigate to homepage with search params if not already there
    if (location.pathname !== '/') {
      navigate('/');
    }
    
    // Close modal if in modal mode
    if (isInModal && onCloseModal) {
      onCloseModal();
    }
  };
  
  return (
    <Card className={`advanced-search ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
      <Card.Body>
        <h4 className="mb-3">Advanced Search</h4>
        
        <Form onSubmit={handleSubmit}>
          {/* Basic search input */}
          <Form.Group className="mb-3">
            <Form.Label>Search for books</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter title, author, ISBN, or keywords"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
            <Form.Text className="text-muted">
              Search across titles, authors, descriptions, and ISBN
            </Form.Text>
          </Form.Group>
          
          {/* Selected filters badges */}
          {selectedFilters.length > 0 && (
            <div className="selected-filters mb-3">
              <div className="d-flex flex-wrap align-items-center">
                <span className="me-2">Active filters:</span>
                {selectedFilters.map((filter, index) => (
                  <Badge 
                    key={index} 
                    bg="primary" 
                    className="me-2 mb-2 filter-badge"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRemoveFilter(filter.type, filter.value)}
                  >
                    {filter.type === 'tag' ? `#${filter.value}` : filter.value} &times;
                  </Badge>
                ))}
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  className="mb-2"
                  onClick={handleReset}
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
          
          {/* Advanced filters */}
          <Accordion className="mb-3">
            <Accordion.Item eventKey="0" className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <Accordion.Header>Filter Options</Accordion.Header>
              <Accordion.Body>
                <Row>
                  {/* Title filter */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={localFilters.title}
                        onChange={(e) => setLocalFilters({...localFilters, title: e.target.value})}
                        placeholder="Search by title"
                      />
                    </Form.Group>
                  </Col>
                  
                  {/* Author filter */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Author</Form.Label>
                      <Form.Control
                        type="text"
                        name="author"
                        value={localFilters.author}
                        onChange={(e) => setLocalFilters({...localFilters, author: e.target.value})}
                        placeholder="Search by author"
                      />
                    </Form.Group>
                  </Col>
                  
                  {/* Genre filter */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Genre</Form.Label>
                      <Form.Select
                        name="genre"
                        value={localFilters.genre}
                        onChange={(e) => setLocalFilters({...localFilters, genre: e.target.value})}
                      >
                        <option value="">All Genres</option>
                        <option value="fiction">Fiction</option>
                        <option value="non-fiction">Non-Fiction</option>
                        <option value="science">Science</option>
                        <option value="history">History</option>
                        <option value="biography">Biography</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  {/* Publisher filter */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Publisher</Form.Label>
                      <Form.Control
                        type="text"
                        name="publisher"
                        value={localFilters.publisher}
                        onChange={(e) => setLocalFilters({...localFilters, publisher: e.target.value})}
                        placeholder="Search by publisher"
                      />
                    </Form.Group>
                  </Col>
                  
                  {/* Year Published filter */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Year Published</Form.Label>
                      <Form.Control
                        type="number"
                        name="yearPublished"
                        value={localFilters.yearPublished}
                        onChange={(e) => setLocalFilters({...localFilters, yearPublished: e.target.value})}
                        placeholder="Year"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </Form.Group>
                  </Col>
                  
                  {/* Minimum Rating filter */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Minimum Rating</Form.Label>
                      <Form.Select
                        name="rating"
                        value={localFilters.rating}
                        onChange={(e) => setLocalFilters({...localFilters, rating: e.target.value})}
                      >
                        <option value="">Any Rating</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                        <option value="1">1+ Stars</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  {/* Sort By filter */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Sort By</Form.Label>
                      <Form.Select
                        name="sortBy"
                        value={localFilters.sortBy}
                        onChange={(e) => setLocalFilters({...localFilters, sortBy: e.target.value})}
                      >
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                        <option value="rating">Rating</option>
                        <option value="yearPublished">Year Published</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  {/* Sort Order filter */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Sort Order</Form.Label>
                      <Form.Select
                        name="sortOrder"
                        value={localFilters.sortOrder}
                        onChange={(e) => setLocalFilters({...localFilters, sortOrder: e.target.value})}
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                {/* Tags */}
                <Form.Group className="mb-3">
                  <Form.Label>Tags</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {bookTags.map(tag => (
                      <Badge 
                        key={tag}
                        bg={localFilters.tags.includes(tag) ? "primary" : "secondary"}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleTagSelection(tag)}
                        className="p-2"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="recent-searches mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Recent Searches</h6>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0"
                  onClick={clearRecentSearches}
                >
                  Clear
                </Button>
              </div>
              <div className="d-flex flex-wrap">
                {recentSearches.map((term, index) => (
                  <Badge 
                    key={index} 
                    bg="light" 
                    text="dark" 
                    className="me-2 mb-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRecentSearchClick(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Submit & Reset buttons */}
          <div className="d-flex">
            <Button variant="primary" type="submit" className="me-2">
              Search
            </Button>
            <Button variant="outline-secondary" type="button" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AdvancedSearch; 