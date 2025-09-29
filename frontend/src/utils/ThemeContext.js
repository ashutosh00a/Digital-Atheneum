import React, { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has a preference in localStorage
  const savedTheme = localStorage.getItem('theme');
  
  // Check system time to set default theme if no preference
  const getDefaultTheme = () => {
    const hours = new Date().getHours();
    // Dark mode between 7PM and 7AM
    return (hours >= 19 || hours < 7) ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(savedTheme || getDefaultTheme());

  // Apply theme to body when theme changes
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Set up automatic theme change based on time
  useEffect(() => {
    if (!savedTheme) {
      const interval = setInterval(() => {
        const newDefaultTheme = getDefaultTheme();
        if (newDefaultTheme !== theme) {
          setTheme(newDefaultTheme);
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [theme, savedTheme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 