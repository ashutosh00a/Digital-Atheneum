import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from './api';

// Create reading history context
const ReadingHistoryContext = createContext();

export const ReadingHistoryProvider = ({ children }) => {
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load reading history from API
  const loadReadingHistory = useCallback(async () => {
    setLoading(true);
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) {
        setReadingHistory([]);
        return;
      }

      const { data } = await api.get('/users/reading-history');
      setReadingHistory(data);
    } catch (error) {
      console.error('Error loading reading history:', error);
      setReadingHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadReadingHistory();
  }, [loadReadingHistory]);
  
  // Update book reading progress
  const updateReadingProgress = useCallback(async (bookId, progress, totalPages) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) return null;
    
    try {
      const timestamp = new Date().toISOString();
      const percentComplete = Math.round((progress / totalPages) * 100);
      
      const { data } = await api.put(
        `/users/reading-history/${bookId}`,
        { progress, totalPages, percentComplete }
      );
      
      setReadingHistory(prev => 
        prev.map(item => item.bookId === bookId ? data : item)
      );
      
      return data;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      return null;
    }
  }, []);
  
  // Delete a specific reading history entry
  const deleteHistoryEntry = useCallback(async (bookId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return false;

      await api.delete(`/users/reading-history/${bookId}`);
      
      setReadingHistory(prev => prev.filter(entry => entry.bookId !== bookId));
      return true;
    } catch (error) {
      console.error('Error deleting history entry:', error);
      return false;
    }
  }, []);
  
  // Clear entire reading history
  const clearAllHistory = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return false;

      await api.delete('/users/reading-history');
      
      setReadingHistory([]);
      return true;
    } catch (error) {
      console.error('Error clearing reading history:', error);
      return false;
    }
  }, []);
  
  // Get reading progress for a specific book
  const getReadingProgress = useCallback((bookId) => {
    return readingHistory.find(item => item.bookId === bookId) || null;
  }, [readingHistory]);
  
  // Get all book data with reading progress
  const getHistoryWithBookDetails = useCallback(() => {
    return readingHistory;
  }, [readingHistory]);
  
  return (
    <ReadingHistoryContext.Provider 
      value={{ 
        readingHistory, 
        loading, 
        updateReadingProgress, 
        deleteHistoryEntry, 
        clearAllHistory,
        getReadingProgress,
        getHistoryWithBookDetails,
        loadReadingHistory
      }}
    >
      {children}
    </ReadingHistoryContext.Provider>
  );
};

export default ReadingHistoryContext; 