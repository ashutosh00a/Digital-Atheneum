import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create search context
const SearchContext = createContext();

// Sample book categories and tags for browsing
export const bookCategories = [
  'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 
  'Thriller', 'Romance', 'Biography', 'History', 'Self-Help', 
  'Business', 'Children', 'Young Adult', 'Poetry', 'Science'
];

export const bookTags = [
  'Bestseller', 'Award Winner', 'Classic', 'New Release', 'Trending',
  'Featured', 'Popular', 'Top Rated', 'Editor\'s Choice', 'Book Club Pick'
];

export const languages = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 
  'Japanese', 'Russian', 'Italian', 'Portuguese', 'Arabic'
];

// Expanded mock book data for advanced search
export const mockBooks = [
  { 
    _id: '1', 
    title: 'The Great Gatsby', 
    author: 'F. Scott Fitzgerald', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Fiction',
    isbn: '9780743273565',
    year: 1925,
    language: 'English',
    rating: 4.5,
    tags: ['Classic', 'Bestseller'],
    price: 12.99,
    pages: 180,
    description: 'A classic novel about the Jazz Age in America, focusing on the mysterious millionaire Jay Gatsby.'
  },
  { 
    _id: '2', 
    title: 'To Kill a Mockingbird', 
    author: 'Harper Lee', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Fiction',
    isbn: '9780061120084',
    year: 1960,
    language: 'English',
    rating: 4.8,
    tags: ['Classic', 'Award Winner'],
    price: 14.99,
    pages: 336,
    description: 'A novel about racial inequality and moral growth in the American South during the 1930s.'
  },
  { 
    _id: '3', 
    title: 'Pride and Prejudice', 
    author: 'Jane Austen', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Romance',
    isbn: '9780141439518',
    year: 1813,
    language: 'English',
    rating: 4.7,
    tags: ['Classic', 'Featured'],
    price: 9.99,
    pages: 432,
    description: 'A romantic novel about the relationship between Elizabeth Bennet and Mr. Darcy.'
  },
  { 
    _id: '4', 
    title: '1984', 
    author: 'George Orwell', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Science Fiction',
    isbn: '9780451524935',
    year: 1949,
    language: 'English',
    rating: 4.6,
    tags: ['Classic', 'Bestseller'],
    price: 11.99,
    pages: 328,
    description: 'A dystopian novel about totalitarianism, surveillance, and repressive regimentation.'
  },
  { 
    _id: '5', 
    title: 'The Catcher in the Rye', 
    author: 'J.D. Salinger', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Fiction',
    isbn: '9780316769488',
    year: 1951,
    language: 'English',
    rating: 4.3,
    tags: ['Classic', 'Featured'],
    price: 10.99,
    pages: 277,
    description: 'A novel about teenage angst and alienation.'
  },
  { 
    _id: '6', 
    title: 'Lord of the Flies', 
    author: 'William Golding', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Fiction',
    isbn: '9780399501487',
    year: 1954,
    language: 'English',
    rating: 4.2,
    tags: ['Classic', 'Book Club Pick'],
    price: 9.99,
    pages: 224,
    description: 'A novel about a group of British boys stuck on an uninhabited island.'
  },
  { 
    _id: '7', 
    title: 'Animal Farm', 
    author: 'George Orwell', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Fiction',
    isbn: '9780451526342',
    year: 1945,
    language: 'English',
    rating: 4.4,
    tags: ['Classic', 'Top Rated'],
    price: 8.99,
    pages: 140,
    description: 'An allegorical novella about a group of farm animals who rebel against their human farmer.'
  },
  { 
    _id: '8', 
    title: 'The Hobbit', 
    author: 'J.R.R. Tolkien', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Fantasy',
    isbn: '9780547928227',
    year: 1937,
    language: 'English',
    rating: 4.7,
    tags: ['Classic', 'Bestseller'],
    price: 13.99,
    pages: 366,
    description: 'A fantasy novel about the journey of Bilbo Baggins to win a share of a treasure guarded by a dragon.'
  },
  { 
    _id: '9', 
    title: 'Harry Potter and the Sorcerer\'s Stone', 
    author: 'J.K. Rowling', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Fantasy',
    isbn: '9780590353427',
    year: 1997,
    language: 'English',
    rating: 4.9,
    tags: ['Bestseller', 'Trending'],
    price: 15.99,
    pages: 309,
    description: 'The first novel in the Harry Potter series about a young wizard.'
  },
  { 
    _id: '10', 
    title: 'The Hunger Games', 
    author: 'Suzanne Collins', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Science Fiction',
    isbn: '9780439023481',
    year: 2008,
    language: 'English',
    rating: 4.6,
    tags: ['Bestseller', 'New Release'],
    price: 14.99,
    pages: 374,
    description: 'A dystopian novel set in a post-apocalyptic society where young people are selected to compete in a televised death match.'
  },
  { 
    _id: '11', 
    title: 'The Da Vinci Code', 
    author: 'Dan Brown', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Mystery',
    isbn: '9780307474278',
    year: 2003,
    language: 'English',
    rating: 4.2,
    tags: ['Bestseller', 'Trending'],
    price: 12.99,
    pages: 597,
    description: 'A mystery thriller novel about symbologist Robert Langdon investigating a murder in the Louvre Museum.'
  },
  { 
    _id: '12', 
    title: 'The Alchemist', 
    author: 'Paulo Coelho', 
    coverImage: 'https://via.placeholder.com/300x450',
    genre: 'Fiction',
    isbn: '9780062315007',
    year: 1988,
    language: 'Portuguese',
    rating: 4.7,
    tags: ['Bestseller', 'Editor\'s Choice'],
    price: 10.99,
    pages: 208,
    description: 'A philosophical novel about a young Andalusian shepherd who travels to Egypt after having a recurring dream.'
  }
];

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Advanced filtering options
  const [filters, setFilters] = useState({
    category: '',
    author: '',
    yearFrom: '',
    yearTo: '',
    language: '',
    ratingMin: 0,
    tags: [],
    priceMin: '',
    priceMax: ''
  });

  // Initialize trending and featured books on mount
  useEffect(() => {
    // Load recently viewed books from localStorage
    const loadRecentlyViewed = () => {
      try {
        const storedRecentlyViewed = localStorage.getItem('recentlyViewed');
        if (storedRecentlyViewed) {
          const parsedRecentlyViewed = JSON.parse(storedRecentlyViewed);
          // Map IDs to actual book objects and limit to 5
          const bookObjects = parsedRecentlyViewed
            .map(id => mockBooks.find(book => book._id === id))
            .filter(Boolean)
            .slice(0, 5);
          setRecentlyViewed(bookObjects);
        }
      } catch (error) {
        console.error('Error loading recently viewed books:', error);
      }
    };

    // Load recent searches from localStorage
    const loadRecentSearches = () => {
      try {
        const storedRecentSearches = localStorage.getItem('recentSearches');
        if (storedRecentSearches) {
          setRecentSearches(JSON.parse(storedRecentSearches).slice(0, 5));
        }
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    };

    // Set trending books (based on rating and tags)
    const setTrendingBooksData = () => {
      const trending = mockBooks
        .filter(book => book.tags.includes('Trending') || book.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
      setTrendingBooks(trending);
    };

    // Set featured books
    const setFeaturedBooksData = () => {
      const featured = mockBooks
        .filter(book => book.tags.includes('Featured') || book.tags.includes('Editor\'s Choice'))
        .slice(0, 6);
      setFeaturedBooks(featured);
    };

    loadRecentlyViewed();
    loadRecentSearches();
    setTrendingBooksData();
    setFeaturedBooksData();
  }, []);

  // Function to add book to recently viewed
  const addToRecentlyViewed = useCallback((bookId) => {
    try {
      // First get existing recently viewed books
      const storedRecentlyViewed = localStorage.getItem('recentlyViewed');
      let recentlyViewedIds = storedRecentlyViewed ? JSON.parse(storedRecentlyViewed) : [];
      
      // Remove book if it already exists to avoid duplicates
      recentlyViewedIds = recentlyViewedIds.filter(id => id !== bookId);
      
      // Add book id to the beginning of the array
      recentlyViewedIds.unshift(bookId);
      
      // Keep only the most recent 10 books
      recentlyViewedIds = recentlyViewedIds.slice(0, 10);
      
      // Update localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewedIds));
      
      // Update state with actual book objects (up to 5 for display)
      const bookObjects = recentlyViewedIds
        .map(id => mockBooks.find(book => book._id === id))
        .filter(Boolean)
        .slice(0, 5);
      
      setRecentlyViewed(bookObjects);
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  }, []);

  // Function to save search term to recent searches
  const addToRecentSearches = useCallback((term) => {
    if (!term.trim()) return;
    
    try {
      // Get existing recent searches
      const storedRecentSearches = localStorage.getItem('recentSearches');
      let searches = storedRecentSearches ? JSON.parse(storedRecentSearches) : [];
      
      // Remove duplicate if exists
      searches = searches.filter(search => search.toLowerCase() !== term.toLowerCase());
      
      // Add new search term to beginning
      searches.unshift(term);
      
      // Keep only most recent 10 searches
      searches = searches.slice(0, 10);
      
      // Update localStorage and state
      localStorage.setItem('recentSearches', JSON.stringify(searches));
      setRecentSearches(searches.slice(0, 5));
    } catch (error) {
      console.error('Error adding to recent searches:', error);
    }
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  }, []);

  // Basic search function
  const searchBooks = useCallback((term, advancedFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Combine current filters with any new advanced filters
      const searchFilters = { ...filters, ...advancedFilters };
      const searchTerm = term !== undefined ? term : searchTerm;
      
      // Save search term if it exists
      if (searchTerm.trim()) {
        addToRecentSearches(searchTerm);
      }
      
      // Filter books based on search term and filters
      let results = mockBooks;
      
      // Text search (title, author, description, ISBN)
      if (searchTerm.trim()) {
        const lowerCaseTerm = searchTerm.toLowerCase();
        results = results.filter(book => 
          book.title.toLowerCase().includes(lowerCaseTerm) ||
          book.author.toLowerCase().includes(lowerCaseTerm) ||
          book.description.toLowerCase().includes(lowerCaseTerm) ||
          book.isbn.includes(searchTerm)
        );
      }
      
      // Apply category filter
      if (searchFilters.category) {
        results = results.filter(book => book.genre === searchFilters.category);
      }
      
      // Apply author filter
      if (searchFilters.author) {
        results = results.filter(book => 
          book.author.toLowerCase().includes(searchFilters.author.toLowerCase())
        );
      }
      
      // Apply year range filter
      if (searchFilters.yearFrom) {
        results = results.filter(book => book.year >= parseInt(searchFilters.yearFrom));
      }
      if (searchFilters.yearTo) {
        results = results.filter(book => book.year <= parseInt(searchFilters.yearTo));
      }
      
      // Apply language filter
      if (searchFilters.language) {
        results = results.filter(book => book.language === searchFilters.language);
      }
      
      // Apply rating filter
      if (searchFilters.ratingMin > 0) {
        results = results.filter(book => book.rating >= searchFilters.ratingMin);
      }
      
      // Apply tag filters
      if (searchFilters.tags && searchFilters.tags.length > 0) {
        results = results.filter(book => 
          searchFilters.tags.some(tag => book.tags.includes(tag))
        );
      }
      
      // Apply price range filter
      if (searchFilters.priceMin) {
        results = results.filter(book => book.price >= parseFloat(searchFilters.priceMin));
      }
      if (searchFilters.priceMax) {
        results = results.filter(book => book.price <= parseFloat(searchFilters.priceMax));
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
      setError('Failed to search books');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, addToRecentSearches]);

  // Update search term and trigger search
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
    searchBooks(term);
  }, [searchBooks]);

  // Update filters and trigger search
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      searchBooks(undefined, updatedFilters);
      return updatedFilters;
    });
  }, [searchBooks]);

  // Reset all filters and search
  const resetFilters = useCallback(() => {
    const emptyFilters = {
      category: '',
      author: '',
      yearFrom: '',
      yearTo: '',
      language: '',
      ratingMin: 0,
      tags: [],
      priceMin: '',
      priceMax: ''
    };
    setFilters(emptyFilters);
    searchBooks(searchTerm, emptyFilters);
  }, [searchTerm, searchBooks]);

  // Search by category
  const searchByCategory = useCallback((category) => {
    updateFilters({ category });
  }, [updateFilters]);

  // Search by tag
  const searchByTag = useCallback((tag) => {
    updateFilters({ tags: [tag] });
  }, [updateFilters]);

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        searchResults,
        filters,
        loading,
        error,
        recentSearches,
        recentlyViewed,
        trendingBooks,
        featuredBooks,
        updateSearchTerm,
        updateFilters,
        resetFilters,
        searchBooks,
        searchByCategory,
        searchByTag,
        addToRecentlyViewed,
        clearRecentSearches
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext; 