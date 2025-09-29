import React, { useState, useContext, useEffect, useRef } from 'react';
import { Offcanvas, Form, Button } from 'react-bootstrap';
import ThemeContext from '../utils/ThemeContext';

const ChatPanel = ({ show, onHide }) => {
  const { theme } = useContext(ThemeContext);
  const [chatMessages, setChatMessages] = useState(() => {
    // Try to load messages from localStorage
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [
      { id: 1, sender: 'bot', text: 'Hello! I\'m your reading assistant. Ask me anything about books or how I can help you with your reading experience.', timestamp: new Date() }
    ];
  });
  const [userMessage, setUserMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Check screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    if (show && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, show]);

  // Focus input field when panel opens
  useEffect(() => {
    if (show && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [show]);

  // Handle sending a message in the chat
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!userMessage.trim()) return;
    
    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setUserMessage('');
    setIsBotTyping(true);
    
    // Simulate bot response (in a real app this would call an API)
    setTimeout(() => {
      let botResponse;
      
      // Simple keyword-based responses
      const lowerCaseMsg = userMessage.toLowerCase();
      if (lowerCaseMsg.includes('bookmark') || lowerCaseMsg.includes('mark')) {
        botResponse = 'To bookmark a page, click the bookmark icon in the top right while reading. You can view and manage all your bookmarks in the Bookmarks tab.';
      } else if (lowerCaseMsg.includes('highlight') || lowerCaseMsg.includes('highlighting')) {
        botResponse = 'To highlight text, select any text while reading and choose a highlight color from the popup menu. Your highlights will be saved in the Highlights tab.';
      } else if (lowerCaseMsg.includes('note') || lowerCaseMsg.includes('notes')) {
        botResponse = 'You can add notes to any bookmark or highlight. Just click the "..." menu next to a bookmark or highlight and select "Add Note".';
      } else if (lowerCaseMsg.includes('color') || lowerCaseMsg.includes('change color')) {
        botResponse = 'You can change the color of bookmarks and highlights by clicking the palette icon next to them and selecting a new color.';
      } else if (lowerCaseMsg.includes('hello') || lowerCaseMsg.includes('hi') || lowerCaseMsg.includes('hey')) {
        botResponse = 'Hello! How can I help with your reading today?';
      } else if (lowerCaseMsg.includes('thank')) {
        botResponse = 'You\'re welcome! Let me know if you need any other assistance.';
      } else if (lowerCaseMsg.includes('export') || lowerCaseMsg.includes('import')) {
        botResponse = 'You can export or import your bookmarks, highlights, and notes in the Import/Export tab. This is useful for backing up your reading progress or transferring between devices.';
      } else if (lowerCaseMsg.includes('book recommendation') || lowerCaseMsg.includes('recommend') || lowerCaseMsg.includes('suggestion')) {
        botResponse = 'Based on your reading history, you might enjoy "The Silent Patient" by Alex Michaelides or "Educated" by Tara Westover. Would you like more suggestions in a particular genre?';
      } else if (lowerCaseMsg.includes('genre') || lowerCaseMsg.includes('category')) {
        botResponse = 'We have books in many genres including Fiction, Non-Fiction, Mystery, Science Fiction, Romance, Biography, and many more. Which genre interests you?';
      } else if (lowerCaseMsg.includes('dark mode') || lowerCaseMsg.includes('light mode') || lowerCaseMsg.includes('theme')) {
        botResponse = 'You can change the theme from light to dark mode by clicking the theme toggle switch in the top navigation bar.';
      } else {
        botResponse = 'I understand you\'re asking about "' + userMessage + '". While I\'m a simple demo assistant, in a full version I would be connected to book content and could answer specific questions about books you\'re reading.';
      }
      
      const botMsg = {
        id: Date.now(),
        sender: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 1500); // Simulate typing delay
  };
  
  // Format time for chat messages
  const formatChatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Clear chat history
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      setChatMessages([
        { id: Date.now(), sender: 'bot', text: 'Chat history cleared. How can I help you today?', timestamp: new Date() }
      ]);
    }
  };

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      className={theme === 'dark' ? 'bg-dark text-light' : ''}
      style={{ width: isSmallScreen ? '100%' : '350px' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center">
            <i className="fas fa-book me-2" style={{ color: theme === 'dark' ? '#61dafb' : '#0d6efd' }}></i>
            <span>Reading Assistant</span>
          </div>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={handleClearChat}
            className="p-1 px-2"
          >
            <i className="fas fa-trash-alt"></i>
          </Button>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <div className="d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex-grow-1 p-3 overflow-auto chat-scroll">
            {chatMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-3`}
              >
                <div 
                  className={`p-3 shadow-sm ${msg.sender === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}
                  style={{ maxWidth: isSmallScreen ? '85%' : '75%', borderRadius: '1rem' }}
                >
                  <div className="mb-1">{msg.text}</div>
                  <div 
                    className={`text-end small ${msg.sender === 'user' ? 'text-light' : 'text-muted'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {formatChatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isBotTyping && (
              <div className="d-flex justify-content-start mb-3">
                <div className="p-3 shadow-sm chat-message-bot" style={{ maxWidth: isSmallScreen ? '85%' : '75%', borderRadius: '1rem' }}>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
          
          <div className="border-top p-2 p-sm-3">
            <Form onSubmit={handleSendMessage}>
              <div className="d-flex">
                <Form.Control
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about books or features..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  disabled={isBotTyping}
                  className={theme === 'dark' ? 'bg-dark text-light' : ''}
                />
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="ms-2"
                  disabled={!userMessage.trim() || isBotTyping}
                >
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </div>
            </Form>
            <div className="text-center mt-2 d-none d-sm-block">
              <small className="text-muted">Try asking about books, bookmarks, highlighting, or themes</small>
            </div>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default ChatPanel; 