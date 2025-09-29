import React, { createContext, useState, useEffect } from 'react';
import api from './api';

// Create favorites context
const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load favorites from API
    const loadFavorites = async () => {
      setLoading(true);
      
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
          setFavorites([]);
          return;
        }

        const { data } = await api.get('/users/favorites');
        setFavorites(data);
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, []);
  
  // Add a book to favorites
  const addToFavorites = async (book) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return false;

      const { data } = await api.post('/users/favorites', { bookId: book._id });
      setFavorites(prev => [...prev, data]);
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  };
  
  // Remove a book from favorites
  const removeFromFavorites = async (bookId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;

      await api.delete(`/users/favorites/${bookId}`);
      
      setFavorites(prev => prev.filter(book => book._id !== bookId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };
  
  // Check if a book is in favorites
  const isInFavorites = (bookId) => {
    return favorites.some(book => book._id === bookId);
  };
  
  return (
    <FavoritesContext.Provider 
      value={{ 
        favorites, 
        loading, 
        addToFavorites, 
        removeFromFavorites, 
        isInFavorites 
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext; 