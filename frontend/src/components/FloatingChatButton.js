import React, { useState, useContext, useEffect, useRef } from 'react';
import ThemeContext from '../utils/ThemeContext';

const FloatingChatButton = ({ onClick }) => {
  const { theme } = useContext(ThemeContext);
  
  // State for the draggable chat button position
  const [chatButtonPosition, setChatButtonPosition] = useState(() => {
    // Get saved position from localStorage or use default
    const savedPosition = localStorage.getItem('chatButtonPosition');
    return savedPosition ? JSON.parse(savedPosition) : { x: 20, y: 20, side: 'right' };
  });
  
  // State to track screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Refs for drag functionality
  const chatBtnRef = useRef(null);
  const dragInfo = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startRight: 0,
    startBottom: 0,
    startTime: 0
  });
  
  // Save position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chatButtonPosition', JSON.stringify(chatButtonPosition));
  }, [chatButtonPosition]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // If transitioning to mobile and button position might cause issues, reset it
      if (mobile && chatButtonPosition.y < 20) {
        setChatButtonPosition(prev => ({
          ...prev,
          y: 20
        }));
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chatButtonPosition]);
  
  // Mouse/Touch event handlers for dragging
  const handleMouseDown = (e) => {
    // Prevent default behavior
    e.preventDefault();
    
    // Get event coordinates (works for both mouse and touch)
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    // Initialize drag
    dragInfo.current = {
      isDragging: false, // Start with false, will be set to true if mouse moves
      startX: clientX,
      startY: clientY,
      startRight: chatButtonPosition.x,
      startBottom: chatButtonPosition.y,
      startTime: Date.now()
    };
    
    // Add move and end event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
  };
  
  const handleMouseMove = (e) => {
    // Set isDragging to true on first move
    if (!dragInfo.current.isDragging) {
      dragInfo.current.isDragging = true;
    }
    
    // Prevent scrolling on touch devices
    e.preventDefault();
    
    // Get event coordinates
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    // Calculate new position
    const deltaX = clientX - dragInfo.current.startX;
    const deltaY = clientY - dragInfo.current.startY;
    
    // Calculate updated position with constraints
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonSize = 60; // Size of the button in pixels
    
    // During drag, maintain the current side and just update position
    const currentSide = chatButtonPosition.side;
    
    if (currentSide === 'right') {
      // Position from right edge
      let newRight = Math.max(10, dragInfo.current.startRight - deltaX);
      let newBottom = Math.max(10, dragInfo.current.startBottom - deltaY);
      
      // Make sure button doesn't go out of bounds
      newRight = Math.min(newRight, viewportWidth - buttonSize - 10);
      newBottom = Math.min(newBottom, viewportHeight - buttonSize - 10);
      
      setChatButtonPosition({
        x: newRight,
        y: newBottom,
        side: currentSide
      });
    } else {
      // Position from left edge
      let newLeft = Math.max(10, clientX - dragInfo.current.startX);
      let newBottom = Math.max(10, dragInfo.current.startBottom - deltaY);
      
      // Make sure button doesn't go out of bounds
      newLeft = Math.min(newLeft, viewportWidth - buttonSize - 10);
      newBottom = Math.min(newBottom, viewportHeight - buttonSize - 10);
      
      setChatButtonPosition({
        x: newLeft,
        y: newBottom,
        side: currentSide
      });
    }
  };
  
  const handleMouseUp = (e) => {
    // Only trigger click if it was a short press and not a drag
    const wasDragging = dragInfo.current.isDragging;
    const isQuickClick = Date.now() - dragInfo.current.startTime < 200;
    
    if (!wasDragging && isQuickClick) {
      onClick();
    } else if (wasDragging) {
      // When dropping, snap to the nearest side
      const viewportWidth = window.innerWidth;
      const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || viewportWidth / 2;
      
      // Check if we should snap to left or right side
      const distanceFromLeft = clientX;
      const distanceFromRight = viewportWidth - clientX;
      const snapToSide = distanceFromLeft < distanceFromRight ? 'left' : 'right';
      
      // Calculate the new position based on the side
      if (snapToSide === 'right') {
        // For right side, keep current x but change side
        setChatButtonPosition(prev => ({
          ...prev,
          side: 'right',
          x: prev.side === 'left' ? 30 : prev.x // Default to 30px if coming from left
        }));
      } else {
        // For left side, keep current x but change side
        setChatButtonPosition(prev => ({
          ...prev,
          side: 'left',
          x: prev.side === 'right' ? 30 : prev.x // Default to 30px if coming from right
        }));
      }
    }
    
    // End dragging and remove event listeners
    dragInfo.current.isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleMouseMove);
    document.removeEventListener('touchend', handleMouseUp);
  };
  
  return (
    <div 
      className={`floating-chat-btn ${isMobile ? 'floating-chat-mobile' : ''}`}
      ref={chatBtnRef}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      data-side={chatButtonPosition.side}
      style={
        chatButtonPosition.side === 'right' 
          ? {
              right: `${chatButtonPosition.x}px`,
              bottom: `${chatButtonPosition.y}px`,
              left: 'auto',
              width: isMobile ? '48px' : '60px',
              height: isMobile ? '48px' : '60px',
              fontSize: isMobile ? '18px' : '22px',
              opacity: '0.9',
              zIndex: '1050'
            }
          : {
              left: `${chatButtonPosition.x}px`,
              bottom: `${chatButtonPosition.y}px`,
              right: 'auto',
              width: isMobile ? '48px' : '60px',
              height: isMobile ? '48px' : '60px',
              fontSize: isMobile ? '18px' : '22px',
              opacity: '0.9', 
              zIndex: '1050'
            }
      }
    >
      <i className="fas fa-comment-dots"></i>
    </div>
  );
};

export default FloatingChatButton; 