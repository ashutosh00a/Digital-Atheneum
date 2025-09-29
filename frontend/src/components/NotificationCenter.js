import React, { useState, useContext, useEffect, useRef } from 'react';
import { Offcanvas, Button, ListGroup, Badge, Tabs, Tab, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ThemeContext from '../utils/ThemeContext';
import NotificationContext from '../utils/NotificationContext';

const NotificationCenter = ({ show, onHide }) => {
  const { theme } = useContext(ThemeContext);
  const { 
    notifications, 
    unreadCount, 
    emailPreferences, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    updateEmailPreferences,
    sendTestEmailNotification
  } = useContext(NotificationContext);
  
  const [activeTab, setActiveTab] = useState('notifications');
  const [localEmailPreferences, setLocalEmailPreferences] = useState({});
  const [emailUpdated, setEmailUpdated] = useState(false);
  
  const navigate = useNavigate();
  const listGroupRef = useRef(null);
  
  // Initialize email preferences
  useEffect(() => {
    setLocalEmailPreferences(emailPreferences);
  }, [emailPreferences]);
  
  // Auto-scroll to first unread notification
  useEffect(() => {
    if (show && unreadCount > 0 && notifications.length > 0 && listGroupRef.current) {
      // Find first unread notification index
      const firstUnreadIndex = notifications.findIndex(notification => !notification.isRead);
      
      if (firstUnreadIndex >= 0 && listGroupRef.current.children[firstUnreadIndex]) {
        listGroupRef.current.children[firstUnreadIndex].scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [show, unreadCount, notifications]);
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to relevant page if there's a bookId
    if (notification.bookId) {
      onHide();
      navigate(`/book/${notification.bookId}`);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5; // 36e5 is the scientific notation for 60*60*1000
    
    if (diffInHours < 24) {
      // Today: show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      // Yesterday
      return 'Yesterday';
    } else {
      // Older than yesterday: show date
      return date.toLocaleDateString();
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'newArrival':
        return <i className="fas fa-book text-primary me-2"></i>;
      case 'comment':
        return <i className="fas fa-comment text-success me-2"></i>;
      case 'system':
        return <i className="fas fa-cog text-secondary me-2"></i>;
      default:
        return <i className="fas fa-bell text-info me-2"></i>;
    }
  };
  
  // Handle email preference change
  const handlePreferenceChange = (key) => {
    const updatedPreferences = {
      ...localEmailPreferences,
      [key]: !localEmailPreferences[key]
    };
    
    setLocalEmailPreferences(updatedPreferences);
    setEmailUpdated(true);
  };
  
  // Save email preferences
  const saveEmailPreferences = () => {
    updateEmailPreferences(localEmailPreferences);
    setEmailUpdated(false);
    // Add feedback toast in a real app
  };
  
  // Send test email
  const handleSendTestEmail = () => {
    sendTestEmailNotification();
    // Add feedback toast in a real app
  };
  
  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.date).toLocaleDateString();
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(notification);
    return acc;
  }, {});
  
  return (
    <Offcanvas 
      show={show} 
      onHide={onHide} 
      placement="end"
      className={theme === 'dark' ? 'dark' : ''}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          Notification Center
          {unreadCount > 0 && (
            <Badge bg={theme === 'dark' ? 'warning' : 'danger'} className="ms-2">{unreadCount}</Badge>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-0"
          justify
        >
          <Tab eventKey="notifications" title="Notifications">
            <div className="notification-actions p-2 border-bottom d-flex justify-content-between">
              <Button 
                variant="link" 
                size="sm" 
                className="text-decoration-none" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
              <Button 
                variant="link" 
                size="sm" 
                className="text-decoration-none text-danger" 
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
              >
                Clear all
              </Button>
            </div>
            
            {notifications.length > 0 ? (
              <ListGroup ref={listGroupRef} variant="flush">
                {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                  <React.Fragment key={date}>
                    <div className="notification-date-header p-2" 
                      style={{
                        backgroundColor: theme === 'dark' ? 'var(--dark-bg-secondary)' : 'var(--bg-secondary)',
                        color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-primary)'
                      }}>
                      <small>{date === new Date().toLocaleDateString() ? 'Today' : date}</small>
                    </div>
                    
                    {dateNotifications.map(notification => (
                      <ListGroup.Item 
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`border-0 ${!notification.isRead ? 'unread-notification' : ''} ${theme === 'dark' ? 'list-group-item-dark' : ''} notification-item`}
                        style={{
                          borderLeft: !notification.isRead ? `3px solid ${theme === 'dark' ? 'var(--primary-color)' : 'var(--primary-color)'}` : 'none',
                          background: !notification.isRead ? (theme === 'dark' ? 'rgba(255,180,71,0.1)' : 'rgba(0,0,0,0.03)') : '',
                          cursor: 'pointer'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex align-items-center flex-grow-1">
                            {getNotificationIcon(notification.type)}
                            <div>
                              <div className="fw-bold">{notification.title}</div>
                              <p className="mb-1">{notification.message}</p>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className={theme === 'dark' ? 'text-light-muted' : 'text-muted'}>{formatDate(notification.date)}</small>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="link" 
                            className={`p-0 ${theme === 'dark' ? 'text-light' : 'text-muted'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </React.Fragment>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center p-4">
                <i className="fas fa-bell text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="mt-3">No notifications yet</p>
              </div>
            )}
          </Tab>
          
          <Tab eventKey="settings" title="Email Settings">
            <div className="p-3">
              <h5 className="mb-3">Notification Preferences</h5>
              <p className={theme === 'dark' ? 'text-light-muted mb-4' : 'text-muted mb-4'}>Select which email notifications you'd like to receive</p>
              
              <Form>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="new-arrivals-pref"
                    label="New Book Arrivals"
                    checked={localEmailPreferences.newArrivals}
                    onChange={() => handlePreferenceChange('newArrivals')}
                  />
                  <Form.Text className={theme === 'dark' ? 'text-light-muted' : 'text-muted'}>
                    Get notified when new books are added to the library
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="comments-pref"
                    label="Comments on Reviews"
                    checked={localEmailPreferences.comments}
                    onChange={() => handlePreferenceChange('comments')}
                  />
                  <Form.Text className={theme === 'dark' ? 'text-light-muted' : 'text-muted'}>
                    Get notified when someone comments on your reviews
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="system-pref"
                    label="System Updates"
                    checked={localEmailPreferences.systemUpdates}
                    onChange={() => handlePreferenceChange('systemUpdates')}
                  />
                  <Form.Text className={theme === 'dark' ? 'text-light-muted' : 'text-muted'}>
                    Get notified about system updates and maintenance
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="newsletter-pref"
                    label="Weekly Newsletter"
                    checked={localEmailPreferences.weeklyNewsletter}
                    onChange={() => handlePreferenceChange('weeklyNewsletter')}
                  />
                  <Form.Text className={theme === 'dark' ? 'text-light-muted' : 'text-muted'}>
                    Receive a weekly digest of new books and library news
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Check 
                    type="switch"
                    id="author-pref"
                    label="Author Updates"
                    checked={localEmailPreferences.authorUpdates}
                    onChange={() => handlePreferenceChange('authorUpdates')}
                  />
                  <Form.Text className={theme === 'dark' ? 'text-light-muted' : 'text-muted'}>
                    Get notified when favorite authors release new books
                  </Form.Text>
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button 
                    variant={theme === 'dark' ? 'warning' : 'primary'} 
                    disabled={!emailUpdated}
                    onClick={saveEmailPreferences}
                  >
                    Save Preferences
                  </Button>
                  
                  <Button 
                    variant={theme === 'dark' ? 'outline-warning' : 'outline-secondary'}
                    onClick={handleSendTestEmail}
                  >
                    Send Test Email
                  </Button>
                </div>
              </Form>
            </div>
          </Tab>
        </Tabs>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default NotificationCenter; 